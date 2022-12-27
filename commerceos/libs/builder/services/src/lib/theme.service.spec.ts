import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of, Subscription } from 'rxjs';
import { isEmpty } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import {
  PebEffectTarget,
  PebLanguage,
  PebPageEffect,
  PebPageType,
  PebScreen,
  PebTemplateEffect,
} from '@pe/builder-core';

import { SnackbarErrorService } from './snackbar-error.service';
import { PebEditorThemeService } from './theme.service';

describe('PebEditorThemeService', () => {

  let service: PebEditorThemeService;
  let api: jasmine.SpyObj<PebEditorApi>;
  let snackbarErrorService: jasmine.SpyObj<SnackbarErrorService>;

  beforeAll(() => {

    Object.defineProperties(pebCore, {
      pebActionHandler: {
        value: pebCore.pebActionHandler,
        writable: true,
      },
      applyRecursive: {
        value: pebCore.applyRecursive,
        writable: true,
      },
    });

  });

  beforeEach(() => {

    const apiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'getPage',
      'getPageStylesheet',
      'addAction',
      'undoAction',
      'updateShopThemePreview',
      'updateThemeSourcePagePreviews',
      'updateShopThemeName',
    ]);

    const snackbarErrorServiceSpy = jasmine.createSpyObj<SnackbarErrorService>('SnackbarErrorService', ['openSnackbarError']);

    TestBed.configureTestingModule({
      providers: [
        PebEditorThemeService,
        { provide: PebEditorApi, useValue: apiSpy },
        { provide: SnackbarErrorService, useValue: snackbarErrorServiceSpy },
      ],
    });

    service = TestBed.inject(PebEditorThemeService);
    api = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
    snackbarErrorService = TestBed.inject(SnackbarErrorService) as jasmine.SpyObj<SnackbarErrorService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get theme & theme$', () => {

    const themeMock = { test: true };

    service[`themeSubject$`].next(themeMock as any);

    expect(service.theme).toEqual(themeMock as any);
    service.theme$.subscribe((theme) => {
      expect(theme).toEqual(themeMock as any);
    });

  });

  it('should set/get base snapshot', () => {

    const baseSnapshotMock: any = { test: true };
    const nextSpy = spyOn(service[`baseSnapshotSubject$`], 'next').and.callThrough();

    service[`baseSnapshot`] = baseSnapshotMock;

    expect(nextSpy).toHaveBeenCalledWith(baseSnapshotMock);
    expect(service[`baseSnapshot`]).toEqual(baseSnapshotMock);

  });

  it('should set/get snapshot & snapshot$', () => {

    const snapshotMock: any = { test: true };
    const nextSpy = spyOn(service[`snapshotSubject$`], 'next').and.callThrough();

    service.snapshot = snapshotMock;

    expect(nextSpy).toHaveBeenCalledWith(snapshotMock);
    expect(service.snapshot).toEqual(snapshotMock);
    service.snapshot$.subscribe((snapshot) => {
      expect(snapshot).toEqual(snapshotMock);
    });

  });

  it('should get base pages', () => {

    const pagesMock: any = {
      'p-001': { id: 'p-001' },
    };

    service[`basePagesSubject$`].next(pagesMock);

    expect(service[`basePages`]).toEqual(pagesMock);

  });

  it('should set/get pages', () => {

    const newPages = {
      'p-002': { id: 'p-002n', type: null },
    };
    const nextSpy = spyOn(service[`pagesSubject$`], 'next').and.callThrough();

    service.snapshot = {
      pages: [
        { id: 'p-001', type: PebPageType.Master },
        { id: 'p-002', type: PebPageType.Replica },
      ],
    } as any;

    service.pages = newPages as any;

    expect(nextSpy).toHaveBeenCalledWith(newPages as any);
    expect(service.pages).toEqual(newPages as any);
    expect(service.snapshot.pages).toEqual([
      { id: 'p-001', type: PebPageType.Master },
      { id: 'p-002n', type: null },
    ] as any[]);

  });

  it('should set/get active page id', () => {

    const pageId = 'p-001';
    const nextSpy = spyOn(service[`activePageIdSubject$`], 'next').and.callThrough();

    service.activePageId = pageId;
    expect(service.activePageId).toEqual(pageId);
    expect(nextSpy).toHaveBeenCalledWith(pageId);

  });

  it('should get page$', () => {

    // IN pages
    service[`pagesSubject$`].next({
      'p-001': { id: 'p-001' },
    } as any);
    service[`activePageIdSubject$`].next('p-001');

    service.page$.subscribe(page => expect(page).toEqual({ id: 'p-001' } as any)).unsubscribe();

    // NOT IN pages
    service[`activePageIdSubject$`].next('p-002');

    service.page$.subscribe(page => expect(page).toBeNull());

  });

  it('should get page', () => {

    // w/o page
    expect(service.page).toBeNull();

    // w/ page
    service[`pagesSubject$`].next({
      'p-001': { id: 'p-001' },
    } as any);
    service[`activePageIdSubject$`].next('p-001');

    expect(service.page).toEqual({ id: 'p-001' } as any);

  });

  it('should set page', () => {

    service[`pagesSubject$`].next({
      'p-001': { id: 'p-001' },
      'p-002': { id: 'p-002' },
    } as any);
    service[`activePageIdSubject$`].next('p-001');

    // w/p page
    service.page = null;

    expect(service.pages).toEqual({ 'p-002': { id: 'p-002' } } as any);

  });

  it('should get las action id and as observable', () => {

    const actionsMock: any[] = [
      { id: 'a-001', background: false },
      { id: 'a-002', background: true },
    ];

    service.snapshot = { lastAction: 'a-003' } as any;
    service[`actionsSubject$`].next(actionsMock);

    expect(service.lastActionId).toEqual('a-001');
    service.lastActionId$.subscribe(id => expect(id).toEqual('a-001'));

  });

  it('should get active page actions and as observable', () => {

    const actionsMock: any[] = [{
      id: 'a-001',
      affectedPageIds: ['p-001'],
    }];

    service[`actionsSubject$`].next(actionsMock);

    spyOnProperty(service, 'activePageId').and.returnValue('p-001');
    spyOnProperty(service, 'page$').and.returnValue(of({ id: 'p-001' }));

    expect(service.activePageActions).toEqual(actionsMock);
    service.activePageActions$.subscribe(action => expect(action).toEqual(actionsMock));

  });

  it('should get actions', () => {

    const actionsMock = [{ test: true }];

    service[`actionsSubject$`].next(actionsMock as any);

    expect(service[`actions`]).toEqual(actionsMock as any);

  });

  it('should get canceled page actions and as observable', () => {

    const actionsMock: any[] = [
      {
        id: 'a-001',
        affectedPageIds: ['p-001'],
      },
      {
        id: 'a-002',
        affectedPageIds: ['p-002'],
      },
    ];

    service[`canceledActionsSubject$`].next(actionsMock);

    spyOnProperty(service, 'page$').and.returnValue(of({ id: 'p-001' }));

    expect(service[`canceledActions`]).toEqual(actionsMock);
    service[`canceledPageActions$`].subscribe(result => expect(result).toBe(true));

  });

  it('should get canRedo & canRedo$', () => {

    const actionsMock: any[] = [{
      id: 'a-001',
      affectedPageIds: ['p-001'],
    }];

    spyOnProperty(service, 'page$').and.returnValue(of({ id: 'p-001' }));

    // FALSE
    service[`canceledActionsSubject$`].next([]);

    expect(service[`canRedo`]).toBe(false);
    service.canRedo$.subscribe(can => expect(can).toBe(false)).unsubscribe();

    // TRUE
    service[`canceledActionsSubject$`].next(actionsMock);

    expect(service[`canRedo`]).toBe(true);
    service.canRedo$.subscribe(can => expect(can).toBe(true)).unsubscribe();

  });

  it('should get canUndo & canUndo$', () => {

    /**
     * service.actions$.value is []
     */
    service[`actionsSubject$`].next([]);

    expect(service[`canUndo`]).toBe(false);
    service.canUndo$.subscribe(can => expect(can).toBe(false)).unsubscribe();

    /**
     * service.actions$.value.length is more than 0
     */
    service[`actionsSubject$`].next([{ id: 'a-001' }] as any);

    expect(service[`canUndo`]).toBe(true);
    service.canUndo$.subscribe(can => expect(can).toBe(true)).unsubscribe();

  });

  it('should add/remove request to/from queue', () => {

    const nextSpy = spyOn(service[`requestsQueueSubject$`], 'next').and.callThrough();

    /**
     * add request
     */
    service[`addRequestToQueue`]('request', of({ request: true }));

    expect(nextSpy).toHaveBeenCalled();
    expect(service[`requestsQueueSubject$`].value.map(({ id }) => id)).toEqual(['request']);

    /**
     * remove request
     */
    service[`removeRequestFromQueue`]('request');

    expect(service[`requestsQueueSubject$`].value).toEqual([]);

  });

  it('should handle requests queue on construct', fakeAsync(() => {

    const reqId = 'req-001';
    const request = of({ test: 'request' });
    const removeSpy = spyOn<any>(service, 'removeRequestFromQueue');
    const addSpy = spyOn<any>(service, 'addRequestToQueue').and.callThrough();
    const nextSpy = spyOn(service[`savingChangesSubject`], 'next');
    let snackbarConfig: any;

    snackbarErrorService.openSnackbarError.and.callFake(config => snackbarConfig = config);

    /**
     * service.requestsQueueSubject$.value is null
     */
    service[`requestsQueueSubject$`].next(null);

    tick(100);

    expect(removeSpy).not.toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();

    /**
     * service.requestQueueSubject$.value is set
     */
    service[`requestsQueueSubject$`].next([{ id: reqId, request }]);

    tick(100);

    expect(removeSpy).toHaveBeenCalledWith(reqId);
    expect(addSpy).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith('saved');
    expect(snackbarErrorService.openSnackbarError).not.toHaveBeenCalled();

    /**
     * service.removeRequestFromQueue throws error as null
     */
    nextSpy.calls.reset();
    removeSpy.and.throwError(null);

    service.lastRemovedRequest = {
      request,
      id: reqId,
    };
    service[`requestsQueueSubject$`].next([{ id: reqId, request }]);

    tick(100);
    service[`requestsQueueSubject$`].complete();

    expect(nextSpy).toHaveBeenCalledWith('not saved');
    expect(addSpy).not.toHaveBeenCalled();
    expect(snackbarErrorService.openSnackbarError).toHaveBeenCalled();
    expect(snackbarConfig).toBeDefined();
    expect(snackbarConfig.reloadOnHide).toBe(false);

    snackbarConfig.retryAction();
    expect(addSpy).toHaveBeenCalledWith(reqId, request);

    /**
     * service.removeRequestFromQueue throws error as { status: 403 }
     */
    snackbarConfig = null;

    service = new PebEditorThemeService(api, snackbarErrorService);
    spyOn<any>(service, 'removeRequestFromQueue').and.throwError({ status: 403 } as any);
    service[`requestsQueueSubject$`].next([{ id: reqId, request }]);

    tick(100);
    service[`requestsQueueSubject$`].complete();

    expect(snackbarConfig).toBeDefined();
    expect(snackbarConfig.reloadOnHide).toBe(true);

  }));

  it('should set destroyed subject on destroy', () => {

    const spies = [
      spyOn(service[`destroyedSubject$`], 'next'),
      spyOn(service[`destroyedSubject$`], 'complete'),
    ];

    service.ngOnDestroy();

    spies.forEach(spy => expect(spy).toHaveBeenCalled());

  });

  it('should reset', () => {

    service.reset();

    expect(service[`themeSubject$`].value).toBeNull();
    expect(service[`snapshotSubject$`].value).toBeNull();
    expect(service[`savingChangesSubject`].value).toEqual('saved');
    expect(service[`pagesSubject$`].value).toEqual({});
    expect(service[`activePageIdSubject$`].value).toBeNull();
    expect(service[`actionsSubject$`].value).toEqual([]);

  });

  it('should open theme', () => {

    const themeMock: any = { id: 't-001' };
    const snapshotMock: any = { lastPublishedActionId: null };
    const nextSpy = spyOn(service[`lastPublishedActionIdSubject$`], 'next');

    /**
     * snapshot.lastPublishedActionId is null
     */
    service.openTheme(themeMock, snapshotMock);

    expect(service[`themeSubject$`].value).toEqual(themeMock);
    expect(service.snapshot).toEqual(snapshotMock);
    expect(service[`baseSnapshot`]).toEqual(snapshotMock);
    expect(service[`canceledActionsSubject$`].value).toEqual([]);
    expect(nextSpy).toHaveBeenCalledWith(null);

    /**
     * snapshot.lastPublishedActionId is set
     */
    snapshotMock.lastPublishedActionId = 'a-001';
    nextSpy.calls.reset();

    service.openTheme(themeMock, snapshotMock);

    expect(nextSpy).toHaveBeenCalledWith('a-001');

  });

  it('should open page', () => {

    const setBasePageSpy = spyOn<any>(service, 'setBasePage');
    const nextSpy = spyOn(service[`activePageIdSubject$`], 'next');
    const setPageSpy = spyOnProperty(service, 'page', 'set');
    const pagesSpy = spyOnProperty(service, 'pages');
    const themeSpy = spyOnProperty(service, 'theme');
    const applySpy = spyOn(pebCore, 'applyRecursive').and.callFake((_, items) => items);
    const pageId = 'p-001';
    const themeId = 't-001';
    const pageMock = {
      id: pageId,
      type: PebPageType.Master,
      template: {
        children: [],
      },
      stylesheets: {},
    };
    const stylesheetMock = {
      [PebScreen.Desktop]: { color: '#333333' },
      [PebScreen.Tablet]: { display: 'none' },
    };

    /**
     * service.theme is null
     */
    themeSpy.and.returnValue(null);

    service.openPage(pageId);

    expect(api.getPage).not.toHaveBeenCalled();
    expect(api.getPageStylesheet).not.toHaveBeenCalled();
    expect(setBasePageSpy).not.toHaveBeenCalled();
    expect(setPageSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();
    expect(applySpy).not.toHaveBeenCalled();

    /**
     * service.theme is set
     * page exists in service.pages
     */
    themeSpy.and.returnValue({ id: themeId });
    pagesSpy.and.returnValue({
      [pageId]: pageMock,
    });

    service.openPage(pageId);

    expect(api.getPage).not.toHaveBeenCalled();
    expect(api.getPageStylesheet).not.toHaveBeenCalled();
    expect(setBasePageSpy).not.toHaveBeenCalled();
    expect(setPageSpy).toHaveBeenCalledWith(pageMock);
    expect(nextSpy).toHaveBeenCalledWith(pageId);
    expect(applySpy).toHaveBeenCalledWith(pageMock as any, pageMock.template.children);

    /**
     * argument screen is undefined as default
     * page does NOT exist in service.pages
     */
    pagesSpy.and.returnValue([]);
    api.getPage.and.returnValue(of(pageMock) as any);

    service.openPage(pageId);

    expect(api.getPage).toHaveBeenCalledWith(themeId, pageId, undefined);
    expect(api.getPageStylesheet).not.toHaveBeenCalled();
    expect(setBasePageSpy).toHaveBeenCalledWith(pageMock);

    /**
     * argument screen is set
     */
    api.getPageStylesheet.and.returnValue(of({
      id: pageId,
      stylesheet: stylesheetMock,
    }) as any);

    service.openPage(pageId, PebScreen.Mobile);

    expect(api.getPage).toHaveBeenCalledWith(themeId, pageId, PebScreen.Mobile);
    expect(api.getPageStylesheet.calls.allArgs()).toEqual([
      [themeId, pageId, PebScreen.Desktop],
      [themeId, pageId, PebScreen.Tablet],
    ]);
    expect(pageMock.stylesheets).toEqual(stylesheetMock);

  });

  it('should get pages', () => {

    service.snapshot = {
      pages: [
        { id: 'p-001' },
        { id: 'p-002' },
      ],
    } as any;

    spyOnProperty(service, 'theme').and.returnValue({ id: 't-001' });

    api.getPage.and.callFake((_, id) => {
      return of({ id }) as any;
    });

    service.getPages().subscribe(pages => expect(pages).toEqual([
      { id: 'p-001' },
      { id: 'p-002' },
    ] as any));

    expect(api.getPage).toHaveBeenCalled();

  });

  it('should get page', () => {

    const pageId = 'p-001';

    spyOnProperty(service, 'theme').and.returnValue({ id: 't-001' });

    api.getPage.and.callFake((_, id) => {
      return of({ id }) as any;
    });

    service.getPage(pageId).subscribe(page => expect(page).toEqual({ id: pageId } as any));

    expect(api.getPage).toHaveBeenCalled();

  });

  it('should set published action id', () => {

    const nextSpy = spyOn(service[`lastPublishedActionIdSubject$`], 'next');

    spyOnProperty(service, 'lastActionId').and.returnValue('a-001');
    service.setPublishedActionId();

    expect(nextSpy).toHaveBeenCalledWith('a-001');

  });

  it('should prepare action for fonts', () => {

    const pageMock = {
      id: 'p-001',
      data: {},
    };
    const actionMock = {
      id: 'a-001',
      effects: [],
    };

    spyOnProperty(service, 'page').and.returnValue(pageMock);

    /**
     * in argument action effects is []
     */
    expect(service.prepareActionForFonts(actionMock as any)).toEqual(actionMock as any);

    /**
     * in argument action effects is set
     * effect.payload.data is null
     * service.page.data is null
     */
    actionMock.effects.push({
      type: PebTemplateEffect.UpdateElement,
      payload: {
        data: null,
      },
    });

    service.prepareActionForFonts(actionMock as any);

    expect(actionMock).toEqual({
      id: 'a-001',
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          payload: {
            data: null,
          },
        },
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${pageMock.id}`,
          payload: {
            data: {
              fonts: {},
            },
          },
        },
      ],
    });

    /**
     * effect.payload.data.text is set
     * service.page.data.fonts is null
     */
    actionMock.effects = [
      {
        type: PebTemplateEffect.UpdateElement,
        payload: {
          data: {
            text: {
              [PebScreen.Desktop]: {
                [PebLanguage.English]: [
                  { attributes: null },
                  {
                    attributes: {
                      fontFamily: 'Cabin',
                      fontWeight: 500,
                      italic: false,
                    },
                  },
                  {
                    attributes: {
                      fontFamily: 'Cabin',
                      fontWeight: 500,
                      italic: false,
                    },
                  },
                  {
                    attributes: {
                      fontFamily: 'Cabin',
                      fontWeight: 700,
                      italic: true,
                    },
                  },
                ],
              },
              [PebScreen.Tablet]: {
                [PebLanguage.German]: [],
              },
              [PebScreen.Mobile]: {
                [PebLanguage.Italian]: [],
              },
            },
          },
        },
      },
      {
        type: PebTemplateEffect.UpdateElement,
        payload: {
          data: {
            text: {
              [PebScreen.Desktop]: {
                [PebLanguage.German]: [
                  {
                    attributes: {
                      fontFamily: 'Cabin',
                      fontWeight: 400,
                      italic: true,
                    },
                  },
                  {
                    attributes: {
                      fontFamily: 'Montserrat',
                      fontWeight: 700,
                      italic: false,
                    },
                  },
                  {
                    attributes: {
                      fontFamily: 'Oswald',
                      fontWeight: 500,
                      italic: false,
                    },
                  },
                ],
              },
              [PebScreen.Mobile]: {
                [PebLanguage.Italian]: [],
              },
            },
          },
        },
      },
    ];
    pageMock.data = {
      fonts: {
        [PebScreen.Desktop]: {
          [PebLanguage.English]: [],
          [PebLanguage.German]: [
            {
              name: 'Cabin',
              weights: [],
            },
            {
              name: 'Montserrat',
              weights: ['300'],
            },
          ],
        },
        [PebScreen.Mobile]: {},
      },
    };

    service.prepareActionForFonts(actionMock as any);

    expect(actionMock.effects.find(e => e.type === PebPageEffect.Update).payload.data.fonts).toEqual({
      [PebScreen.Desktop]: {
        [PebLanguage.English]: [
          {
            name: 'Roboto',
            weights: ['400'],
          },
          {
            name: 'Cabin',
            weights: ['500', '700i'],
          },
        ],
        [PebLanguage.German]: [
          {
            name: 'Cabin',
            weights: ['400i'],
          },
          {
            name: 'Montserrat',
            weights: ['700', '300'],
          },
          {
            name: 'Oswald',
            weights: ['500'],
          },
        ],
      },
      [PebScreen.Tablet]: {
        [PebLanguage.German]: [],
      },
      [PebScreen.Mobile]: {
        [PebLanguage.Italian]: [],
      },
    });

  });

  it('should commit action', () => {

    const actionMock = {
      id: 'a-001',
      targetPageId: 'p-001',
      effects: [],
    };
    const prepareSpy = spyOn(service, 'prepareActionForFonts').and.returnValue(actionMock as any);
    const logSpy = spyOn(service[`logger`], 'log');
    const nextSpy = spyOn(service[`savingChangesSubject`], 'next').and.callThrough();
    const pushSpy = spyOn<any>(service, 'pushAction').and.callThrough();
    const addSpy = spyOn<any>(service, 'addRequestToQueue');
    const removeSpy = spyOn<any>(service, 'removeCanceledPageActions');
    const snapshotMock = {
      pages: [],
    };

    service[`themeSubject$`].next({ id: 't-001' } as any);
    api.addAction.and.returnValue(of({ id: actionMock.id }));

    const handlerSpy = spyOn(pebCore, 'pebActionHandler').and.returnValue({
      snapshot: snapshotMock,
      pages: {},
    } as any);

    service.commitAction(actionMock as any).subscribe();

    expect(prepareSpy).toHaveBeenCalledWith(actionMock as any);
    expect(logSpy).toHaveBeenCalledWith(actionMock);
    expect(nextSpy).toHaveBeenCalledWith('saving');
    expect(handlerSpy).toHaveBeenCalled();
    expect(pushSpy).toHaveBeenCalledWith(actionMock);
    expect(addSpy).toHaveBeenCalled();
    expect(api.addAction).toHaveBeenCalledWith('t-001', actionMock as any);
    expect(removeSpy).toHaveBeenCalledWith(actionMock.targetPageId);

  });

  it('should undo', () => {

    const canUndoSpy = spyOnProperty<any>(service, 'canUndo');
    const savingNextSpy = spyOn(service[`savingChangesSubject`], 'next');
    const openPageSpy = spyOn(service, 'openPage');
    const addRequestSpy = spyOn<any>(service, 'addRequestToQueue');
    const handlerSpy = spyOn(pebCore, 'pebActionHandler');
    const activePageIdSpy = spyOnProperty(service, 'activePageId');
    const actionsNextSpy = spyOn(service[`actionsSubject$`], 'next');
    const cancelledNextSpy = spyOn(service[`canceledActionsSubject$`], 'next');
    const actionMock = { id: 'a-002', background: false };
    const actionsMock = [
      { id: 'a-001' },
      null,
      actionMock,
    ];
    const pagesMock = {
      'p-001': { id: 'p-001', type: PebPageType.Master },
      'p-002': { id: 'p-002', type: PebPageType.Master },
    };
    const baseSnapshotMock = {
      id: 'snap-001',
      pages: Object.values(pagesMock),
    };

    handlerSpy.and.callFake((state, _) => {
      return {
        snapshot: state.snapshot,
        pages: pagesMock as any,
      };
    });
    spyOnProperty<any>(service, 'baseSnapshot').and.returnValue(baseSnapshotMock);
    spyOnProperty(service, 'actions').and.returnValue(actionsMock);
    spyOnProperty(service, 'theme').and.returnValue({ id: 't-001' });

    api.undoAction.and.returnValue(of(null));

    /**
     * service.canUndo is FALSE
     */
    canUndoSpy.and.returnValue(false);

    service.undo().pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

    expect(savingNextSpy).not.toHaveBeenCalled();
    expect(handlerSpy).not.toHaveBeenCalled();
    expect(openPageSpy).not.toHaveBeenCalled();
    expect(actionsNextSpy).not.toHaveBeenCalled();
    expect(cancelledNextSpy).not.toHaveBeenCalled();
    expect(addRequestSpy).not.toHaveBeenCalled();
    expect(api.undoAction).not.toHaveBeenCalled();

    /**
     * service.canUndo is TRUE
     * service.activePageId is null
     * last action in service.actions has background prop as FALSE
     * snapshot.pages does NOT have a page with type PebPageType.Replica
     */
    activePageIdSpy.and.returnValue(null);
    canUndoSpy.and.returnValue(true);

    service.undo().subscribe();

    expect(savingNextSpy).toHaveBeenCalledWith('saving');
    expect(handlerSpy).toHaveBeenCalledOnceWith({
      snapshot: baseSnapshotMock,
      pages: {},
    } as any, { id: 'a-001' } as any);
    expect(openPageSpy).not.toHaveBeenCalled();
    expect(actionsNextSpy).toHaveBeenCalledWith(actionsMock as any[]);
    expect(cancelledNextSpy).toHaveBeenCalledWith([actionMock] as any[]);
    expect(addRequestSpy).toHaveBeenCalled();
    expect(api.undoAction).toHaveBeenCalledWith('t-001', actionMock.id);

    /**
     * snapshot.pages has a page with type PebPageType.Replica
     * last action in service.actions has background prop as TRUE
     */
    pagesMock['p-001'].type = PebPageType.Replica;
    actionMock.background = true;
    actionsMock.push({ id: 'a-003' });
    actionsMock.push(actionMock);

    service.undo().subscribe();

    expect(openPageSpy).toHaveBeenCalledOnceWith(pagesMock['p-001'].id);

    /**
     * service.activePageId is set
     * last action in service.actions has background prop as FALSE
     */
    activePageIdSpy.and.returnValue('p-001');
    openPageSpy.calls.reset();
    actionMock.background = false;
    actionsMock.push(actionMock);

    service.undo().subscribe();

    expect(openPageSpy).not.toHaveBeenCalled();

  });

  it('should redo', () => {

    const canRedoSpy = spyOnProperty<any>(service, 'canRedo');
    const savingNextSpy = spyOn(service[`savingChangesSubject`], 'next');
    const addRequestSpy = spyOn<any>(service, 'addRequestToQueue');
    const handlerSpy = spyOn(pebCore, 'pebActionHandler');
    const pushSpy = spyOn<any>(service, 'pushAction');
    const actionMock = { id: 'a-002', background: false };
    const actionsMock = [
      { id: 'a-001' },
      actionMock,
    ];
    const pagesMock = {
      'p-001': { id: 'p-001', type: PebPageType.Master },
      'p-002': { id: 'p-002', type: PebPageType.Master },
    };
    const snapshotMock = {
      id: 'snap-001',
      pages: Object.values(pagesMock),
    };

    handlerSpy.and.callFake((state, _) => {
      return {
        snapshot: state.snapshot,
        pages: pagesMock as any,
      };
    });
    spyOnProperty<any>(service, 'snapshot').and.returnValue(snapshotMock);
    spyOnProperty(service, 'pages').and.returnValue(pagesMock);
    spyOnProperty(service, 'theme').and.returnValue({ id: 't-001' });

    api.addAction.and.returnValue(of(null));

    /**
     * service.canRedo is FALSE
     */
    canRedoSpy.and.returnValue(false);

    service[`canceledActionsSubject$`].next(actionsMock as any[]);
    const cancelledNextSpy = spyOn(service[`canceledActionsSubject$`], 'next');

    service.redo().pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

    expect(savingNextSpy).not.toHaveBeenCalled();
    expect(handlerSpy).not.toHaveBeenCalled();
    expect(pushSpy).not.toHaveBeenCalled();
    expect(cancelledNextSpy).not.toHaveBeenCalled();
    expect(addRequestSpy).not.toHaveBeenCalled();
    expect(api.addAction).not.toHaveBeenCalled();

    /**
     * service.canRedo is TRUE
     * first action in cancelled actions has prop background as FALSE
     */
    canRedoSpy.and.returnValue(true);

    service.redo().subscribe();

    expect(savingNextSpy).toHaveBeenCalledWith('saving');
    expect(handlerSpy).toHaveBeenCalledOnceWith({
      snapshot: snapshotMock,
      pages: pagesMock,
    } as any, actionMock as any);
    expect(pushSpy).toHaveBeenCalledWith(actionMock);
    expect(cancelledNextSpy).toHaveBeenCalledWith(actionsMock as any[]);
    expect(addRequestSpy).toHaveBeenCalled();
    expect(api.addAction).toHaveBeenCalledWith('t-001', actionMock as any);

    /**
     * first action in cancelled actions has prop background as TRUE
     */
    addRequestSpy.calls.reset();
    api.addAction.calls.reset();
    actionMock.background = true;
    actionsMock.unshift(actionMock);

    service.redo().subscribe();

    expect(addRequestSpy.calls.allArgs().map(([a]) => a)).toEqual(Array(2).fill('a-001'));
    expect(api.addAction.calls.allArgs()).toEqual([
      ['t-001', { id: 'a-001' }],
      ['t-001', actionMock],
    ] as any[])

  });

  it('should update preview', () => {

    const previewUrl = 'test';

    service[`themeSubject$`].next({ id: 'theme' } as any);

    api.updateShopThemePreview.and.returnValue(of(() => { }) as any);

    service.updatePreview(previewUrl).subscribe();

    expect(api.updateShopThemePreview).toHaveBeenCalledWith('theme', previewUrl);
    expect(service.theme).toEqual({
      id: 'theme',
      picture: previewUrl,
    } as any);

  });

  it('should update page preview', () => {

    const pageId = 'page';
    const previewUrl = 'test';
    const actionId = 'action';
    const themeMock = {
      id: 'theme',
      source: {
        id: 'srouce',
        previews: {},
      },
    };
    const nextSpy = spyOn(service[`themeSubject$`], 'next').and.callThrough();

    service[`themeSubject$`].next(themeMock as any);

    api.updateThemeSourcePagePreviews.and.returnValue(of({ updated: true }));

    service.updatePagePreview(pageId, previewUrl, actionId).subscribe((result: any) => {
      expect(result.updated).toBe(true);
      expect(api.updateThemeSourcePagePreviews).toHaveBeenCalled();
      expect(nextSpy).toHaveBeenCalled();
    });

  });

  it('should update theme name', () => {

    const name = 'name';

    service[`themeSubject$`].next({ id: 'theme' } as any);

    api.updateShopThemeName.and.returnValue(of({ updated: true }));

    service.updateThemeName(name).subscribe((result: any) => {
      expect(result.updated).toBe(true);
      expect(api.updateShopThemeName).toHaveBeenCalledWith('theme', name);
      expect(service.theme).toEqual({
        name,
        id: 'theme',
      } as any);
    });

  });

  it('should get last theme update', fakeAsync(() => {

    let subscription: Subscription;
    const interval = 15000;
    let date: Date;

    // w/o value
    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was NaN years ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // w/ values
    // seconds
    date = new Date();
    date.setSeconds(date.getSeconds() - 10);
    service.snapshot = {
      updatedAt: date.toUTCString(),
    } as any;

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was seconds ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // 1 minute
    date = new Date();
    date.setMinutes(date.getMinutes() - 1);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was one minute ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // > 1 minute
    date = new Date();
    date.setMinutes(date.getMinutes() - 13);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was 13 minutes ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // 1 hour
    date = new Date();
    date.setHours(date.getHours() - 1);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was one hour ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // > 1 hour
    date = new Date();
    date.setHours(date.getHours() - 13);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was 13 hours ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // 1 day
    date = new Date();
    date.setDate(date.getDate() - 1);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was one day ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // > 1 day
    date = new Date();
    date.setDate(date.getDate() - 13);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was 13 days ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // 1 month
    date = new Date();
    date.setMonth(date.getMonth() - 1);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was one month ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // > 1 month
    date = new Date();
    date.setMonth(date.getMonth() - 3);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was 3 months ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // 1 year
    date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was one year ago');
    });

    tick(interval);

    subscription.unsubscribe();

    // > 1 year
    date = new Date();
    date.setFullYear(date.getFullYear() - 13);
    service.snapshot.updatedAt = date.toUTCString();

    subscription = service.getLastThemeUpdate().subscribe((result) => {
      expect(result).toEqual('Last edit was 13 years ago');
    });

    tick(interval);

    subscription.unsubscribe();

  }));

  it('should get saving status', () => {

    service.getSavingStatus().subscribe((status) => {
      expect(status).toEqual('saved');
    });

  });

  it('should set/get base page', () => {

    const page: any = { id: 'p-001' };
    const nextSpy = spyOn(service[`basePagesSubject$`], 'next').and.callThrough();

    // NOT IN basePages
    service[`setBasePage`](page);

    expect(nextSpy).toHaveBeenCalledWith({
      [page.id]: page,
    } as any);

    // IN basePages
    nextSpy.calls.reset();

    service[`setBasePage`](page);

    expect(nextSpy).not.toHaveBeenCalled();

    // get
    expect(service[`getBasePage`]('p-001')).toEqual(page);

  });

  it('should get cancelled page actions', () => {

    spyOnProperty<any>(service, 'canceledActions').and.returnValue([
      {
        id: 'a-001',
        affectedPageIds: [],
      },
      {
        id: 'a-002',
        affectedPageIds: ['p-001'],
      },
    ]);

    expect(service[`getCanceledPageActions`]('p-001')[0].id).toEqual('a-002');

  });

  it('should remove canceled page actions', () => {

    const nextSpy = spyOn(service[`canceledActionsSubject$`], 'next');

    spyOnProperty<any>(service, 'canceledActions').and.returnValue([
      {
        id: 'a-001',
        affectedPageIds: [],
      },
      {
        id: 'a-002',
        affectedPageIds: ['p-001'],
      },
    ]);

    service[`removeCanceledPageActions`]('p-001');

    expect(nextSpy).toHaveBeenCalledWith([{ id: 'a-001', affectedPageIds: [] }] as any);

  });

});
