import { Injectable, OnDestroy } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { merge as lMerge, omit } from 'lodash';
import { BehaviorSubject, EMPTY, from, iif, Observable, of, Subject, timer } from 'rxjs';
import { map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import {
  applyIdsMapForPage,
  generateUniqueIdsForPage,
  HandlerStateEffect,
  migrations,
  PebAction,
  PebAppendElementPayload,
  PebContext,
  PebContextSchema,
  PebContextSchemaEffect,
  pebCreateEmptyPage,
  PebEditorState,
  PebEffect,
  PebEffectTarget,
  PebElementDef,
  PebElementId,
  PebElementKit,
  PebElementTransformationDeep,
  PebElementType,
  pebForEachObjectWithChildrenDeep,
  pebGenerateId,
  pebMapElementDeep,
  PebMasterElementIdMap,
  PebMotion,
  PebPageEffect,
  PebPageId,
  PebPageShort,
  PebPageType,
  PebPageVariant,
  PebScreen,
  pebScreenDocumentWidthList,
  PebShop,
  PebShopData,
  PebShopEffect,
  PebShopRoute,
  PebStylesheet,
  PebStylesheetEffect,
  PebTemplateEffect,
  PebTheme,
  PebThemeApplicationInterface,
  PebThemeDetailInterface,
  PebThemePageInterface,
  PebThemeShortPageInterface,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import {
  PebAbstractElement,
  PebDefaultLanguageAction,
  PebEditorOptions,
  PebEditorOptionsState,
  PebRTree,
} from '@pe/builder-renderer';

import { PebActionType, pebCreateAction } from './action-creator.service';
import { PebActionResponse, PebElementsClipboard, PebPasteElement } from './interfaces';
import { PebEditorThemeService } from './theme.service';


@Injectable()
export class PebEditorStore implements OnDestroy {

  @Select(PebEditorOptionsState.state) state$!: Observable<PebEditorOptions>;

  screen: PebScreen;
  defaultScreen: PebScreen;

  readonly copiedElementsSubject$ = new BehaviorSubject<PebElementsClipboard>(null);
  readonly copiedElements$ = this.copiedElementsSubject$.asObservable();

  readonly lastActivePages = {
    [PebPageType.Master]: null,
    [PebPageType.Replica]: null,
  };

  private readonly destroyedSubject$ = new Subject();
  readonly destroyed$ = this.destroyedSubject$.asObservable();

  public readonly versionUpdatedSubject$ = new Subject();
  readonly versionUpdated$ = this.versionUpdatedSubject$.asObservable();

  private readonly actionCommittedSubject$ = new Subject<void>();
  readonly actionCommitted$ = this.actionCommittedSubject$.asObservable();

  readonly activePageId$: Observable<PebPageId> = this.themeService.page$.pipe(
    map(page => page?.id ?? null),
  );

  readonly lastActionId$ = this.themeService.lastActionId$;

  get lastActionId() {
    return this.lastActionId;
  }

  readonly lastPublishedActionId$ = this.themeService.lastPublishedActionId$;

  isTemplateEffect = (effect: any): effect is PebEffect<PebTemplateEffect> => {
    return Object.values(PebTemplateEffect).includes(effect.type);
  }

  isStylesheetEffect = (effect: any): effect is PebEffect<PebStylesheetEffect> => {
    return Object.values(PebStylesheetEffect).includes(effect.type);
  }

  constructor(
    private themeService: PebEditorThemeService,
    private api: PebEditorApi,
    private state: PebEditorState,
    private renderer: PebEditorRenderer,
    private store: Store,
    private readonly tree: PebRTree<PebAbstractElement>,
  ) {
    (window as any).pebEditorStore = this;

    this.state$.pipe(
      tap(({ screen, defaultScreen }) => {
        this.screen = screen;
        this.defaultScreen = defaultScreen;
      }),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy() {
    this.destroyedSubject$.next(true);
    this.destroyedSubject$.complete();
  }

  get availableLanguages() {
    return this.themeService.snapshot?.application?.data?.languages;
  }

  get theme$(): Observable<PebTheme> {
    return this.themeService.theme$;
  }

  get theme(): PebTheme {
    return this.themeService.theme;
  }

  set snapshot(snapshot: PebThemeDetailInterface) {
    this.themeService.snapshot = snapshot;
  }

  get snapshot(): PebThemeDetailInterface {
    return this.themeService.snapshot;
  }

  get snapshot$(): Observable<PebThemeDetailInterface> {
    return this.themeService.snapshot$;
  }

  get pages(): { [id: string]: PebThemePageInterface } {
    return this.themeService.pages;
  }

  get page(): PebThemePageInterface {
    return this.themeService.page;
  }

  get page$(): Observable<PebThemePageInterface> {
    return this.themeService.page$;
  }

  get activePageId() {
    return this.themeService.page?.id ?? null;
  }

  get activePageActions$() {
    return this.themeService.activePageActions$;
  }

  get activePageActions() {
    return this.themeService.activePageActions;
  }

  get pageActions() {
    return this.themeService.actions;
  }

  get canUndo$(): Observable<boolean> {
    return this.themeService.canUndo$;
  }

  get canRedo$(): Observable<boolean> {
    return this.themeService.canRedo$;
  }

  reset(): void {
    this.themeService.reset();
  }

  openTheme(theme: PebTheme, snapshot: PebThemeDetailInterface, initialPageId: PebPageId): void {
    if (!theme) {
      throw new Error('Attempt to initiate store for empty theme');
    }

    this.themeService.openTheme(theme, snapshot);

    if (snapshot.application?.data?.defaultLanguage) {
      this.store.dispatch(new PebDefaultLanguageAction(snapshot.application.data.defaultLanguage));
    }

    if (initialPageId) {
      return this.themeService.openPage(initialPageId, this.screen);
    }

    const frontPage = snapshot.pages?.find(p => p.variant === PebPageVariant.Front);

    if (!frontPage) {
      console.warn(
        'This theme somehow doesn\'t have front page defined.' +
        'Probably, this happened because your fixture doesn\'t define it.',
      );
    }

    this.activatePage(frontPage?.id ?? snapshot.pages?.[0]?.id);
  }

  setVersionUpdated() {
    this.versionUpdatedSubject$.next(true);
  }

  setLastPublishedActionId() {
    this.themeService.setPublishedActionId();
  }

  updateThemePreview(previewURL: string): Observable<void> {
    return this.themeService.updatePreview(previewURL);
  }

  updateThemeName(name: string): Observable<void> {
    return this.themeService.updateThemeName(name);
  }

  activatePage(pageId: PebPageId): Observable<any> {
    if (!pageId) {
      this.themeService.openPage(null, this.screen);

      return EMPTY;
    }

    const page = this.snapshot.pages.find(p => p.id === pageId);

    if (!page) {
      return EMPTY;
    }
    this.lastActivePages[page.type] = pageId;

    this.themeService.openPage(null, this.screen);

    const result$ = new Subject();

    timer(50).pipe(
      tap(() => this.themeService.openPage(pageId, this.screen)),
      map(() => pageId),
      takeUntil(this.destroyed$),
    ).subscribe(result$);

    return result$;
  }

  getBusinessApps(): Observable<{ [appType: string]: any}> {
    return this.themeService.getBusinessApps();
  }

  activateLastPageByView(type: PebPageType): Observable<null> {
    if (this.lastActivePages[type]) {
      return this.activatePage(this.lastActivePages[type]);
    }

    const possiblePages = this.snapshot.pages
      .filter((replicaPage: PebThemeShortPageInterface) => replicaPage.type === type);

    return possiblePages.length
      ? this.activatePage(possiblePages[0].id)
      : EMPTY;
  }

  createPage(input: {
    name: string,
    variant: PebPageVariant,
    type: PebPageType,
    masterId: PebPageId | null,
    activatePage?: boolean,
  }): Observable<any> {
    return iif(
      () => !!input.masterId,
      this.forkMasterPage(input.masterId, input.name),
      of(pebCreateEmptyPage(input.name, input.variant, input.type)),
    ).pipe(
      switchMap((pageSource) => {
        /** Fork master from master source */
        pageSource.type = input.type;
        pageSource.master = input.type === PebPageType.Master ? null : pageSource.master;

        const createPageAction = pebCreateAction(PebActionType.CreatePage, pageSource);

        return this.commitAction(createPageAction).pipe(
          switchMap(() => {
            if (input.activatePage) {
              return this.activatePage(pageSource.id);
            }

            return of([]);
          }),
          map(() => ({
            pageId: pageSource.id,
            action: createPageAction,
          })),
        );
      }),
    );
  }

  updateReplicas(nextInitActions: PebAction[]): Observable<PebThemeDetailInterface> {
    return this.api.updateReplicas(this.theme.id, nextInitActions).pipe(
      tap(snapshot => this.themeService.snapshot = snapshot),
    );
  }


  pastePage(input: { name: string, pageId: PebPageId, pageVariant: PebPageVariant }): Observable<any> {
    return iif(
      () => this.page?.id === input.pageId,
      of(this.page),
      this.themeService.pages[input.pageId] ?
        of(this.themeService.pages[input.pageId]) : this.api.getPage(this.theme?.id, input.pageId),
    ).pipe(
      switchMap(page => this.commitAction({
        effects: this.pasteOrDuplicatePageEffects(page),
        id: pebGenerateId(),
        targetPageId: page.id,
        affectedPageIds: [page.id],
        createdAt: new Date(),
      })),
    );
  }

  pastePages(inputs: PebThemeShortPageInterface[]): Observable<any> {
    const source = of(inputs);

    return source.pipe(
      switchMap((pages) => {
        const effects = pages.reduce(
          (acc, page) => {
            return [...acc, ...this.pasteOrDuplicatePageEffects(page)];
          },
          [],
        );

        return effects.length ? this.commitAction({
          effects,
          id: pebGenerateId(),
          targetPageId: this.page.id,
          affectedPageIds: pages.map(p => p.id),
          createdAt: new Date(),
        }).pipe(
          tap(() => this.activatePage(pages[0].id)),
        ) : of(null);
      }),
    );
  }

  pasteOrDuplicatePageEffects(page: PebThemePageInterface, isDuplicate: boolean = false): PebEffect[] {
    const pageSource = { ...page };

    pageSource.id = pebGenerateId('page');
    pageSource.name = /\(Duplicate\)$/.test(page.name) ? page.name : `${page.name} (Duplicate)`;
    if (isDuplicate) {
      pageSource.duplicatedPageId = page.id;
    }
    pageSource.variant = PebPageVariant.Default;

    const idsMap = generateUniqueIdsForPage(pageSource);

    if (!pageSource.master) {
      Object.assign(pageSource, idsMap);
    }

    pageSource.contextId = pebGenerateId();
    pageSource.context = Object.entries(pageSource.context).reduce((acc, [elId, context]) => {
      acc[idsMap[elId] ?? elId] = context;

      return acc;
    }, {});

    pageSource.template = pebMapElementDeep(
      pageSource.template,
      el => ({ ...el, id: idsMap[el.id] ? idsMap[el.id] : el.id }),
    );

    pageSource.stylesheets = Object.entries(pageSource.stylesheets).reduce(
      (acc: { [screen: string]: PebStylesheet }, [screen, stylesheet]) => {
        const s = Object.entries(stylesheet).reduce(
          (a, [elId, styles]) => {
            a[idsMap[elId] ?? elId] = styles;

            return a;
          },
          {},
        );
        acc[screen] = s;

        return acc;
      },
      {},
    );

    pageSource.data = page.data;
    const createPageAction = pebCreateAction(PebActionType.CreatePage, pageSource);

    return createPageAction.effects;
  }

  reorderPages(pageIds: string[]): Observable<any> {
    const createPageAction = pebCreateAction(PebActionType.ReorderPages, pageIds);

    return this.commitAction(createPageAction);
  }

  duplicatePage(input: { name: string, pageId: PebPageId, pageVariant: PebPageVariant }): Observable<any> {
    return iif(
      () => this.page?.id === input.pageId,
      of(this.page),
      this.themeService.pages[input.pageId] ?
        of(this.themeService.pages[input.pageId]) : this.api.getPage(this.theme?.id, input.pageId),
    ).pipe(
      switchMap((page) => {
        page.name = /\(Duplicate\)$/.test(page.name) ? page.name : `${page.name} (Duplicate)`;

        return this.commitAction({
          effects: this.pasteOrDuplicatePageEffects(page, true),
          id: pebGenerateId(),
          targetPageId: page.id,
          affectedPageIds: [page.id],
          createdAt: new Date(),
        });
      }),
    );
  }

  duplicatePages(inputs: PebThemeShortPageInterface[]): Observable<any> {
    const source = of(inputs);

    return source.pipe(
      switchMap((pages) => {
        const effects = pages.reduce(
          (acc, page) => {
            page.name = /\(Duplicate\)$/.test(page.name) ? page.name : `${page.name} (Duplicate)`;

            return [...acc, ...this.pasteOrDuplicatePageEffects(page)];
          },
          [],
        );

        return this.commitAction({
          effects,
          id: pebGenerateId(),
          targetPageId: this.page.id,
          affectedPageIds: pages.map(p => p.id),
          createdAt: new Date(),
        });
      }),
    );
  }

  updatePagesWithShopRouting(
    pagesPayload: Array<Partial<PebPageShort>>,
    routingPayload: PebShopRoute[],
  ): Observable<PebActionResponse> {
    const updatePagesAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: null,
      affectedPageIds: pagesPayload.map(page => page.id),
      effects: [
        ...pagesPayload.map(payload => ({
          payload,
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${payload.id}`,
        })),
        {
          type: PebShopEffect.PatchRouting,
          target: `${PebEffectTarget.Shop}`,
          payload: routingPayload,
        },
      ],
    };

    return this.commitAction(updatePagesAction);
  }

  updateShopThemeRouting(routes: PebShopRoute[]): Observable<PebActionResponse> {
    const specialRoutesEffects: PebEffect[] = routes.reduce(
      (acc: PebEffect[], route) => {
        const page = this.themeService.pages[route.pageId];
        if (page?.variant === PebPageVariant.Category) {
          acc.push({
            type: PebShopEffect.UpdateData,
            target: `${PebEffectTarget.Shop}`,
            payload: { categoryPages: `${route.url}/:categoryId` },
          });
        }

        return acc;
      },
      [],
    );
    const updateShopAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: null,
      affectedPageIds: [],
      effects: [
        {
          type: PebShopEffect.PatchRouting,
          target: `${PebEffectTarget.Shop}`,
          payload: routes,
        },
        ...specialRoutesEffects,
      ],
    };

    return this.commitAction(updateShopAction);
  }

  updatePage(page: PebThemeShortPageInterface, payload: any): Observable<PebActionResponse> {
    const updatePageAction = makeUpdatePageAction(page, payload);
    if ([
      PebPageVariant.Category,
      PebPageVariant.Product,
      PebPageVariant.Login,
      PebPageVariant.Password,
    ].includes(payload?.variant)) {
      const route = this.snapshot.application.routing.find(r => r.pageId === page.id);
      if (route?.url) {
        this.snapshot.pages.forEach((p) => {
          if (p.variant === payload.variant && p.id !== page.id) {
            updatePageAction.effects.push({
              type: PebPageEffect.Update,
              target: `${PebEffectTarget.Pages}:${p.id}`,
              payload: { variant: PebPageVariant.Default },
            });
            updatePageAction.affectedPageIds.push(p.id);
          }
        });
        if (payload.variant === PebPageVariant.Category) {
          updatePageAction.effects.push({
            type: PebShopEffect.UpdateData,
            target: `${PebEffectTarget.Shop}:${this.snapshot.id}`,
            payload: { categoryPages: `${route.url}/:categoryId` },
          });
        }
      }
    }

    return this.commitAction(updatePageAction);
  }

  deletePage(page: any, pagesView: PebPageType): Observable<PebActionResponse> {
    if (Array.isArray(page)) {
      const source = from(page);

      return source.pipe(
        switchMap(innerPage => this.deletePageHandler(innerPage, pagesView)),
      );
    }

    return this.deletePageHandler(page, pagesView);
  }

  deletePageHandler(page: any, pagesView: PebPageType): Observable<PebActionResponse> {
    const deletePageAction = pebCreateAction(PebActionType.DeletePage, page);
    deletePageAction.effects.find(e => e.type === HandlerStateEffect.DeletePage).target = '';
    deletePageAction.effects.push({
      type: PebShopEffect.DeleteRoutes,
      target: `${PebEffectTarget.Shop}`,
      payload: this.snapshot.application.routing.filter(r => r.pageId === page.id),
    });

    const activatePageId = this.activePageId;

    return this.commitAction(deletePageAction).pipe(
      tap(() => {
        if (activatePageId === page.id) {
          this.activateExistPage(page.id, pagesView);
        }
      }),
    );
  }

  appendGridElement(
    parentId: PebElementId,
    elementKit: PebElementKit,
    children: PebElementKit[] = [],
  ): Observable<PebActionResponse> {
    const page = this.page;

    const action: PebAction = {
      id: pebGenerateId('action'),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      createdAt: new Date(),
      effects: [
        {
          payload: {
            to: parentId,
            element: elementKit.element,
          },
          type: PebTemplateEffect.AppendElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
        },
        ...Object.values(PebScreen).map((screen: PebScreen) => ({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
          payload: {
            [elementKit.element.id]: elementKit.styles[screen],
            ...children.reduce(
              (acc, childKit) => {
                acc[childKit.element.id] = childKit.styles[screen];

                return acc;
              },
              {},
            ),
          },
        })),
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
          payload: elementKit.contextSchema ? { [elementKit.element.id]: elementKit.contextSchema } : null,
        },
      ],
    };

    return this.commitAction(action);
  }

  appendElementTransformation(
    parentId: PebElementId,
    transformation: PebElementTransformationDeep,
    beforeId?: PebElementId,
  ): Observable<PebActionResponse> {
    const page = this.page;
    const appendPayload: PebAppendElementPayload = {
      to: parentId,
      element: transformation.definition,
    };
    if (beforeId) {
      appendPayload.before = beforeId;
    }
    const action: PebAction = {
      id: pebGenerateId(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      createdAt: new Date(),
      effects: [
        {
          type: PebTemplateEffect.AppendElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
          payload: appendPayload,
        },
        ...Object.entries(transformation.styles).map(([screen, stylesheet]) => ({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
          payload: stylesheet,
        })),
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
          payload: transformation.contextSchema,
        },
      ],
    };

    return this.commitAction(action);
  }

  // TODO: Implement action creator
  appendElement(
    parentId: PebElementId,
    elementDef: PebElementKit,
    children: PebElementKit[] = [],
  ): Observable<PebActionResponse> {
    const page = this.page;

    const appendAction = makeAppendElementAction(
      page,
      parentId,
      elementDef,
      null,
      this.snapshot.application,
      children,
    );

    return this.commitAction(appendAction);
  }

  pasteElement(
    pasteElements: PebPasteElement[],
    screen: PebScreen,
    fromScreen: PebScreen,
  ): Observable<PebActionResponse> {
    const page = this.page;
    const pasteAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [],
    };

    const contextSchema = Object.values(this.pages).reduce(
      (acc, p) => ({ ...acc, ...p.context }),
      {},
    );

    pasteElements.forEach((element: PebPasteElement) => {
      const effects = makePasteElementAction(
        page,
        contextSchema,
        element.parentId,
        element.elementDef,
        element.childIds,
        screen,
        fromScreen,
        element.beforeId,
        element?.styleMap
      );
      pasteAction.effects.push(...effects);
    });

    return this.commitAction(pasteAction);
  }

  deleteElement(elementIds: PebElementId[], addEffects?: PebEffect[]): Observable<PebActionResponse> {
    const page = this.page;

    const elementIdsDict: { [id: string]: PebElementDef } = elementIds.reduce(
      (acc, id) => {
        acc[id] = null;

        return acc;
      },
      {},
    );
    pebForEachObjectWithChildrenDeep(page.template, (el) => {
      if ((el as PebElementDef).id in elementIdsDict) {
        elementIdsDict[(el as PebElementDef).id] = el as PebElementDef;
      }

      return true;
    });

    const deleteAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
        ...elementIds.reduce(
          (acc: any, elementId) => {
            acc.push({
              type: PebTemplateEffect.DeleteElement,
              target: `${PebEffectTarget.Templates}:${page.templateId}`,
              payload: elementId,
            });
            if (elementIdsDict[elementId]) {
              pebForEachObjectWithChildrenDeep(elementIdsDict[elementId], (el) => {
                acc.push({
                  type: PebContextSchemaEffect.Delete,
                  target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
                  payload: (el as PebElementDef).id,
                });
                Object.values(PebScreen).forEach((s: PebScreen) => {
                  acc.push({
                    type: PebStylesheetEffect.Delete,
                    target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[s]}`,
                    payload: (el as PebElementDef).id,
                  });
                });

                return true;
              });
            }

            return acc;
          },
          [],
        ),
        ...addEffects ?? [],
      ],
    };

    return this.commitAction(deleteAction);
  }

  setBeforeElement(
    parentId: PebElementId,
    elementDef: any,
    beforeId?: PebElementId,
  ): Observable<PebActionResponse> {
    // Set element before parentId element
    const page = this.page;

    const appendAction = makeAppendElementAction(page, parentId, elementDef, beforeId);

    return this.commitAction(appendAction);
  }

  updateElement(element: PebElementDef | PebElementDef[], addEffects?: PebEffect[]): Observable<PebActionResponse> {
    const page = this.page;

    const updateElementAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
        ...Array.isArray(element) ?
          element.map(item => pebLayoutCreateUpdateElementEffect(page.templateId, item)) :
          [pebLayoutCreateUpdateElementEffect(page.templateId, element)],
        ...addEffects ?? [],
      ],
    };

    return this.commitAction(updateElementAction);
  }

  relocateElement(
    elements: Array<{
      elementId: PebElementId,
      nextParentId: PebElementId,
      styles: PebStylesheet,
      stylesScreen: PebScreen,
    }>,
  ): Observable<PebActionResponse> {
    const page = this.page;

    const effects = elements.reduce((acc, element) => {
      const stylesheetId = page.stylesheetIds[element.stylesScreen];

      return [
        ...acc,
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${stylesheetId}`,
          payload: element.styles,
        },
        {
          type: PebTemplateEffect.RelocateElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
          payload: {
            elementId: element.elementId,
            nextParentId: element.nextParentId,
          },
        },
      ];
    }, []);

    const relocateElementAction: PebAction = {
      effects,
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
    };

    return this.commitAction(relocateElementAction);
  }

  updateStyles(screen: PebScreen, styles: PebStylesheet) {
    const page = this.page;
    const stylesheetId = this.page.stylesheetIds[screen];

    const updateStylesAction: PebAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [{
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${stylesheetId}`,
        payload: { ...styles },
      }],
    };

    return this.commitAction(updateStylesAction);
  }


  updateMotionElement(
    element: PebElementDef,
    motion: PebMotion,
  ): Observable<PebActionResponse> {
    const page = this.page;
    const payload: PebElementDef = {
      ...element,
      motion,
    };
    const motionAction: PebAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
        {
          payload,
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${page.templateId}`,
        },
      ],
    };

    return this.commitAction(motionAction);
  }

  calcElementLeftWidthByScreen(styles, oldStyles, screen: PebScreen) {
    const calcPossibleWidth = pebScreenDocumentWidthList[screen] - (oldStyles.marginLeft + styles.width);

    return calcPossibleWidth < 0 ? pebScreenDocumentWidthList[screen] - oldStyles.marginLeft : styles.width;
  }

  updateStylesByScreen(styles: { [screen: string]: PebStylesheet }) {
    const page = this.page;
    const updateStylesAction: PebAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: Object.keys(styles).reduce((acc, screen) => {
        const stylesheetId = page.stylesheetIds[screen];
        acc.push({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${stylesheetId}`,
          payload: styles[screen],
        });

        return acc;
      }, []),
    };

    return this.commitAction(updateStylesAction);
  }

  updateElementKit(
    screen: PebScreen | PebScreen[] | null,
    newDefinition: PebElementDef | PebElementDef[],
    newStyles: PebStylesheet | PebStylesheet[],
    context?: PebContext,
  ) {
    const page = this.page;
    let screens: PebScreen[];
    if (!screen) {
      screens = Object.values(PebScreen);
    } else if (screen instanceof Array) {
      screens = screen;
    } else {
      screens = [screen];
    }

    const updateKitAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
        ... (Array.isArray(newDefinition)) ?
          newDefinition.map((definition, i) => {
            return this.createUpdateElementEffect(definition, screens, page, context, newStyles[i]);
          }).reduce((acc, item) => acc.concat(item), []) :
          this.createUpdateElementEffect(newDefinition, screens, page, context, (newStyles as PebStylesheet)),
      ],
    };

    return this.commitAction(updateKitAction);
  }

  updateElementKitByScreen(
    newDefinition: PebElementDef,
    newStyles: { [screen: string]: { [id: string]: PebStylesheet } },
  ) {
    const page = this.page;
    const updateKitAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
        pebLayoutCreateUpdateElementEffect(page.templateId, newDefinition),
        ...Object.keys(newStyles).reduce((acc, screen) => {
          const stylesheetId = page.stylesheetIds[screen];
          acc.push({
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${stylesheetId}`,
            payload: newStyles[screen],
          });

          return acc;
        }, []),
      ],
    };

    return this.commitAction(updateKitAction);
  }

  updateContext(elementId: PebElementId, context: PebContext) {
    const page = this.page;

    const updateContextAction: PebAction = {
      id: pebGenerateId('action'),
      createdAt: new Date(),
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
          payload: context ? { [elementId]: context } : null,
        },
      ],
    };

    return this.commitAction(updateContextAction);
  }

  updateShop(data: PebShopData) {
    const updateShopAction: PebAction = {
      id: pebGenerateId(),
      createdAt: new Date(),
      targetPageId: null,
      affectedPageIds: [],
      effects: [{
        type: PebShopEffect.UpdateData,
        target: PebEffectTarget.Shop,
        payload: data,
      }],
    };

    return this.commitAction(updateShopAction);
  }

  undoAction(): Observable<void> {
    return this.themeService.undo().pipe(take(1));
  }

  redoAction(): Observable<void> {
    return this.themeService.redo().pipe(take(1));
  }

  updatePagePreview(data: { [pageId: string]: { [screen: string]: string }}): Observable<any> {
    const action: PebAction = {
      id: pebGenerateId('action'),
      effects: [],
      affectedPageIds: Object.keys(data),
      targetPageId: Object.keys(data)[0] ?? null,
      createdAt: new Date(),
      background: true,
    };

    Object.entries(data).forEach(([pageId, screenPreviews]) => {
      const page = this.snapshot.pages.find(p => p.id === pageId);
      if (page) {
        const mergedData = lMerge({}, page.data, { preview: screenPreviews });
        const isChanged = JSON.stringify(mergedData.preview) !== JSON.stringify(page.data.preview);

        if (isChanged) {
          action.effects.push({
            type: PebPageEffect.Update,
            target: `${PebEffectTarget.Pages}:${page.id}`,
            payload: { data: mergedData },
          });
        }
      }
    });

    return action.effects.length > 0 ? this.commitAction(action) : EMPTY;
  }

  removeDuplicateEffects(action: PebAction): PebAction {
    const cleanEffects = [];

    action.effects.forEach((effect) => {
      const filteredEffects = cleanEffects.filter(cleanEffect =>
        effect.target === cleanEffect.target && effect.type === cleanEffect.type);

      if (filteredEffects.length) {
        filteredEffects.forEach((filteredEffect) => {
          switch (filteredEffect?.type) {
            case (PebTemplateEffect.AppendElement):
              if (filteredEffect.payload.element.id !== effect.payload.element.id
                && !cleanEffects.some(e => e.payload.element?.id === effect.payload.element?.id)) {
                cleanEffects.push(effect);
              }
              break;
            case (PebTemplateEffect.RelocateElement):
              if (filteredEffect.payload.elementId !== effect.payload.elementId
                && !cleanEffects.some(e => e.payload?.elementId === effect.payload?.elementId)) {
                cleanEffects.push(effect);
              }
              break;
            case (PebTemplateEffect.UpdateElement):
            case (PebTemplateEffect.PatchElement):
              if (filteredEffect.payload.id !== effect.payload.id
                && !cleanEffects.some(e => e.payload?.id === effect.payload?.id)) {
                cleanEffects.push(effect);
              }
              break;
            case (PebTemplateEffect.DeleteElement):
              if (filteredEffect.payload !== effect.payload
                && !cleanEffects.some(e => e.payload === effect.payload)) {
                cleanEffects.push(effect);
              }
              break;
            case (PebStylesheetEffect.Delete):
              if (filteredEffect.payload !== effect.payload
                && !cleanEffects.some(e => e.type === effect.type
                  && e.target === effect.target
                  && e.payload === effect.payload)) {
                cleanEffects.push(effect);
              }
              break;
            case (PebStylesheetEffect.Update):
              if (effect.payload) {
                Object.keys(effect.payload).forEach((elementId: string) => {
                  if (filteredEffect.payload[elementId]) {
                    filteredEffect.payload[elementId] = {
                      ...filteredEffect.payload[elementId],
                      ...effect.payload[elementId],
                    };
                  } else {
                    filteredEffect.payload[elementId] = effect.payload[elementId];
                  }
                });
              }
              break;
            case (PebContextSchemaEffect.Delete):
              if (filteredEffect.payload !== effect.payload
                && !cleanEffects.some(e => e.type === effect.type
                  && e.target === effect.target
                  && e.payload === effect.payload)) {
                cleanEffects.push(effect);
              }
          }
        });
      } else {
        cleanEffects.push(effect);
      }
    });

    action.effects = cleanEffects;

    return action;
  }

  prepareActionForAllScreens(action: PebAction): PebAction {
    const defaultScreen = this.defaultScreen;
    const currentScreen = this.screen;

    const templateEffects = action.effects.filter(this.isTemplateEffect);
    const stylesheetEffects = action.effects.filter(this.isStylesheetEffect);

    if (templateEffects.length) {
      templateEffects.forEach((templateEffect) => {
        switch (templateEffect?.type) {
          case (PebTemplateEffect.AppendElement):
            if (currentScreen === defaultScreen) {
              const foundEffect = action.effects.find((e: PebEffect) => {
                return e.type === PebStylesheetEffect.Update
                  && e.target === `${PebEffectTarget.Stylesheets}:${this.page.stylesheetIds[currentScreen]}`;
              });

              if (foundEffect) {
                updateStyleForAllScreens(action, this.page, foundEffect);
              }
            }
            break;
          case (PebTemplateEffect.DeleteElement):
            if (currentScreen !== defaultScreen) {
              const elementId = templateEffect.payload;

              templateEffect.type = PebTemplateEffect.UpdateElement;
              templateEffect.payload = findElement(this.themeService.page.template, el => el?.id === elementId);

              action.effects = action.effects.reduce((acc, effect) => {
                if (effect.type === PebStylesheetEffect.Delete && effect.payload === elementId) {
                  const effectTarget = `${PebEffectTarget.Stylesheets}:${this.page.stylesheetIds[currentScreen]}`;

                  if (effect.target === effectTarget) {
                    const index = acc.findIndex(e =>
                      e.type === PebStylesheetEffect.Update && e.target === effectTarget);

                    if (index === -1) {
                      effect.type = PebStylesheetEffect.Update;
                      effect.payload = {
                        [effect.payload]: {
                          ...this.page.stylesheets[currentScreen][effect.payload],
                          display: 'none',
                        },
                      };

                      acc.push(effect);
                    } else {
                      acc[index].payload = {
                        ...acc[index].payload,
                        [elementId]: {
                          ...this.page.stylesheets[currentScreen][elementId],
                          display: 'none',
                        },
                      };
                    }
                  }
                } else {
                  acc.push(effect);
                }

                return acc;
              }, []);
            }
            break;
          case (PebTemplateEffect.PatchElement):
          case (PebTemplateEffect.UpdateElement):
            if (currentScreen === defaultScreen) {
              const foundEffect = action.effects.find((e: PebEffect) => {
                return e.type === PebStylesheetEffect.Update
                  && e.target === `${PebEffectTarget.Stylesheets}:${this.page.stylesheetIds[currentScreen]}`
                  && e.payload && Object.values(e.payload).length;
              });

              if (foundEffect) {
                updateStyleForAllScreens(action, this.page, foundEffect, true);
              }
            }
            break;
          case undefined:
            if (currentScreen === defaultScreen) {
              const foundEffect = action.effects.find((e: PebEffect) => {
                return e.type === PebStylesheetEffect.Update
                  && e.target === `${PebEffectTarget.Stylesheets}:${this.page.stylesheetIds[currentScreen]}`;
              });

              if (foundEffect) {
                updateStyleForAllScreens(action, this.page, foundEffect, true);
              }
            }
            break;
        }
      });
    }

    if (stylesheetEffects.length) {
      stylesheetEffects.forEach((stylesheetEffect) => {
        if (currentScreen === defaultScreen) {
          if (stylesheetEffect.type === PebStylesheetEffect.Update
            && stylesheetEffect.target === `${PebEffectTarget.Stylesheets}:${this.page.stylesheetIds[currentScreen]}`) {
            updateStyleForAllScreens(action, this.page, stylesheetEffect, true);
          }
        }
      });
    }

    return action;

    function findElement(element, handler: (el) => boolean) {
      return element.children?.reduce((acc, el) => acc ? acc : handler(el) ? el : findElement(el, handler), undefined);
    }

    function updateStyleForAllScreens(
      pebAction: PebAction,
      page: PebThemePageInterface,
      foundEffect: PebEffect,
      update = false,
    ) {

      pebAction.effects.forEach((effect: PebEffect) => {
        if (effect.type !== PebStylesheetEffect.Update) { return; }

        Object.keys(PebScreen).forEach((screen) => {
          const index = pebAction.effects.findIndex((e: PebEffect) => {
            return e.type === PebStylesheetEffect.Update
              && e.target === `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen.toLowerCase()]}`;
          });

          const addNewEffect = index === -1;
          const effectPayload = addNewEffect ? effect.payload : foundEffect.payload;
          const payload = {};

          Object.keys(effectPayload).forEach((elementId) => {
            payload[elementId] = effect.payload?.[elementId]?.display === 'none'
              ? { ...effect.payload[elementId], display: 'none' }
              : effect.payload[elementId];
          });

          if (addNewEffect) {
            pebAction.effects.push({
              type: effect.type,
              payload: update ? payload : effect.payload,
              target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen.toLowerCase()]}`,
            });

            return;
          }

          pebAction.effects[index].payload = update ? payload : foundEffect.payload;
        });
      });
    }
  }

  setElementsVersion(action: PebAction): PebAction {
    const lastMigrationVersion = Number(Object.keys(migrations).slice(-1));
    const screen = this.screen;
    const stylesheetId = this.page.stylesheetIds[screen];

    const templateEffects = action.effects.filter(this.isTemplateEffect);
    const stylesheetEffects = action.effects.filter(this.isStylesheetEffect);

    let elementIds = [];

    if (templateEffects.length) {
      templateEffects
        .filter(templateEffect => templateEffect.type !== PebTemplateEffect.Destroy
          && templateEffect.type !== PebTemplateEffect.Init)
        .forEach((templateEffect) => {
          const { elementId, isDeleteElement } = getElementId(templateEffect);
          const elementDef = this.tree.find(elementId)?.element;

          if (elementDef?.data?.version === undefined || elementDef.data.version < lastMigrationVersion) {
            if (stylesheetEffects.length) {
              stylesheetEffects.forEach((stylesheetEffect) => {
                if (stylesheetEffect.target === `${PebEffectTarget.Stylesheets}:${stylesheetId}`
                  && typeof stylesheetEffect.payload === 'object'
                  && !Object.keys(stylesheetEffect.payload).find(id => id === elementId)) {
                  stylesheetEffect.payload = !isDeleteElement
                    ? { ...stylesheetEffect.payload, ...{ [elementId]: this.page.stylesheets[screen][elementId] } }
                    : stylesheetEffect.payload;
                }
              });
            } else {
              action.effects.push({
                type: PebStylesheetEffect.Update,
                target: `${PebEffectTarget.Stylesheets}:${stylesheetId}`,
                payload: {
                  [elementId]: this.page.stylesheets[screen][elementId],
                },
              });
            }
          }

          elementIds = [...new Set([...elementIds, elementId])];
        });
    }

    if (stylesheetEffects.length) {
      stylesheetEffects
        .filter(stylesheetEffect => stylesheetEffect.type !== PebStylesheetEffect.Destroy
          && stylesheetEffect.type !== PebStylesheetEffect.Init)
        .forEach((stylesheetEffect) => {
          if (stylesheetEffect.type === PebStylesheetEffect.Delete) {
            elementIds = [...new Set([...elementIds, stylesheetEffect.payload])];
          } else if (typeof stylesheetEffect.payload === 'object') {
            Object.keys(stylesheetEffect.payload).forEach((elementId) => {
              const elementDef = this.tree.find(elementId)?.element;

              if (elementDef?.data?.version === undefined || elementDef.data.version < lastMigrationVersion) {
                stylesheetEffect.payload[elementId] = {
                  ...this.page.stylesheets[screen][elementId],
                  ...stylesheetEffect.payload[elementId],
                };
              }

              elementIds = [...new Set([...elementIds, elementId])];
            });
          }
        });
    }

    elementIds.forEach((elementId: string) => {
      let elm = this.tree.find(elementId);

      if (elm && (elm.data?.version === undefined || elm.data.version < lastMigrationVersion)) {
        elm.data.version = lastMigrationVersion;

        action.effects.push({
          type: PebTemplateEffect.PatchElement,
          target: `${PebEffectTarget.Templates}:${this.page.templateId}`,
          payload: {
            id: elementId,
            data: { version: lastMigrationVersion },
            type: elm.element.type,
          },
        });
      }
    });

    return action;

    function getElementId(effect) {
      let elementId;
      let isDeleteElement = false;

      switch (effect.type) {
        case PebTemplateEffect.AppendElement:
          elementId = effect.payload.element.id;
          break;
        case PebTemplateEffect.DeleteElement:
          elementId = effect.payload;
          isDeleteElement = true;
          break;
        case PebTemplateEffect.RelocateElement:
          elementId = effect.payload.elementId;
          isDeleteElement = true;
          break;
        default:
          elementId = effect.payload.id;
          break;
      }

      return { elementId, isDeleteElement };
    }
  }

  commitAction(action: PebAction): Observable<PebActionResponse> {
    // TODO: repetitive effects are generated when inserting an element and in many other actions
    // need to figure out and delete "removeDuplicateEffects"
    const removeDuplicateEffects = this.removeDuplicateEffects(action);
    const setElementsVersion = this.setElementsVersion(removeDuplicateEffects);
    const forAllScreens = this.prepareActionForAllScreens(setElementsVersion);

    const result = this.themeService.commitAction(forAllScreens);
    this.actionCommittedSubject$.next();

    return result;
  }

  getPages(): Observable<PebThemePageInterface[]> {
    return this.themeService.getPages();
  }

  getPage(pageId): Observable<PebThemePageInterface> {
    return this.themeService.getPage(pageId);
  }

  private createUpdateElementEffect(
    definition: PebElementDef,
    screens: PebScreen[],
    page: any,
    context: PebContext,
    newStyles: PebStylesheet,
  ) {
    return [
      pebLayoutCreateUpdateElementEffect(page.templateId, definition),
      ...screens.map((s) => {
        const stylesheetId = page.stylesheetIds[s];

        return {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${stylesheetId}`,
          payload: newStyles,
        };
      }),
      ...(context ? [{
        type: PebContextSchemaEffect.Update,
        target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
        payload: { [definition.id]: context },
      }] : []),
    ];
  }

  private activateExistPage(pageId: PebPageId, pagesView: PebPageType = PebPageType.Replica): Observable<null> {
    let existPage = this.snapshot.pages.find(p => p.id === pageId);
    if (!existPage) {
      const { viewPage, frontPage } = this.snapshot.pages.reduce(
        (acc, p) => {
          if (!acc.frontPage && p.variant === PebPageVariant.Front) {
            acc.frontPage = p;
          }
          if (!acc.viewPage && p.type === pagesView) {
            acc.viewPage = p;
          }

          return acc;
        },
        { viewPage: null, frontPage: null },
      );
      existPage = viewPage ?? frontPage ?? this.snapshot.pages[0];
    }

    return this.activatePage(existPage.id);
  }

  private forkMasterPage(masterPageId: PebPageId, name: string): Observable<PebThemePageInterface> {
    return iif(
      () => this.page?.id === masterPageId,
      of(this.page),
      this.api.getPage(this.theme?.id, masterPageId),
    ).pipe(
      map((page) => {
        const pageSource = { ...page };
        const idsMap: PebMasterElementIdMap = generateUniqueIdsForPage(pageSource);
        const nextPage: PebThemePageInterface = {
          ...page,
          name,
          id: pebGenerateId('page'),
          type: PebPageType.Replica,
          master: {
            idsMap,
            id: masterPageId,
            lastActionId: page.master?.lastActionId,
          },
        };

        return applyIdsMapForPage(nextPage, idsMap);
      }),
    );
  }
}

export function makeUpdatePageAction(page: PebThemeShortPageInterface, payload: any): PebAction {
  return {
    id: pebGenerateId('action'),
    targetPageId: page.id,
    affectedPageIds: [page.id],
    createdAt: new Date(),
    effects: [
      {
        payload,
        type: PebPageEffect.Update,
        target: `${PebEffectTarget.Pages}:${page.id}`,
      },
    ],
  };
}

export function makeAppendElementAction(
  page: PebThemePageInterface,
  parentId: PebElementId,
  elementKit: PebElementKit,
  beforeId?: PebElementId,
  shop?: PebThemeApplicationInterface,
  children: PebElementKit[] = [],
): PebAction {
  const elementId = elementKit.element.id;
  const payload = getPayload(parentId, elementKit, beforeId);

  const rootContextEffect = elementKit.rootContextKey
    ? {
      type: PebContextSchemaEffect.Update,
      target: `${PebEffectTarget.ContextSchemas}:${shop.contextId}`,
      payload: { [elementKit.rootContextKey]: elementKit.contextSchema },
    }
    : null;

  return {
    id: pebGenerateId('action'),
    createdAt: new Date(),
    targetPageId: page.id,
    affectedPageIds: [page.id],
    effects: [
      {
        payload,
        type: PebTemplateEffect.AppendElement,
        target: `${PebEffectTarget.Templates}:${page.templateId}`,
      },
      ...Object.values(PebScreen).map((screen: PebScreen) => ({
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
        payload: {
          [elementId]: elementKit.styles[screen],
          ...children.reduce(
            (acc, childKit) => {
              acc[childKit.element.id] = childKit.styles[screen];

              return acc;
            },
            {},
          ),
        },
      })),
      ...(rootContextEffect
        ? [rootContextEffect]
        : [{
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
          payload: elementKit.contextSchema ? { [elementId]: elementKit.contextSchema } : null,
        }]
      ),
    ],
  };
}

export function makePasteElementAction(
  page: PebThemePageInterface,
  pageContextSchema: { [id: string]: PebContextSchema },
  parentId: PebElementId,
  elementKit: PebElementKit,
  childIds: PebElementId[],
  currentScreen: PebScreen,
  fromScreen?: PebScreen,
  beforeId?: PebElementId,
  styleMap?: {from: PebElementId, to: PebElementId}[]
): any[] {
  const elementId = elementKit.element.id;

  const appendElementPayload = [];
  const appendStylePayload = [];
  const contextSchemaPayload = {};

  if (elementKit.contextSchema) {
    contextSchemaPayload[elementId] = elementKit.contextSchema;
  }

  const genChildIds = styleMap && styleMap.length ?
    styleMap.map((itm) => ({ prevId: itm.from, id: itm.to })) :
    childIds.map((id: PebElementId) => ({ prevId: id, id: pebGenerateId() }));

  Object.values(PebScreen).map((screen: PebScreen) => {
    const stylesPayload = {};
    if (elementKit.element.type !== PebElementType.Document) {
      const styleElementId = elementKit.prevId ?? elementId;
      if (currentScreen === screen) {
        stylesPayload[elementId] = elementKit.styles[fromScreen][styleElementId];
        appendStylePayload.push({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
          payload: stylesPayload,
        });
      }
    }

    genChildIds.forEach((childId) => {
      if (currentScreen === screen) {
        stylesPayload[childId.id] = elementKit.styles[fromScreen][childId.prevId];
        appendStylePayload.push({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
          payload: stylesPayload,
        });
      }
    });

    appendStylePayload.push({
      type: PebStylesheetEffect.Update,
      target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
      payload: stylesPayload,
    });
  });
  // Clean up inner elements from renderer
  elementKit.element = pebMapElementDeep(elementKit.element, (el) => {
    const newId = genChildIds.find(ids => ids.prevId === el.id);
    const newElementKit = {
      id: newId ? newId.id : el.id,
      type: el.type,
      data: el.data || null,
      meta: el.meta || null,
      motion: el.motion || null,
      children: el.children || [],
    };

    if (newElementKit.meta && newElementKit.meta.deletable !== undefined) {
      newElementKit.meta = { ...newElementKit.meta, deletable: true };
    }

    const contextSchema = pageContextSchema[newId?.prevId];
    if (contextSchema) {
      contextSchemaPayload[newId.id] = contextSchema;
    }

    return newElementKit;
  });
  if (elementKit.element.type === PebElementType.Document) {
    // Paste only inner elements of document
    elementKit.element.children.forEach((child) => {
      appendElementPayload.push({
        type: PebTemplateEffect.AppendElement,
        target: `${PebEffectTarget.Templates}:${page.templateId}`,
        payload: getPayload(
          parentId,
          {
            element: child,
            styles: null,
            contextSchema: null,
          },
          beforeId,
        ),
      });
    });
  } else {
    appendElementPayload.push({
      type: PebTemplateEffect.AppendElement,
      target: `${PebEffectTarget.Templates}:${page.templateId}`,
      payload: getPayload(parentId, elementKit, beforeId),
    });
  }

  return [
    ...appendElementPayload,
    ...appendStylePayload,
    {
      type: PebContextSchemaEffect.Update,
      target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
      payload: contextSchemaPayload,
    },
  ];
}

export function getPayload(
  parentId: PebElementId,
  elementKit: PebElementKit,
  beforeId?: PebElementId,
) {
  const payload: PebAppendElementPayload = {
    to: parentId,
    element: elementKit.element,
  };
  if (beforeId) {
    payload.before = beforeId;
  }

  return payload;
}

export function setSnapshotDefaultRoutes(snapshot: PebShop): PebShop {
  const pageNamesCount = {};
  Object.keys(snapshot.pages).forEach((pageId: string) => {
    pageNamesCount[snapshot.pages[pageId].name]
      ? pageNamesCount[snapshot.pages[pageId].name] = pageNamesCount[snapshot.pages[pageId].name] + 1
      : (pageNamesCount[snapshot.pages[pageId].name] = 1);
  });
  Object.keys(snapshot.pages).forEach((pageId: string) => {
    const route = snapshot.routing.find(r => r.pageId === snapshot.pages[pageId].id);
    if (!route) {
      snapshot.routing.push({
        routeId: pebGenerateId(),
        pageId: snapshot.pages[pageId].id,
        url:
          `/${snapshot.pages[pageId].name.toLowerCase().replace(' ', '-')}-${pageNamesCount[snapshot.pages[pageId].name]}`,
      });
    }
  });

  return snapshot;
}

export function pebLayoutCreateUpdateElementEffect(templateId: string, element: PebElementDef): PebEffect {
  return {
    type: PebTemplateEffect.UpdateElement,
    target: `${PebEffectTarget.Templates}:${templateId}`,
    payload: omit(element, ['context', 'children', 'styles']), // TODO: check why it's mutable
  };
}
