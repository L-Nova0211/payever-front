import { Inject, Injectable, OnDestroy } from '@angular/core';
import { cloneDeep, omit } from 'lodash';
import Delta from 'quill-delta';
import {
  BehaviorSubject,
  combineLatest,
  concat,
  EMPTY,
  forkJoin,
  from,
  interval,
  merge,
  Observable,
  of,
  Subject,
} from 'rxjs';
import {
  catchError,
  concatMap,
  debounceTime,
  distinctUntilChanged,
  filter,
  first,
  map,
  mergeMap,
  retry,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
import {
  applyRecursive,
  PebAction,
  pebActionHandler,
  pebCreateLogger,
  PebEffectTarget,
  PebElementDef,
  pebFontFamilies,
  PebLanguage,
  PebPageEffect,
  PebPageId,
  PebPageType,
  PebScreen,
  PebTemplateEffect,
  PebTheme,
  PebThemeDetailInterface,
  PebThemePageInterface,
} from '@pe/builder-core';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { SnackbarErrorService } from './snackbar-error.service';


export enum PebStateActionType {
  Undo,
  Redo,
}

export enum PebApiActionType {
  Add = 'add',
  Delete = 'delete',
}

enum ThemeSaveStatus {
  Saved = 'saved',
  Saving = 'saving',
  NotSaved = 'not saved',
}

export interface PebSnapshotItem {
  action: PebAction;
  snapshot: PebThemeDetailInterface;
}

export interface PebSnapshotState {
  state: PebSnapshotItem[];
  redo: PebSnapshotItem[];
}

export interface UndoRedoState {
  canUndo: boolean;
  canRedo: boolean;
}

const log = pebCreateLogger('editor:actions');

@Injectable()
export class PebEditorThemeService implements OnDestroy {

  logger = { log };

  themeUpdateTimerId: number = null;

  lastRemovedRequest: { id: string, request: Observable<any> };

  migratedPageIds: string[] = [];

  private readonly destroyedSubject$ = new Subject();

  readonly destroyed$ = this.destroyedSubject$.asObservable();

  private readonly themeSubject$ = new BehaviorSubject<PebTheme>(null);

  private readonly savingChangesSubject = new BehaviorSubject<string>(ThemeSaveStatus.Saved);

  get theme$(): Observable<PebTheme> {
    return this.themeSubject$.asObservable();
  }

  get theme(): PebTheme {
    return this.themeSubject$.value;
  }

  private readonly baseSnapshotSubject$ = new BehaviorSubject<PebThemeDetailInterface>(null);
  private get baseSnapshot() {
    return this.baseSnapshotSubject$.getValue();
  }

  private set baseSnapshot(snapshot) {
    this.baseSnapshotSubject$.next(cloneDeep(snapshot));
  }

  private readonly snapshotSubject$ = new BehaviorSubject<PebThemeDetailInterface>(null);

  get snapshot$(): Observable<PebThemeDetailInterface> {
    return this.snapshotSubject$.asObservable();
  }

  set snapshot(snapshot: PebThemeDetailInterface) {
    this.snapshotSubject$.next(snapshot);
  }

  get snapshot(): PebThemeDetailInterface {
    return this.snapshotSubject$.value;
  }

  private readonly basePagesSubject$ = new BehaviorSubject<{ [id: string]: PebThemePageInterface }>({});
  private get basePages() {
    return this.basePagesSubject$.getValue();
  }

  private readonly pagesSubject$ = new BehaviorSubject<{ [id: string]: PebThemePageInterface }>({});
  private readonly activePageIdSubject$ = new BehaviorSubject<PebPageId>(null);

  get pages() {
    return this.pagesSubject$.getValue();
  }

  set pages(pages) {
    this.snapshot.pages.forEach((snapshotPage) => {
      if (pages[snapshotPage.id]) {
        Object.assign(snapshotPage, pages[snapshotPage.id]);
      }
    });
    this.pagesSubject$.next(pages);
  }

  get activePageId() {
    return this.activePageIdSubject$.getValue();
  }

  set activePageId(pageId) {
    this.activePageIdSubject$.next(pageId);
  }

  get page$(): Observable<PebThemePageInterface> {
    return combineLatest([
      this.pagesSubject$.asObservable(),
      this.activePageIdSubject$.asObservable(),
    ]).pipe(
      map(([pages, pageId]) => pages[pageId] ?? null),
      distinctUntilChanged(),
    );
  }

  get page(): PebThemePageInterface {
    return this.pages[this.activePageId] ?? null;
  }

  set page(page: PebThemePageInterface) {
    const pages = this.pages;
    this.initIndex(page.template);

    this.pagesSubject$.next({
      ...page ?
        { ...pages, [page.id]: page } :
        omit(pages, this.activePageId),
    });
  }

  private readonly actionsSubject$ = new BehaviorSubject<PebAction[]>([]);
  readonly actions$ = this.actionsSubject$.asObservable();
  get actions() {
    return this.actionsSubject$.getValue();
  }

  readonly lastActionId$ = combineLatest([
    this.snapshot$,
    this.actions$,
  ]).pipe(
    map(([snapshot, actions]) => {
      let id = snapshot.lastAction;
      for (let i = actions.length - 1; i >= 0; i -= 1) {
        if (!actions[i].background) {
          id = actions[i].id;
          break;
        }
      }

      return id;
    }),
  );

  private readonly lastPublishedActionIdSubject$ = new BehaviorSubject<string>(null);
  readonly lastPublishedActionId$ = this.lastPublishedActionIdSubject$.asObservable();

  get lastActionId() {
    const snapshot = this.snapshot;
    const actions = this.actions;
    let id = snapshot.lastAction;
    for (let i = actions.length - 1; i >= 0; i -= 1) {
      if (!actions[i].background) {
        id = actions[i].id;
        break;
      }
    }

    return id;
  }

  get activePageActions$() {
    return combineLatest([
      this.actionsSubject$,
      this.page$.pipe(filter(Boolean)),
    ]).pipe(
      map(([actions, page]: any) => {
        return actions.filter(
          action => action.affectedPageIds.some(pageId => pageId === page.id),
        );
      }),
    );
  }

  get activePageActions() {
    return this.getPageActions(this.activePageId);
  }

  private readonly canceledActionsSubject$ = new BehaviorSubject<PebAction[]>([]);
  private get canceledActions() {
    return this.canceledActionsSubject$.getValue();
  }

  private get canceledPageActions$() {
    return combineLatest([
      this.canceledActionsSubject$.asObservable(),
      this.page$.pipe(filter(Boolean)),
    ]).pipe(
      map(([actions, page]: any) =>
        !!actions.filter(action => action.affectedPageIds.some(pageId => pageId === page.id)).length,
      ),
    );
  }

  get canUndo$(): Observable<boolean> {
    return this.actions$.pipe(map(actions => actions.length > 0));
  }

  get canRedo$(): Observable<boolean> {
    return this.canceledActionsSubject$.pipe(
      map(actions => !!actions.length),
    );
  }

  private get canUndo(): boolean {
    return this.actions.length > 0;
  }

  private get canRedo(): boolean {
    return !!this.canceledActionsSubject$.value.length;
  }

  /**
   * We need a queue because this solves the problem of cancelling multiple requests by Google Chrome.
   * The problem will need to be solved later with web sockets.
   */
  private readonly requestsQueueSubject$ = new BehaviorSubject<Array<{ id: string, request: Observable<any> }>>([]);

  private initIndex(element: PebElementDef) {
    if (!element.children) { return; }
    element.children.forEach((child, index) => {
      if (!child.index) { child.index = index; }
      this.initIndex(child);
    });
  }

  private addRequestToQueue(id: string, request: Observable<any>) {
    this.requestsQueueSubject$.next([
      ...this.requestsQueueSubject$.value,
      { id, request },
    ]);
  }

  private removeRequestFromQueue(id: string) {
    this.lastRemovedRequest = this.requestsQueueSubject$.value.find(r => r.id === id);
    this.requestsQueueSubject$.next([
      ...this.requestsQueueSubject$.value.filter(r => r.id !== id),
    ]);
  }

  constructor(
    private api: PebEditorApi,
    private snackbarErrorService: SnackbarErrorService,
    private ws: PebEditorWs,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
    this.requestsQueueSubject$.pipe(
      distinctUntilChanged(),
      debounceTime(100),
      filter(requests => !!requests?.length),
      tap(requests => requests.forEach(r => this.removeRequestFromQueue(r.id))),
      concatMap(requests => concat(...requests.map(r => r.request))),
      catchError((error, data) => {
        this.savingChangesSubject.next(ThemeSaveStatus.NotSaved);
        this.snackbarErrorService.openSnackbarError({
          retryAction: () => this.addRequestToQueue(this.lastRemovedRequest.id, this.lastRemovedRequest.request),
          reloadOnHide: error?.status === 403,
        });

        return data;
      }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.savingChangesSubject.next(ThemeSaveStatus.Saved);
    });
  }

  ngOnDestroy() {
    this.destroyedSubject$.next(true);
    this.destroyedSubject$.complete();
  }

  reset(): void {
    this.themeSubject$.next(null);
    this.snapshotSubject$.next(null);
    this.savingChangesSubject.next(ThemeSaveStatus.Saved);
    this.pagesSubject$.next({});
    this.activePageIdSubject$.next(null);
    this.actionsSubject$.next([]);
  }

  openTheme(theme: PebTheme, snapshot: PebThemeDetailInterface): void {
    this.themeSubject$.next(theme);
    this.snapshot = snapshot;
    this.lastPublishedActionIdSubject$.next(snapshot.lastPublishedActionId ?? this.lastActionId);

    this.baseSnapshot = snapshot;
    this.canceledActionsSubject$.next([]);
  }

  openPage(pageId: PebPageId, screen?: PebScreen): void {
    const themeId = this.theme?.id;
    if (themeId && pageId) {
      const page$ = this.pages[pageId] ? of(this.pages[pageId]) : this.api.getPage(themeId, pageId, screen).pipe(
        retry(3),
        mergeMap((page) => {
          if (screen) {
            const reqs$ = Object.values(PebScreen).reduce(
              (acc, s) => {
                if (s !== screen) {
                  const req$ = this.api.getPageStylesheet(themeId, pageId, s).pipe(
                    retry(3),
                    take(1),
                    tap(res => page.stylesheets[s] = res.stylesheet[s]),
                  );
                  acc.push(req$);
                }

                return acc;
              },
              [],
            );

            return forkJoin(reqs$).pipe(take(1), map(() => page));
          }

          return of(page);
        }),
        tap(page => this.setBasePage(page)),
      );
      page$.pipe(
        first(),
        tap(async (page: PebThemePageInterface) => {
          if (!this.migratedPageIds.find(id => id === page.id)) {
            this.migratedPageIds.push(page.id);

            console.log('START MIGRATIONS');
            const s = performance.now();
            page.template = await applyRecursive(page, page.template, this.env);
            // console.log(JSON.stringify(page));
            console.log(`MIGRATIONS RAN IN: ${((performance.now() - s) / 1000).toFixed(2)}s`);
            console.log(page);
          }
          if (!page.template?.id || !page.template?.type) {
            throw new Error(`Invalid page with id ${page.id}`);
          }

          this.page = page;
          this.activePageIdSubject$.next(page.id);
        }),
      ).subscribe();
    }
  }

  getPages(): Observable<PebThemePageInterface[]> {
    return forkJoin(this.snapshot.pages.map(page => this.api.getPage(this.theme.id, page.id)));
  }

  getPage(pageId: PebPageId): Observable<PebThemePageInterface> {
    return this.api.getPage(this.theme.id, pageId);
  }

  setPublishedActionId() {
    this.lastPublishedActionIdSubject$.next(this.lastActionId);
  }

  prepareActionForFonts(action: PebAction): PebAction {
    const pagePayload = { data: { fonts: this.page.data?.fonts } };

    const templateUpdateElements = action.effects.filter(effect =>
      [PebTemplateEffect.PatchElement, PebTemplateEffect.UpdateElement].includes(effect.type as PebTemplateEffect));

    if (templateUpdateElements.length > 0) {
      pagePayload.data.fonts = templateUpdateElements.reduce((acc, effect) => {
        const text = effect.payload?.data?.text;

        if (text) {
          Object.values(PebScreen).forEach((screen) => {
            if (text?.[screen]) {
              Object.values(PebLanguage).forEach((language) => {
                if (text[screen]?.[language]) {
                  const delta = new Delta(text?.[screen]?.[language]);
                  const fonts = [];

                  delta.eachLine((line: Delta) => {
                    line.ops.forEach((op) => {
                      const family = op.attributes?.fontFamily ?? 'Roboto';
                      const weight = `${op.attributes?.fontWeight ?? 400}${op.attributes?.italic ? 'i' : ''}`;
                      const index = fonts.findIndex(f => f.name === family);
                      if (index === -1) {
                        if (validateFont(family)) {
                          fonts.push({ name: family, weights: [weight] });
                        }
                      } else {
                        if (!fonts[index].weights.includes(weight)) {
                          fonts[index].weights.push(weight);
                        }
                      }
                    });
                  });

                  if (!acc?.[screen]) {
                    acc[screen] = {};
                  } else {
                    if (!acc[screen]?.[language]) {
                      acc[screen][language] = [];
                    }
                  }

                  if (acc[screen]?.[language]?.length) {
                    fonts.forEach((font) => {
                      const index = acc[screen][language].findIndex(f => f.name === font.name);

                      if (index === -1) {
                        acc[screen][language].push(font);
                      } else {
                        acc[screen][language][index].weights = [
                          ...new Set([
                            ...font.weights,
                            ...acc[screen][language][index].weights.map(weight => weight.toString()),
                          ]),
                        ];
                      }
                    });
                  } else {
                    acc[screen][language] = fonts;
                  }
                }
              });
            }
          });
        }

        return acc;

        function validateFont(familyName: string) {
          return pebFontFamilies.some(family => family.name.toLowerCase() === familyName.toLowerCase());
        }
      }, this.page.data?.fonts ?? {});

      action.effects.push({
        type: PebPageEffect.Update,
        target: `${PebEffectTarget.Pages}:${this.page.id}`,
        payload: pagePayload,
      });
    }

    return action;
  }

  commitAction(pebAction: PebAction): Observable<null> {
    const action = this.prepareActionForFonts(pebAction);
    this.logger.log(action);
    // TODO: Add hash comparing
    this.savingChangesSubject.next(ThemeSaveStatus.Saving);
    const { snapshot, pages } = pebActionHandler(
      {
        snapshot: this.snapshot,
        pages: this.pages,
      },
      Object.assign({}, action),
    );
    this.snapshot = snapshot;
    this.pages = pages;
    this.pushAction(action);
    this.addRequestToQueue(
      action.id,
      from(this.ws.addAction({ action, themeId: this.theme.id })).pipe(
        retry(3),
      ),
    );
    this.removeCanceledPageActions(action.targetPageId);

    return of(null);
  }

  undo(): Observable<void> {

    if (!this.canUndo) {
      return EMPTY;
    }

    const actions = this.actions;
    const action = actions.pop();
    const undoActions = [action];
    if (action.background) {
      undoActions.push(actions.pop());
    }

    this.savingChangesSubject.next(ThemeSaveStatus.Saving);
    const { snapshot, pages } = this.actions.reduce(
      (acc, a) => {
        if (a?.id && undoActions.every(undoAction => a.id !== undoAction.id)) {
          return pebActionHandler(acc, a);
        }

        return acc;
      },
      { snapshot: this.baseSnapshot, pages: this.basePages },
    );
    this.snapshot = snapshot;
    this.pages = pages;
    if (!pages[this.activePageId]) {
      const pageToOpen = snapshot.pages.find(p => p.type === PebPageType.Replica);
      if (pageToOpen) {
        this.openPage(pageToOpen.id);
      }
    }
    this.actionsSubject$.next(actions);
    this.canceledActionsSubject$.next([...this.canceledActionsSubject$.value, ...undoActions]);

    undoActions.forEach((a) => {
      this.addRequestToQueue(
        a.id,
        from(this.ws.deleteAction({ themeId: this.theme.id, actionId: a.id })).pipe(
          retry(3),
        ),
      );
    });

    return of(null);
  }

  redo(): Observable<void> {

    if (!this.canRedo) {
      return EMPTY;
    }

    this.savingChangesSubject.next(ThemeSaveStatus.Saving);
    const canceledActions = this.canceledActionsSubject$.value;
    const action = canceledActions.pop();
    const redoActions = [action];
    if (canceledActions.length && canceledActions[canceledActions.length - 1].background) {
      redoActions.push(canceledActions.pop());
    }

    const { snapshot, pages } = redoActions.reduce(
      (acc, a) => {
        return pebActionHandler(
          {
            snapshot: acc.snapshot,
            pages: acc.pages,
          },
          a,
        );
      },
      { snapshot: this.snapshot, pages: this.pages },
    );
    this.snapshot = snapshot;
    this.pages = pages;
    this.pushAction(...redoActions);
    this.canceledActionsSubject$.next(canceledActions);

    redoActions.forEach((a) => {
      this.addRequestToQueue(
        action.id,
        from(this.ws.addAction({ action: a, themeId: this.theme.id })).pipe(
          retry(3),
        ),
      );
    });

    return of(null);
  }

  updatePreview(previewURL: string): Observable<void> {
    return this.api.updateShopThemePreview(this.theme.id, previewURL).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        picture: previewURL,
      })),
    );
  }

  updatePagePreview(pageId: string, previewUrl: string, actionId: string): Observable<void> {
    const previews = {
      ...this.theme.source.previews,
      [pageId]: {
        previewUrl,
        actionId,
      },
    };

    return this.api.updateThemeSourcePagePreviews(this.theme.id, this.theme.source.id, previews).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        source: {
          ...this.theme.source,
          previews,
        },
      })),
    );
  }

  updateThemeName(name: string): Observable<void> {
    return this.api.updateShopThemeName(this.theme.id, name).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        name,
      })),
    );
  }

  updateThemeDefaultScreen(defaultScreen: PebScreen): Observable<void> {
    return this.api.updateShopThemeDefaultScreen(this.theme.id, defaultScreen).pipe(
      tap(() => this.themeSubject$.next({
        ...this.theme,
        defaultScreen,
      })),
    );
  }

  getLastThemeUpdate(): Observable<string> {
    return merge(
      this.snapshot$.pipe(
        map(() => {
          return this.getUpdateGap(this.snapshotSubject$.value?.updatedAt);
        }),
      ),
      interval(15000).pipe(
        map(() => {
          return this.getUpdateGap(this.snapshotSubject$.value?.updatedAt);
        }),
      ),
    );
  }

  getBusinessApps(): Observable<any> {
    return this.api.getBusinessApps();
  }

  private getUpdateGap(dateString: string): string {
    const gap = Date.now() - Date.parse(dateString).valueOf();
    let gapString: string;

    if (gap < 60 * 1000) {
      gapString = 'seconds';
    } else if (gap < 2 * 60 * 1000) {
      gapString = 'one minute';
    } else if (gap < 60 * 60 * 1000) {
      gapString = `${Math.floor(gap / 60000)} minutes`;
    } else if (gap < 2 * 60 * 60 * 1000) {
      gapString = 'one hour';
    } else if (gap < 24 * 60 * 60 * 1000) {
      gapString = `${Math.floor(gap / (60 * 60 * 1000))} hours`;
    } else if (gap < 2 * 24 * 60 * 60 * 1000) {
      gapString = 'one day';
    } else if (gap < 30 * 24 * 60 * 60 * 1000) {
      gapString = `${Math.floor(gap / (24 * 60 * 60 * 1000))} days`;
    } else if (gap < 2 * 30 * 24 * 60 * 60 * 1000) {
      gapString = 'one month';
    } else if (gap < 12 * 30 * 24 * 60 * 60 * 1000) {
      gapString = `${Math.floor(gap / (30 * 24 * 60 * 60 * 1000))} months`;
    } else if (gap < 2 * 12 * 30 * 24 * 60 * 60 * 1000) {
      gapString = 'one year';
    } else {
      gapString = `${Math.floor(gap / (12 * 30 * 24 * 60 * 60 * 1000))} years`;
    }

    return `Last edit was ${gapString} ago`;
  }

  getSavingStatus(): Observable<string> {
    return this.savingChangesSubject.asObservable();
  }

  private getBasePage(pageId: PebPageId): PebThemePageInterface {
    return this.basePages[pageId];
  }

  private setBasePage(page: PebThemePageInterface): void {
    if (!this.basePages[page.id]) {
      this.basePagesSubject$.next({
        ...this.basePages,
        [page.id]: page,
      });
    }
  }

  private getPageActions(pageId: PebPageId): PebAction[] {
    return this.actions.filter(action => action.affectedPageIds.some(id => id === pageId));
  }

  private pushAction(...actions: PebAction[]): void {
    this.actionsSubject$.next([...this.actions, ...actions]);
  }

  private getCanceledPageActions(pageId: PebPageId): PebAction[] {
    return this.canceledActions.filter(action => action.affectedPageIds.some(id => id === pageId));
  }

  private removeCanceledPageActions(pageId: PebPageId): void {
    this.canceledActionsSubject$.next(
      this.canceledActions.filter(action => action.affectedPageIds.every(id => id !== pageId)),
    );
  }
}
