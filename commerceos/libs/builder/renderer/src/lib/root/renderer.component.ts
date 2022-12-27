import { isPlatformBrowser } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ComponentFactory,
  ComponentFactoryResolver,
  ComponentRef,
  ElementRef,
  EventEmitter,
  Inject,
  Injectable,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  PLATFORM_ID,
  SimpleChanges,
  Type,
  ViewChild,
  ViewContainerRef,
} from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { pick } from 'lodash';
import RBush, { BBox } from 'rbush';
import { BehaviorSubject, forkJoin, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, map, mapTo, shareReplay, tap } from 'rxjs/operators';

import {
  MOTION_TYPE,
  PebAnimation,
  PebBuildInAnimationType,
  PebContext,
  PebElementContext,
  PebElementDef,
  PebElementId,
  PebElementStyles,
  PebElementType,
  PebInteraction,
  PebInteractionWithPayload,
  PebLanguage,
  PebLanguagesData,
  PebMotion,
  PebMotionEvent,
  PebScreen,
  pebScreenContentWidthList,
  pebScreenDocumentWidthList,
  PebStylesheet,
} from '@pe/builder-core';
import { DEFAULT_LOCALE, langList, TranslationLoaderService } from '@pe/i18n-core';

import { PebAbstractElement } from '../elements/_abstract/abstract.element';
import {
  ELEMENT_FACTORIES,
  RENDERER_GET_COMPONENT_REGISTRY,
  RENDERER_GET_CONTEXT,
  RENDERER_GET_STYLESHEET,
  RENDERER_INTERACTION_EMITTER,
  RENDERER_PEB_RENDERER,
} from '../renderer.tokens';
import { PebRendererOptions } from '../renderer.types';
import { PebAbstractRenderer } from '../shared/abstract.renderer';
import { PebRendererChildrenSlot } from '../shared/slots/children.slot';
import { PebEditorOptionsState } from '../state';


export interface PebRendererElementDef {
  id: PebElementId;
  type: PebElementType;
  styles: PebElementStyles;
  parent: {
    id: PebElementId,
    slot: string | number, // number??
    type: PebElementType,
    // order: number,
  };
  data?: {
    [key: string]: any;
  };
  meta?: {
    deletable: boolean;
  };
  index?: number;
  motion?: PebMotion;
  context?: PebElementContext<any>;
  children?: PebRendererElementDef[];
}

export type ElementFactories = {
  [key in PebElementType]: Type<PebAbstractElement>;
};

export type ElementsRegistry = Map<PebElementId, PebRendererElementDef>;

export type ComponentsRegistry = Map<PebElementId, ComponentRef<PebAbstractElement>>;

const rendererI18nDomains = ['renderer'];

@Component({
  selector: 'peb-renderer',
  templateUrl: './renderer.component.html',
  styleUrls: [
    './renderer.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebRenderer implements OnInit, OnChanges, OnDestroy, PebAbstractRenderer {

  @Select(PebEditorOptionsState.state) options$!: Observable<any>;
  @Select(PebEditorOptionsState.scale) scale$!: Observable<number>;
  @Select(PebEditorOptionsState.scaleToFit) scaleToFit$!: Observable<boolean>;

  @Input() screen: PebScreen;
  @Input() element: PebElementDef;
  @Input() stylesheet: PebStylesheet;

  @Input() set context(value: PebContext) {
    this._context = value;
    this.contextSubject$.next();
  }

  get context() {
    return this._context;
  }

  contextSubject$ = new ReplaySubject<void>(1);

  context$: Observable<PebContext> = this.contextSubject$.pipe(
    map(() => this._context),
    shareReplay(1),
  )

  private _context: PebContext;

  @Input() options: PebRendererOptions = {
    screen: PebScreen.Desktop,
    scale: 1,
    locale: PebLanguage.English,
    defaultLocale: PebLanguage.English,
    interactions: false,
    contentDocument: isPlatformBrowser(this.platformId) ? document : null,
    readOnly: false,
  };

  @Input('options.scale')
  set optionsScale(scale: number) {
    this.options = { ...this.options, scale };
  }

  @Input('options.screen')
  set optionsScreen(screen: PebScreen) {
    this.options = { ...this.options, screen };
  }

  @Input('options.locale')
  set optionsLocale(locale: PebLanguage) {
    this.options = { ...this.options, locale };
  }

  @Input('options.defaultLocale')
  set optionsDefaultLocale(defaultLocale: PebLanguage) {
    this.options = { ...this.options, defaultLocale };
  }

  @Input('options.interactions')
  set optionsInteractions(interactions: boolean) {
    this.options = { ...this.options, interactions };
  }

  @Input() preview: boolean;

  @Input('options.readOnly')
  set optionsReadOnly(readOnly: boolean) {
    this.options = { ...this.options, readOnly };
  }

  @Output() readonly rendered = new EventEmitter<any>();
  @Output() readonly interacted = new EventEmitter<PebInteractionWithPayload | PebInteraction>();

  @ViewChild(PebRendererChildrenSlot, { read: ViewContainerRef }) contentSlot: ViewContainerRef;
  @ViewChild('hitArea', { read: ElementRef }) hitArea: ElementRef;

  readonly destroyed$ = new Subject<void>();

  instances = [];

  private readonly loadedTranslations: { [key: string]: boolean } = {};

  private elementsRegistry: ElementsRegistry = new Map();
  public componentsRegistry: ComponentsRegistry = new Map();
  private fetchersRegistry = new Map();
  private sectionOrder: { [sectionId: string]: number } = {};

  factories: { [key in PebElementType]?: ComponentFactory<PebAbstractElement> } = {};

  transform$ = this.scale$.pipe(
    map(scale => `scale(${Math.max(1, 1 / scale)})`),
  );

  constructor(
    private elementRef: ElementRef,
    private injector: Injector,
    private cfr: ComponentFactoryResolver,
    public cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: string,
    @Inject(ELEMENT_FACTORIES) private elementFactories: any,
    private store: Store,
    private translationLoaderService: TranslationLoaderService,
    private tree: PebRTree<PebAbstractElement>,
  ) {
  }

  ngOnInit(): void {
    Object.entries<Type<PebAbstractElement>>(this.elementFactories).forEach(([type, elm]) => {
      this.factories[type] = this.cfr.resolveComponentFactory(elm);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (!this.preview) {
      this.instances = [];
      this.tree.clear();
    }
    this.prepareElementsAndRenderDocument();
  }

  ngOnDestroy() {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  get registry() {
    return {
      get: (id: string) => this.componentsRegistry.get(id)?.instance,
      queryAll: (predicate: (el: PebAbstractElement) => boolean) => {
        return Array.from(this.componentsRegistry).map(v => v[1].instance).filter(predicate);
      },
    };
  }

  get elementRegistry() {
    return {
      get: (id: string) => this.elementsRegistry.get(id) ?
        this.elementNodeToElement(this.elementsRegistry.get(id)) : null,
    };
  }

  get nativeElement(): HTMLElement {
    return this.elementRef.nativeElement;
  }

  get contentDocument(): Document {
    return this.options.contentDocument;
  }

  private loadTranslations(languages: PebLanguage[]): Promise<any> {
    const { locales } = languages.reduce(
      (acc, lang) => {
        const langData = PebLanguagesData[lang];
        const locale = langList[langData?.shortName] ? langData.shortName : DEFAULT_LOCALE;
        if (!acc.dict[locale] && !this.loadedTranslations[locale]) {
          acc.dict[locale] = true;
          acc.locales.push(locale);
        }

        return acc;
      },
      { locales: [], dict: {} },
    );

    return locales.length ?
      forkJoin(locales.map(l => this.loadTranslation(l))).toPromise() :
      Promise.resolve();
  }

  private loadTranslation(locale: string): Observable<any> {
    return this.translationLoaderService.loadTranslations(rendererI18nDomains, locale).pipe(
      tap(() => this.loadedTranslations[locale] = true),
      catchError(() => of(true)),
    );
  }

  prepareElementsAndRenderDocument = async (init = false) => {
    if (this.element && this.context) {
      await Promise.all([
        this.loadTranslations([this.options.locale, this.options.defaultLocale]),
        init ? this.loadTranslation(DEFAULT_LOCALE).toPromise() : Promise.resolve(),
      ]);
      this.renderDocument();
    }
  }

  renderElement = (
    elementDef: PebRendererElementDef,
    elViewInjector: Injector,
  ): ComponentRef<PebAbstractElement> => {
    if (elementDef.type === PebElementType.Grid) {
      elementDef.children = elementDef.children.slice(0, elementDef.data.colCount * elementDef.data.rowCount);
    }
    const cmpRef = this.createElement(elementDef, elViewInjector);
    const slot = cmpRef.instance.childrenSlot;

    if (slot) {
      cmpRef.instance.checkActionAnimationState();
      cmpRef.instance.children = elementDef.children.map((childDef) => {
        const childCpRef = this.renderElement(childDef, elViewInjector);

        slot.insert(childCpRef.hostView);
        childCpRef.instance.viewRef = childCpRef.hostView;

        return childCpRef.instance;
      });
    }

    return cmpRef;
  }

  createElement = (elementDef: PebRendererElementDef, elViewInjector: Injector): ComponentRef<PebAbstractElement> => {
    /** migration to remove duplicates */
    // if (this.componentsRegistry.has(elementDef.id)) {
    //   const cmpRef = this.componentsRegistry.get(elementDef.id);
    //   Object.assign(cmpRef.instance, {
    //     styles: elementDef.styles || {},
    //     options: { ...this.options },
    //   });
    //
    //   return cmpRef;
    // }

    const elViewFactory = this.factories[elementDef.type];
    const elCmpRef = elViewFactory.create(elViewInjector);

    const properties = {
      element: elementDef,
      data: elementDef.data || {},
      styles: elementDef.styles || {},
      context: elementDef.context || null,
      fetcher: this.fetchersRegistry.get(elementDef.id),
      options: { ...this.options },
    };

    Object.assign(elCmpRef.instance, properties);

    if (this.options.interactions) {
      elCmpRef.instance.applyBuildInAnimation();
    }

    const index = this.instances.findIndex(instance => instance.element.id === elCmpRef.instance.element.id);

    if (index === -1) {
      this.instances.push(elCmpRef.instance);
    } else {
      const item = this.tree.find(elementDef.id);

      if (item) {
        this.tree.remove(item);
        elCmpRef.instance.viewRef = elCmpRef.hostView;
        this.tree.insert(elCmpRef.instance);
      }

      this.instances[index] = elCmpRef.instance;
    }

    this.elementsRegistry.set(elementDef.id, elementDef);
    this.componentsRegistry.set(elementDef.id, elCmpRef);

    return elCmpRef;
  }

  renderDocument = () => {
    console.log('RENDER DOCUMENT');
    const s = performance?.now();
    this.fetchersRegistry = new Map();
    const newTree = this.createDocumentTree(this.element);
    this.componentsRegistry = new Map();
    this.elementsRegistry = this.createDocumentRegistry(newTree);

    const elViewInjector = this.createElementInjector();
    const documentDef = this.elementsRegistry.get(this.element.id);
    const document = this.renderElement(documentDef, elViewInjector);

    this.contentSlot.clear();
    this.contentSlot.insert(document.hostView);

    document.changeDetectorRef.detectChanges();

    if (!this.preview) {
      this.tree.load(this.instances);
    }

    this.rendered.emit(this.registry);

    console.log(`RENDERED IN: ${((performance?.now() - s) / 1000).toFixed(2)}s`);
  }

  private getComponentParent = (component: PebAbstractElement): PebAbstractElement => {
    const elementDef = this.elementsRegistry.get(component.element.id);
    const parentId = elementDef?.parent?.id;

    return this.componentsRegistry.get(parentId)?.instance;
  }

  private getComponentChildren = (component: PebAbstractElement): PebAbstractElement[] => {
    const elementDef = this.elementsRegistry.get(component.element.id);

    return elementDef?.children?.map(child => this.componentsRegistry.get(child.id)?.instance) ?? [];
  }

  private createDocumentTree(
    element: PebElementDef,
    parent: PebRendererElementDef = null,
  ): PebRendererElementDef {
    const elementStyles = this.stylesheet?.[element?.id];

    if (!element || !element.type || !elementStyles || elementStyles.display === 'none') {
      return undefined;
    }

    const elementComponent = this.factories[element.type] as any;

    if (!elementComponent) {
      throw new Error(`
        There is no element component for element
        id: ${element.id}
        type: ${element.type}
      `);
    }

    const elementContext = elementComponent.contextFetcher && elementComponent.contextFetcher instanceof Function
      ? { data: elementComponent.contextFetcher(this.context, element), fetcher: null }
      : this.context[element.id];

    this.fetchersRegistry.set(element.id, elementContext?.fetcher);
    const elementDef: PebRendererElementDef = {
      index: element.index,
      id: element.id,
      type: element.type,
      meta: element.meta,
      motion: element.motion,
      parent: parent ? {
        id: parent.id,
        slot: elementStyles.slot || 'host',
        type: parent.type,
      } : null,
      children: [],
      styles: this.stylesheet?.[element.id] ?? {},
      ...(element.data ? { data: element.data } : {}),
      ...(elementContext ? { context: elementContext.data } : {}),
    };


    if (elementDef.type === PebElementType.Document) {
      element.children = element.children.map((child, index) => {
        child.index = index;

        return child;
      });
    }

    let childrenShown = element.children && element.children
    .filter(child => this.stylesheet?.[child?.id] && this.stylesheet?.[child.id]?.display !== 'none');

    if (childrenShown) {
      if (elementDef.type === PebElementType.Document) {
        /** Remove duplicated sections, probably due failed actions */
        childrenShown = childrenShown.reduce((acc, elm) => {
          if (!acc.some(e => elm.id === e.id)) {
            acc.push(elm);
          }

          return acc;
        }, []);

        childrenShown.sort((a, b) => a.index - b.index);
      }

      elementDef.children = childrenShown.map((child) => {
        return this.createDocumentTree(child, elementDef);
      });
    }

    return elementDef;
  }

  private createDocumentRegistry(
    element: PebRendererElementDef,
    registry: ElementsRegistry = null,
  ): ElementsRegistry {
    const nextRegistry = registry || new Map();

    nextRegistry.set(element?.id, element);

    if (element?.children) {
      element.children.forEach(child => this.createDocumentRegistry(child, nextRegistry));
    }

    return nextRegistry;
  }

  createElementInjector = () => {
    return Injector.create({
      providers: [
        {
          provide: RENDERER_INTERACTION_EMITTER,
          useValue: this.interacted,
        },
        {
          provide: RENDERER_GET_STYLESHEET,
          useValue: () => this.stylesheet ?? {},
        },
        {
          provide: RENDERER_GET_CONTEXT,
          useValue: () => this.context,
        },
        {
          provide: RENDERER_GET_COMPONENT_REGISTRY,
          useValue: (elementId: string) => this.componentsRegistry.get(elementId),
        },
        {
          provide: RENDERER_PEB_RENDERER,
          useValue: this,
        },
      ],
      parent: this.injector,
    });
  }

  private elementNodeToElement(elementNode: PebRendererElementDef): PebRendererElementDef {
    return pick(
      elementNode,
      ['id', 'type', 'data', 'meta', 'children', 'motion', 'parent', 'index'],
    ) as PebRendererElementDef;
  }

  /** Animation */
  private firstHideMotion(element: PebElementDef): boolean {
    if (this.preview) {
      const buildIn = element.motion?.buildIn;

      return !!buildIn && buildIn.type !== PebBuildInAnimationType.None && buildIn.event !== PebMotionEvent.OnLoad;
    }

    return false;
  }

  getOnEventMotionElements(section: PebAbstractElement, eventType: PebMotionEvent) {
    const elements = section.children?.
      filter(el => el.element.motion)?.
      reduce((acc, el) => {
        const onclickAnimations = Object.entries(el.element.motion)
          .filter(([_, animation]) => animation && animation.type !== 'NONE' && animation.event === eventType);
        onclickAnimations.forEach(([motionType, a]) => acc.push({ motionType, element: el, animation: a }));

        return acc;
      }, [])
      ?.sort((a1, a2) => a1.animation.order - a2.animation.order);

    return elements;
  }

  applyAnimation(event: string, section: PebAbstractElement) {
    const elements = this.getOnEventMotionElements(
      section,
      PebMotionEvent.OnClick,
    );
    const order = this.sectionOrder[section.element.id] ?? 0;
    if (order >= elements?.length) {return;}
    const element: PebAbstractElement = elements[order]?.element;
    const animation: PebAnimation = elements[order]?.animation;
    const type = elements[order]?.motionType;
    if (animation) {
      element.applyAnimation(animation, MOTION_TYPE[type]);
      this.sectionOrder[section.element.id] = order + 1;
    }
  }

  applyBuildOutAnimation(): Observable<void> {
    const animations$ = [];
    this.componentsRegistry.forEach((cmp) => {
      animations$.push(cmp.instance.applyBuildOutAnimation());
    });

    return forkJoin(animations$).pipe(mapTo(null));
  }
}

@Injectable({ providedIn: 'root' })
export class PebRTree<T extends PebAbstractElement> extends RBush<T> {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  screen: PebScreen;

  data: {
    children: T[],
    height: number,
    leaf: boolean,
    maxX: number,
    maxY: number,
    minX: number,
    minY: number,
  };

  readonly sections$ = new BehaviorSubject<BBox[]>([]);
  private sections: Map<string, number>;
  elements: Map<string, T>;

  constructor() {
    super(9);
    /** Initialize Properties not derived from base constructor */
    this.sections = new Map<string, number>();
    this.elements = new Map<string, T>();

    this.screen$.pipe(
      tap((screen) => {
        this.screen = screen;
      }),
    ).subscribe();
  }

  /** Important to have methods as arrow function cos rBush losing context */
  find = (id: string): T | undefined => {
    return this.elements.get(id);
  }

  load = (items: ReadonlyArray<T>): RBush<T> => {
    items.forEach((item) => {
      this.elements.set(item.element.id, item);
    });

    super.load(items);

    this.updateSections();
    this.sections$.next([...this.sections.keys()].map(id => this.toBBox(this.elements.get(id))));

    return this;
  }

  insert = (item: T): RBush<T> => {
    this.elements.set(item.element.id, item);
    super.remove(item);
    super.insert(item);
    if (item.element.type === PebElementType.Section) {
      this.updateSections();
      this.sections$.next([...this.sections.keys()].map(id => this.toBBox(this.elements.get(id))));
    }

    return this;
  }

  remove = (item: T, equals?: (a: T, b: T) => boolean): RBush<T> => {
    this.elements.delete(item.element.id);
    super.remove(item, equals);
    if (item.element.type === PebElementType.Section) {
      this.updateSections();
      this.sections$.next([...this.sections.keys()].map(id => this.toBBox(this.elements.get(id))));
    }

    return this;
  }

  clear = (): RBush<T> => {
    this.sections?.clear();
    this.sections$.next([]);
    this.elements?.clear();
    super.clear();

    return this;
  }

  toBBox = (item: T): BBox => {
    if (!this.sections.size) {
      this.updateSections();
    }

    if (item.element.type === PebElementType.Document) {
      return {
        minX: Number.NEGATIVE_INFINITY,
        minY: Number.NEGATIVE_INFINITY,
        maxX: Number.POSITIVE_INFINITY,
        maxY: Number.POSITIVE_INFINITY,
      };
    }

    if (item.element.type === PebElementType.Section) {
      const y = this.sections.get(item.element.id) ?? 0;

      return {
        minX: 0,
        minY: y,
        maxX: pebScreenDocumentWidthList[this.screen],
        maxY: y + (item.styles.height ?? 0),
      };
    }

    let { width, height } = item.styles;
    let { top, left } = item.styles;

    const getCellDimensions = (element: PebAbstractElement, item: PebAbstractElement) => {
      const columns = parseGridTemplate(element.styles.gridTemplateColumns);
      const rows = parseGridTemplate(element.styles.gridTemplateRows);
      const index = item.element.index;
      const column = index % columns.length;
      const row = Math.floor(index / columns.length);

      return {
        cellLeft: columns[column][0],
        cellTop: rows[row][0],
        cellWidth: columns[column][1],
        cellHeight: rows[row][1],
      }
    }

    if (item.element.parent?.type === PebElementType.Grid) {
      const element = this.elements.get(item.element.parent.id);
      const { cellLeft, cellTop, cellWidth, cellHeight } = getCellDimensions(element, item);

      left = cellLeft;
      top = cellTop;
      width = cellWidth;
      height = cellHeight;
    }

    let parent = this.elements.get(item.element.parent?.id);
    while (parent && parent.element.type !== PebElementType.Document) {
      if (this.sections.has(parent.element.id)) {
        top = top + this.sections.get(parent.element.id);
        left += (pebScreenDocumentWidthList[this.screen] - pebScreenContentWidthList[this.screen]) / 2;
      } else {
        if (parent.parent?.element.type === PebElementType.Grid) {
          const { cellTop, cellLeft } = getCellDimensions(parent.parent, parent);

          top = top + cellTop;
          left = left + cellLeft;
        } else {
          top = top + parent.styles.top;
          left = left + parent.styles.left;
        }
      }
      parent = this.find(parent.element.parent?.id);
    }

    return { minX: left, minY: top, maxX: left + width, maxY: top + height };
  }

  private updateSections = (): void => {
    let y = 0;
    const sections = Array.from(this.elements.values()).filter(elm => elm.element.type === PebElementType.Section);

    this.sections = sections
    .sort((a, b) => a.element.index - b.element.index)
    .reduce((acc, elm) => {
      acc.set(elm.element.id, y);
      y += (elm.styles.height ?? 0);

      return acc;
    }, new Map<string, number>());
  }
}


export function parseGridTemplate(value: number[]): Array<[number, number]> {
  return value.reduce((acc, v, i, arr) => {
    acc.push([arr.slice(0, i).reduce((a, b) => a + b, 0), v]);

    return acc;
  }, []);
}
