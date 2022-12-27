import { AnimationBuilder } from '@angular/animations';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectorRef,
  ComponentFactoryResolver,
  Directive,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Inject,
  Injector,
  Input,
  OnDestroy,
  Optional,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
  ViewContainerRef,
  ViewRef,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { Select } from '@ngxs/store';
import { merge as lMerge } from 'lodash';
import Delta from 'quill-delta';
import { BehaviorSubject, combineLatest, EMPTY, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import {
  distinctUntilChanged,
  filter,
  first,
  map,
  shareReplay,
  skip,
  switchMap,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  cleanUpHtml,
  getLinkedValue,
  getPebInteraction,
  isIntegrationAction,
  isIntegrationData,
  isIntegrationInteraction,
  MediaType,
  PebContextFetcher,
  PebElementContext,
  PebElementContextState,
  PebElementDefData,
  PebElementStyles,
  PebElementType,
  PebIntegrationActionTag,
  PebIntegrationDataType,
  PebIntegrationInteraction,
  PebInteraction,
  pebInteractionCreator,
  PebInteractionType,
  PebInteractionWithPayload,
  PebLanguage,
  pebLinkDatasetLink,
  PebMotionEvent,
  PebMotionType,
  PebPageVariant,
  PebScreen,
} from '@pe/builder-core';
import { APP_TYPE, AppType } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { getPebAnimationTypeConfig, getPebMotionEventTypeConfig } from '../../animations/motion-utils';
import {
  GetComponentRegistryFunction,
  GetContextFunction,
  GetStylesheetFunction,
  RENDERER_GET_COMPONENT_REGISTRY,
  RENDERER_GET_CONTEXT,
  RENDERER_GET_STYLESHEET,
  RENDERER_INTERACTION_EMITTER,
  RENDERER_PEB_RENDERER,
} from '../../renderer.tokens';
import { PebRTree } from '../../root/renderer.component';
import { PebAbstractRenderer } from '../../shared/abstract.renderer';
import { PriceWithCurrencyPipe } from '../../shared/pipes/price-with-currency.pipe';
import { PebRendererChildrenSlot } from '../../shared/slots/children.slot';
import { PebEditorOptionsState } from '../../state';
import { rendererTranslate } from '../../utils';

import { PebAbstractStyledElement } from './abstract.styled-element';


@Directive()
export abstract class PebAbstractElement extends PebAbstractStyledElement implements OnDestroy {
  @Input() fetcher: PebContextFetcher;

  @Select(PebEditorOptionsState.state) options$!: Observable<any>;

  @Input() set context(value: PebElementContext<any>) {
    this._context = value;
    this.contextSubject$.next();
  }

  get context() {
    return this._context;
  }

  contextSubject$ = new ReplaySubject<void>(1);

  context$: Observable<PebElementContext<any>> = this.contextSubject$.pipe(
    map(() => this._context),
    shareReplay(1),
  )

  private _context: PebElementContext<any>;

  private stylesHandler: ProxyHandler<any> = {
    set: (obj, prop, value) => {
      if (obj[prop] !== value) {
        obj[prop] = value;
        this.styleSubject$.next();
      }

      return true;
    },
  };

  @Input() set styles(value: PebElementStyles) {
    this._styles = new Proxy({ ...value }, this.stylesHandler);
    this.styleSubject$.next();
  }

  get styles(): PebElementStyles {
    return this._styles;
  }

  private styleSubject$ = new ReplaySubject<void>(1);

  style$: Observable<any> = combineLatest([
    this.styleSubject$,
    this.options$.pipe(tap(options => this.options = options)),
  ]).pipe(
    map(() => ({ ...this.mappedStyles })),
    tap(({ host }) => {
      Object.assign(this.elementRef.nativeElement.style, host);
    }),
    shareReplay(1),
  );

  private _styles: PebElementStyles;

  private dataHandler: ProxyHandler<any> = {
    set: (obj, prop, value) => {
      if (obj[prop] !== value) {
        obj[prop] = value;
        this.dataSubject$.next();
      }

      return true;
    },
  };

  @Input() set data(value: PebElementDefData) {
    this._data = new Proxy({ ...value }, this.dataHandler);
    this.dataSubject$.next();
  }

  get data() {
    return this._data;
  }

  private dataSubject$ = new ReplaySubject<void>(1);

  data$: Observable<any> = this.dataSubject$.pipe(
    map(() => this._data),
    tap((data) => {
      const styleConditions = [
        'fullWidth',
        'functionLink',
        'source',
        'videoHeight',
        'videoObjectFit',
        'videoScale',
        'videoWidth',
      ];

      if (styleConditions.some(c => Object.keys(data).includes(c))) {
        this.styleSubject$.next();
      }

      const contextConditions = ['functionLink'];

      if (contextConditions.some(c => Object.keys(data).includes(c))) {
        this.contextSubject$.next();
      }
    }),
    shareReplay(1),
  )

  readonly isVideo$ = this.data$.pipe(
    map((data) => this.styles.mediaType === MediaType.Video ? data : null),
  );

  private _data: PebElementDefData;

  readonly destroy$: Subject<boolean> = new Subject<boolean>();

  private readonly actionAnimationStateSubject$ = new BehaviorSubject<string>(null);
  readonly actionAnimationState$  = this.actionAnimationStateSubject$.asObservable();
  private readonly checkActionAnimationState$ = new Subject<void>();

  @ViewChild(PebRendererChildrenSlot, { static: true, read: ViewContainerRef }) childrenSlot: ViewContainerRef;

  activate$?: Observable<boolean>;

  children: PebAbstractElement[] = [];
  viewRef: ViewRef;

  @HostListener('click', ['$event'])
  hostClick(e: Event): void {
    if (this.options.interactions) {
      const path = e.composedPath() as HTMLElement[];
      const linkNode = path.find(node =>
        node.hasAttribute?.(pebLinkDatasetLink.type));

      if (this.element.type !== PebElementType.Grid && (linkNode || this.element?.data?.linkInteraction)) {
        e.preventDefault();
        e.stopPropagation();

        let type;
        let payload;

        if (linkNode) {
          type = linkNode.getAttribute(pebLinkDatasetLink.type) as PebInteractionType;
          payload = { ...linkNode.dataset } as any;
        } else {
          type = this.element.data.linkInteraction.type;
          payload = this.element.data.linkInteraction.payload;
        }

        const interaction =
          type === PebInteractionType.NavigateInternal
            ? pebInteractionCreator.navigate.internal(payload.url)
            : type === PebInteractionType.NavigateExternal
              ? pebInteractionCreator.navigate.external(payload.url)
              : type === PebInteractionType.OverlayOpenPage
                ? pebInteractionCreator.navigate.overlay(payload.url)
                : pebInteractionCreator.navigate.mail(payload);

        if (interaction) {
          this.interact(interaction);
        } else {
          console.warn('There is no interaction creator for: ', this.data);
        }
      }

      if (isIntegrationInteraction(this.data?.functionLink)) {
        const interaction: PebIntegrationInteraction = this.data?.functionLink;

        if (interaction) {
          e.stopPropagation();

          this.interact(getPebInteraction(interaction, this));
        }
      } else if (isIntegrationData(this.data?.functionLink)) {
        const data = this.data?.functionLink;
        if (data?.dataType === PebIntegrationDataType.Submit) {
          let parent = this.parent as any;

          while (parent && parent?.data?.functionLink?.integration?.title !== 'auth') {
            parent = parent.parent;
          }
          if (parent?.submitForm) {
            e.stopPropagation();
            parent.submitForm();
          }
        }
      }

      let parent;

      if (this.element.parent) {
        parent = this.tree.find(this.element.parent.id)

        while (parent && parent.element.type !== PebElementType.Grid) {
          parent = parent.element.parent ? this.tree.find(parent.element.parent.id) : undefined;
        }
      }

      if (this.data?.linkInteraction?.type) {
        e.stopPropagation();

        if (this.data.linkInteraction.type !== PebInteractionType.OverlayOpenPage
          && parent?.element?.type !== PebElementType.Grid) {
          this.interact(this.data.linkInteraction);
        }
      } else if (this.context?.data?.products?.[0]?.slug || this.context?.data?.slug) {
        e.stopPropagation();

        this.interact(
          pebInteractionCreator.navigate.internalSpecial(
            PebPageVariant.Product,
            this.context?.data?.products?.[0]?.slug ?? this.context?.data?.slug,
            parent.element.type === PebElementType.Grid ? parent.data?.openInOverlay : this.data.openInOverlay
          ),
        );
      }

      if (this.element.motion?.buildIn?.event === PebMotionEvent.OnClick) {
        this.applyAnimation(this.element.motion.buildIn, PebMotionType.BuildIn);
      }
    }
  }


  constructor(
    @Optional() @Inject(RENDERER_INTERACTION_EMITTER)
    private interactionEmitter: EventEmitter<PebInteraction | PebInteractionWithPayload>,
    @Optional() @Inject(RENDERER_GET_STYLESHEET)
    private getRendererStylesheet: GetStylesheetFunction,
    @Optional() @Inject(RENDERER_GET_CONTEXT)
    private getRendererContext: GetContextFunction,
    @Optional() @Inject(RENDERER_GET_COMPONENT_REGISTRY)
    public getRendererComponentRegistry: GetComponentRegistryFunction,
    @Optional() @Inject(RENDERER_PEB_RENDERER)
    public pebRenderer: PebAbstractRenderer,
    @Optional() @Inject(APP_TYPE) private appType,
    elementRef: ElementRef,
    renderer: Renderer2,
    injector: Injector,
    public sanitizer: DomSanitizer,
    animationBuilder: AnimationBuilder,
    protected cfr: ComponentFactoryResolver,
    protected matIconRegistry: MatIconRegistry,
    protected translateService: TranslateService,
    @Inject(PLATFORM_ID) protected platformId: string,
    protected httpClient: HttpClient,
    private readonly tree: PebRTree<PebAbstractElement>,
    // dev
    cdr: ChangeDetectorRef,
    protected priceWithCurrencyPipe: PriceWithCurrencyPipe,
  ) {
    super(injector, elementRef, renderer, cdr, animationBuilder);

    const actionAnimation$ = this.actionAnimationState$.pipe(
      filter(() => this.options?.interactions),
      distinctUntilChanged(),
      filter(state => !!state && !!this.element.motion?.action),
      map((state) => {
        const animation = this.element.motion.action;
        const animationTypeConfig = getPebAnimationTypeConfig(animation.type);
        const actionAnimation = animationTypeConfig?.animationStatesMatcher?.[state];

        return { animation, actionAnimation };
      }),
      filter(({ actionAnimation }) => !!actionAnimation),
      shareReplay(1),
    );

    merge(
      actionAnimation$.pipe(
        first(),
        map(({ animation, actionAnimation }) => ({ animation, actionAnimation, duration: 0 })),
      ),
      actionAnimation$.pipe(
        skip(1),
        map(({ animation, actionAnimation }) => ({ animation, actionAnimation, duration: animation.duration })),
      ),
    ).pipe(
      switchMap(({ animation, actionAnimation, duration }) =>
        this.applyAnimation(
          lMerge({}, animation, actionAnimation.animation),
          actionAnimation.motionType,
          { duration },
        ),
      ),
      takeUntil(this.destroy$),
    ).subscribe();

    this.checkActionAnimationState$.pipe(
      switchMap(() => {
        const action = this.element.motion?.action;
        if (this.options?.interactions && action?.event && action.eventType) {
          const eventTypeConfig = getPebMotionEventTypeConfig(action.eventType);

          return  eventTypeConfig?.getAnimationState(this).pipe(
            tap(state => this.actionAnimationStateSubject$.next(state)),
            takeUntil(this.destroy$),
          );
        }

        return EMPTY;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroy$.next(true);
    this.destroy$.complete();
  }

  destroy(): void {
    this.viewRef.destroy();
    this.tree.remove(this);
  }

  get parent() {
    return this.tree.find(this.element.parent?.id);
  }

  get rendererStylesheet() {
    return this.getRendererStylesheet();
  }

  get rendererContext() {
    return this.getRendererContext();
  }

  get isParent(): boolean {
    return [
      PebElementType.Document,
      PebElementType.Section,
    ].includes(this.element.type);
  }

  get isMailView(): boolean {
    return this.appType && this.appType === AppType.Mail;
  }

  detectChanges() {
    this.wrapperCmp?.instance.cdr?.detectChanges();
    this.cdr.detectChanges();
  }

  /**
   * Next places should be checked in the order:
   * - data.text[options.screen][options.locale]
   * - data.text[options.screen][PebLanguage.Generic]
   * - data.text[PebScreen.Desktop][options.locale]
   * - data.text[PebScreen.Desktop][PebLanguage.Generic]
   */
  getTextContent(): Delta {
    const { screen, language } = this.options;

    const text = this.data?.text?.[screen]?.[language]
      ?? this.data?.text?.[screen]?.[PebLanguage.Generic]
      ?? this.data?.text?.[PebScreen.Desktop]?.[language]
      ?? this.data?.text?.[PebScreen.Desktop]?.[PebLanguage.Generic];

    if (this.data?.functionLink && isIntegrationData(this.data.functionLink)) {
      const { integration, ...data } = this.data.functionLink;

      if (integration
        && [
          PebIntegrationDataType.Text,
          PebIntegrationDataType.ImageUrl,
        ].includes(data.dataType as PebIntegrationDataType)
      ) {
        const attributes = { ...text?.ops?.[0]?.attributes };
        const { align } = text?.ops?.[1]?.attributes ?? {};

        if (align) {
          attributes.align = align;
        }

        return new Delta([
          { insert: this.integrationText, ...(attributes ? { attributes } : undefined) },
          ...[align ? { insert: '\n', attributes: { align } } : { insert: '\n' }],
        ]);
      }
    }

    if (this.element.type === PebElementType.Grid
      && isIntegrationAction(this.data?.functionLink)
      && this.data.functionLink.tags?.includes(PebIntegrationActionTag.GetCategoriesByProducts)
    ) {
      const { textJustify, ...attributes } = text?.ops?.[0]?.attributes ?? {};
      const attributesAlign = {
        ...attributes,
        ...(textJustify && { align: textJustify }),
      };

      return new Delta([{ ...(attributes ? { attributes: attributesAlign } : undefined) }]);
    }

    if (text) {
      return new Delta(text);
    }

    return new Delta([
      { insert: '' },
      { insert: '\n' },
    ]);
  }

  get integrationText(): string {
    if (isIntegrationData(this.data.functionLink)) {
      const property = (this.data.functionLink as any)?.property;
      const context = property === 'imagesUrl.0'
        ? this.context?.data?.imagesUrl?.[0]
        : this.context?.data?.[property];

      if (this.context?.state === PebElementContextState.Ready && context) {
        return property !== 'imagesUrl.0' ? context.toString() : '';
      }

      const { integration, ...data } = this.data.functionLink;

      if (this.options.readOnly) {
        const contextData: PebElementContext<any> =
          this.rendererContext[`@${integration?.tag}-${data?.contextIntegration}`];

        if (data.dataType === PebIntegrationDataType.ImageUrl) {
          return '';
        }

        if (contextData?.state === PebElementContextState.Ready) {
          const value = getLinkedValue(contextData.data, data.property);

          if (value && this.priceWithCurrencyPipe && data.property === 'priceAndCurrency') {
            const [currencyCode, price = -1] = value.split(' ');

            return `${currencyCode} ${this.priceWithCurrencyPipe.transform(Number(price), currencyCode, false)}`;
          }

          return cleanUpHtml(value);
        }

        return '';
      }

      return `${integration.title} - ${this.translate(data.title)}`;
    }

    return '';
  }

  checkActionAnimationState(): void {
    this.checkActionAnimationState$.next();
  }

  interact<P>(interaction: PebInteraction | PebInteractionWithPayload<P>) {
    this.interactionEmitter.emit(interaction);
  }

  interactionSubscription(
    interactionType: PebInteractionType | string,
  ): Observable<PebInteraction | PebInteractionWithPayload> {
    return this.interactionEmitter.pipe(
      filter(interaction => interaction.type === interactionType),
      takeUntil(this.destroy$),
    );
  }

  @HostBinding(`attr.peb-id`)
  get attrElementId() {
    return this.element.id;
  }

  @HostBinding('class.has-interactions')
  get classHasInteractions(): boolean {
    const functionLink = this.data?.functionLink as any;

    return Boolean(this.options.interactions
      && (
        this.data?.linkInteraction
        || isIntegrationInteraction(this.data?.functionLink)
        || functionLink?.dataType === PebIntegrationDataType.Submit
      ));
  }

  @HostBinding('class.interactions')
  get classInteractions(): boolean {
    return this.options.interactions;
  }

  protected translate(value: string): string {
    return rendererTranslate(value, this.options, this.translateService);
  }
}
