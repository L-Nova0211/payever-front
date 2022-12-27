import { AfterViewInit, Component, HostBinding, Input, OnDestroy, OnInit } from '@angular/core';
import { Select } from '@ngxs/store';
import Delta from 'quill-delta';
import { EMPTY, fromEvent, merge, Observable, ReplaySubject, Subject } from 'rxjs';
import {
  concatMap,
  delay,
  distinctUntilChanged,
  filter,
  map,
  mapTo,
  share,
  shareReplay,
  skipUntil,
  startWith,
  switchMap,
  switchMapTo,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  isIntegrationData,
  PebAction,
  PebEditorElementInteraction,
  PebEditorState,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  pebGenerateId,
  PebIntegrationDataType,
  PebLanguage,
  PebScreen,
  PebStylesheetEffect,
  PebTemplateEffect,
  PebTextVerticalAlign,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebAbstractElement, PebEditorOptions } from '@pe/builder-renderer';
import { PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebElementSelectionState } from '@pe/builder-state';
import { PebTextEditorService, PebTextStyles, TextEditorCommand } from '@pe/builder-text-editor';


@Component({ template: '' })
export abstract class PebAbstractTextElement extends PebAbstractElement implements OnInit, AfterViewInit, OnDestroy {

  @HostBinding('class.hovered') editorEnabled = false;

  content$ = new ReplaySubject<Delta>(1);
  contentChanges$ = new ReplaySubject<void>(1);

  content!: Delta;
  originalContent = new Delta();

  protected textEditorService = this.injector.get(PebTextEditorService);
  // protected rendererOptions: PebRendererOptions;
  protected setActive$ = new Subject<boolean>();
  protected editorState = this.injector.get(PebEditorState);
  protected editorRenderer = this.injector.get(PebEditorRenderer);
  protected editorStore = this.injector.get(PebEditorStore);
  protected width: number;
  protected height: number;
  protected originalWidth: number;
  protected originalHeight: number;
  protected originalVerticalAlign: PebTextVerticalAlign;
  protected setTextStyle$ = new Subject<Partial<PebTextStyles>>();
  protected editorAccessorService = this.injector.get(PebEditorAccessorService);

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  editorOptions: PebEditorOptions;

  readonly select$ = this.selectedElements$.pipe(
    filter(elements => !!elements),
    map(elements => elements.find(({ id = '' }) => id === this.element.id)),
    filter(element => !!element),
    distinctUntilChanged((a, b) => a.id !== b.id),
    shareReplay(1),
  );

  readonly deselect$ = this.select$.pipe(
    switchMapTo(this.selectedElements$),
    filter(elements => elements.length !== 1 || elements[0].id !== this.element.id),
    share(),
  );

  activate$ = merge(
    this.setActive$.pipe(filter(Boolean)),
    this.select$.pipe(
      delay(0),
      switchMapTo(fromEvent(this.nativeElement, 'click').pipe(
        skipUntil(fromEvent(this.nativeElement, 'mousedown')),
        take(1),
        takeUntil(this.deselect$),
      )),
    ),
  ).pipe(
    filter(() => !(isIntegrationData(this.data?.functionLink) &&
      this.data.functionLink.dataType === PebIntegrationDataType.Text)),
    mapTo(true),
    shareReplay(1),
  );

  deactivate$ = this.activate$.pipe(
    switchMap(() => merge(
      this.setActive$.pipe(filter(active => !active)),
      this.deselect$,
    )),
    mapTo(false),
    share(),
  );

  editorEnabled$ = merge(this.activate$, this.deactivate$).pipe(
    startWith(false),
    tap((enabled) => {
      if (enabled) {
        this.editorState.textEditorActive = this.textEditorService;

        return;
      }
      this.editorState.textEditorActive = null;
      this.textEditorService.dispatch(TextEditorCommand.clearHistory);
      this.textEditorService.setRedoStack([]);
      this.textEditorService.setUndoStack([]);
    }),
    shareReplay(1),
  );

  // @ts-ignore
  get options(): PebEditorOptions {
    return this.editorOptions;
  }

  @Input() set options(value: PebEditorOptions) {
    const options = this.editorOptions;
    const { screen, language } = value;

    /**
     * Important to trigger content changes before updating the rest or properties
     * to submit actions with correct screen/language in case if content is changed.
     */
    if (this.isContentChanged && (options?.screen !== screen || options?.language !== language)) {
      this.contentChanges$.next();
    }

    this.editorOptions = value;
    this.content = this.getTextContent();

    /** Store initial content and dimensions to check if they were changed before the submit action */
    this.width = this.styles.width;
    this.height = this.styles.height;
    this.originalWidth = this.styles.width;
    this.originalHeight = this.styles.height;
    this.originalVerticalAlign = this.verticalAlign;
    this.originalContent = new Delta(this.content);

    this.content$.next(this.content);
  }

  readonly textStyle$ = this.textEditorService.styles$.pipe(
    map((value) => {
      const styles =  { ...value, verticalAlign: this.verticalAlign };
      if (this.data?.linkInteraction) {
        return { ...styles, link: this.data.linkInteraction };
      }

      return styles;
    }),
  );

  abstract get verticalAlign(): PebTextVerticalAlign;

  get isContentChanged(): boolean {
    if (!this.content) {
      return false;
    }

    return this.originalContent.diff(this.content).length() > 0;
  }

  onTextChanged(delta: Delta) {
    this.data.text = { 
      ...this.data.text,
      ...{ [this.options.screen ?? PebScreen.Desktop]: { [this.options.language ?? PebLanguage.Generic] : delta } },
     };
    this.content = delta;
  }

  setTextStyle(value: Partial<PebTextStyles>): void {
    this.setTextStyle$.next(value);
  }

  activate(event?): void {
    this.setActive$.next(true);
    if (event) {
      this.textEditorService.setCursorPosition({ x: event.x, y: event.y });
    }
  }

  deactivate(): void {
    this.setActive$.next(false);
  }

  ngOnInit(): void {
    this.editorEnabled$.pipe(
      tap((enabled) => {
        this.editorEnabled = enabled;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.options$.pipe(
      tap((options) => {
        return this.options = options;
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngAfterViewInit(): void {
    const contextChanged$ = this.context$.pipe(
      tap(() => {
        const textContent = this.getTextContent();

        this.content$.next(textContent);
      })
    );

    const disableTextSelection$ = merge(
      this.editorState.interactionStart$.pipe(
        filter(type => type === PebEditorElementInteraction.Move),
        tap(() => {
          this.elementRef.nativeElement.classList.add('disable-text-selection');
        }),
      ),
      this.editorState.interactionCompleted$.pipe(
        filter(type => type === PebEditorElementInteraction.Move),
        tap(() => {
          this.elementRef.nativeElement.classList.remove('disable-text-selection');
        }),
      ),
    );

    const select$ = this.select$.pipe(
      map(element => this.editorRenderer.getElementComponent(element.id)),
      tap((elmCmp) => {
        this.textEditorService.selectElement(elmCmp);
      }),
    );

    const submit$ = merge(
      this.contentChanges$,
      merge(
        this.deactivate$,
        this.editorState.interactionStart$.pipe(filter(type => type === PebEditorElementInteraction.Resize)),
      ).pipe(
        filter(() => this.options && this.isContentChanged),
      ),
    ).pipe(
      concatMap(() => {
        const effects = this.effects;

        if (effects.length) {
          const action: PebAction = {
            effects,
            id: pebGenerateId('action'),
            targetPageId: this.editorStore.page.id,
            affectedPageIds: [this.editorStore.page.id],
            createdAt: new Date(),
          };

          return this.editorStore.commitAction(action);
        }

        return EMPTY;
      }),
      tap(() => {
        this.originalContent = new Delta(this.content);
      }),
    );

    const limits$ = this.textEditorService.dimensions$.pipe(
      withLatestFrom(this.textEditorService.limits$),
      tap(([{ width, height }, limits]) => {
        const textData = this.data?.text?.[this.options.screen] ?? {};
        const langCount = Object.keys(textData).length;
        const isGenericLanguageSet = textData[PebLanguage.Generic] !== undefined;
        const isLocaleLanguageSet = textData[this.options.language] !== undefined;

        const allowToShrink = langCount === 1 && isGenericLanguageSet
          || langCount === 2 && isGenericLanguageSet && isLocaleLanguageSet;
        const minWidth = allowToShrink ? this.styles.minWidth ?? 0 : this.originalWidth;
        const minHeight = allowToShrink ? this.styles.minHeight ?? 0 : this.originalHeight;

        this.width = Math.ceil(Math.max(minWidth, Math.min(width, limits.width)));
        this.height = Math.ceil(Math.max(minHeight, Math.min(height, limits.height)));

        this.styles.width = this.width;
        this.styles.height = this.height;
      }),
      takeUntil(this.destroy$),
    );

    /**
     * If element is in text mode and link present in styles
     * remove data.integrations otherwise set link to integrations
     * and remove any links from data.text in all languages
     * as integrations are not support languages.
     */
    const setTextStyle$ = this.setTextStyle$.pipe(
      withLatestFrom(this.editorEnabled$),
      tap(([value, editorEnabled]) => {
        if (editorEnabled) {
          if (value.link !== undefined && this.data?.linkInteraction !== undefined) {
            this.data = {
              ...this.data,
              linkInteraction: null,
            };
          }
          this.textEditorService.applyStyles(value);
        } else {
          const { link, ...styles } = value;
          if (link !== undefined) {
            this.data = {
              ...this.data,
              linkInteraction: link,
            };
            this.textEditorService.applyStyles({ ...styles, link: null });
          } else {
            const { textJustify: align, ...attributes } = styles;
            if (align) {
              (attributes as any).align = align;
            }
            const delta = new Delta(this.content.ops.map(op => ({
              ...op,
              attributes: {
                ...op.attributes,
                ...attributes,
              },
            })));
            this.content = delta;
            this.content$.next(delta);

            this.data.text = {
              ...this.data.text,
              ...{ [this.options.screen ?? PebScreen.Desktop]: { [this.options.language ?? PebLanguage.Generic]: delta } },
            };
          }
        }
      }),
    );

    const obs: Array<Observable<any>> = [
      select$,
      limits$,
      setTextStyle$,
      submit$,
      disableTextSelection$,
      contextChanged$,
    ];

    if (this.editorAccessorService.editorComponent) {
      const commands$ = this.editorAccessorService.editorComponent.commands$.pipe(
        withLatestFrom(this.editorEnabled$),
        filter(([, enabled]) => enabled),
        map(([command]) => command),
      );
      const undo$ = commands$.pipe(
        filter((command: any) => command.type === 'undo'),
        tap(() => this.textEditorService.dispatch(TextEditorCommand.undo)),
      );
      const redo$ = commands$.pipe(
        filter((command: any) => command.type === 'redo'),
        tap(() => this.textEditorService.dispatch(TextEditorCommand.redo)),
      );

      obs.push(undo$, redo$);
    }

    merge(...obs).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.isContentChanged) {
      this.contentChanges$.next();
    }
    super.ngOnDestroy();
  }

  get effects(): PebEffect[] {
    const textData = this.data?.text?.[this.options.screen] ?? {};
    const langCount = Object.keys(textData).length;
    /**
     * If only generic language in text data (e.g. from stored shapes)
     * we update it an also add language for current language.
     *
     * If only two, generic language and language for current language set
     * or if current language is same as default language
     * we update both languages, generic and current language.
     *
     * Otherwise update only current language.
     */
    const isDefaultLanguage = this.options.language === this.options.defaultLanguage;
    const isGenericLanguageSet = textData[PebLanguage.Generic] !== undefined;
    const isLocaleLanguageSet = textData[this.options.language] !== undefined;
    const updateGeneric = isDefaultLanguage
      || langCount === 1 && isGenericLanguageSet
      || langCount === 2 && isGenericLanguageSet && isLocaleLanguageSet;

    const text = { ...this.data?.text };
    const linkInteraction = this.data?.linkInteraction ? { ...this.data?.linkInteraction } : null;
    const content = { ...this.content };

    text[this.options.screen] = { ...text[this.options.screen], [this.options.language]: content };
    if (updateGeneric) {
      text[this.options.screen][PebLanguage.Generic] = this.content;
    }

    this.data.text = text;

    const effects: PebEffect[] = [];
    effects.push({
      type: PebTemplateEffect.PatchElement,
      target: `${PebEffectTarget.Templates}:${this.editorStore.page.templateId}`,
      payload: {
        id: this.element.id,
        data: { text, linkInteraction },
        type: this.element.type,
      },
    });

    const payload: { width?: number; height?: number } = {
      ...(this.width && this.originalWidth !== this.width ? { width: this.width } : undefined),
      ...(this.height && this.originalHeight !== this.height ? { height: this.height } : undefined),
      ...(this.originalVerticalAlign !== this.verticalAlign ? { verticalAlign: this.verticalAlign } : undefined),
    };

    if (Object.keys(payload).length > 0) {
      effects.push({
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${this.editorStore.page.stylesheetIds[this.options.screen]}`,
        payload: { [this.element.id]: payload },
      });
    }

    return effects;
  }
}
