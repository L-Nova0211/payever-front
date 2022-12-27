import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { PebEditorApi } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import {
  HandlerStateEffect,
  PebAction,
  PebContextSchemaEffect,
  PebEditorState,
  PebEffect,
  PebEffectTarget,
  PebElementType,
  PebLanguage,
  PebPageEffect,
  PebPageType,
  PebPageVariant,
  PebScreen,
  PebShopEffect,
  PebStylesheetEffect,
  PebTemplateEffect,
} from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { omit } from 'lodash';
import { BehaviorSubject, EMPTY, of } from 'rxjs';
import { isEmpty } from 'rxjs/operators';
import * as acs from './action-creator.service';
import { PebActionType } from './action-creator.service';
import {
  extractPageFromSnapshot,
  makeAppendElementAction,
  makePasteElementAction,
  PebEditorStore,
  setSnapshotDefaultRoutes,
} from './editor.store';
import { PebEditorThemeService } from './theme.service';

describe('PebEditorStore', () => {

  let store: PebEditorStore;
  let api: jasmine.SpyObj<PebEditorApi>;
  let themeService: jasmine.SpyObj<PebEditorThemeService>;
  let generateIdSpy: jasmine.Spy;

  function setSnapshot(store) {

    store.snapshot = {
      pages: [
        {
          id: 'p-001',
          name: 'page',
          variant: PebPageVariant.Front,
          type: PebPageType.Master,
          lastActionId: 'la-001',
          master: null,
          data: {},
          templateId: 'temp-001',
          stylesheetIds: {
            [PebScreen.Desktop]: 'd-001',
            [PebScreen.Tablet]: 't-001',
            [PebScreen.Mobile]: 'm-001',
          },
          contextId: 'c-001',
        },
      ],
      templates: {
        'temp-001': {
          id: 'temp-001',
        },
      },
      stylesheets: {
        'd-001': {
          'd-001': { margin: '10px 20px 10px 20px' },
        },
        't-001': {},
        'm-001': {},
      },
      contextSchemas: {
        'c-001': {},
      },
    } as any;

  }

  beforeAll(() => {

    Object.defineProperty(acs, 'pebCreateAction', {
      value: acs.pebCreateAction,
      writable: true,
    });

    Object.defineProperties(pebCore, {
      pebCreateEmptyPage: {
        value: pebCore.pebCreateEmptyPage,
        writable: true,
      },
      pebGenerateId: {
        value: pebCore.pebGenerateId,
        writable: true,
      },
      getElementKitTransformationDeep: {
        value: pebCore.getElementKitTransformationDeep,
        writable: true,
      },
      generateUniqueIdsForPage: {
        value: pebCore.generateUniqueIdsForPage,
        writable: true,
      },
    });

  });

  beforeEach(() => {

    generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    generateIdSpy.withArgs('action').and.returnValue('gid-a-001');
    generateIdSpy.withArgs('page').and.returnValue('gid-p-001');

    const themeServiceSpy = jasmine.createSpyObj<PebEditorThemeService>('PebEditorThemeService', [
      'openTheme',
      'updatePreview',
      'updateThemeName',
      'undo',
      'redo',
      'updatePagePreview',
      'commitAction', ,
      'openPage',
      'reset',
      'getPage',
      'getPages',
      'setPublishedActionId',
    ]);
    themeServiceSpy['page$' as any] = new BehaviorSubject({
      id: 'p-001',
      name: 'page',
      variant: PebPageVariant.Front,
      type: PebPageType.Master,
      lastActionId: 'la-001',
      master: null,
      data: {},
      templateId: 'temp-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
      contextId: 'c-001',
      templates: {
        'temp-001': {
          id: 'temp-001',
        },
      },
      stylesheets: {
        [PebScreen.Desktop]: {
          'd-001': { margin: '10px 20px 10px 20px' },
        },
        [PebScreen.Tablet]: {
          't-001': {},
        },
        [PebScreen.Mobile]: {
          'm-001': {},
        },
      },
      contextSchemas: {
        'c-001': {},
      },
    });
    themeServiceSpy.page = {
      id: 'p-001',
      name: 'page',
      variant: PebPageVariant.Front,
      type: PebPageType.Master,
      lastActionId: 'la-001',
      master: null,
      data: {},
      templateId: 'temp-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
      contextId: 'c-001',
      templates: {
        'temp-001': {
          id: 'temp-001',
        },
      },
      stylesheets: {
        [PebScreen.Desktop]: {
          'd-001': { margin: '10px 20px 10px 20px' },
        },
        [PebScreen.Tablet]: {
          't-001': {},
        },
        [PebScreen.Mobile]: {
          'm-001': {},
        },
      },
      contextSchemas: {
        'c-001': {},
      },
    } as any;
    themeServiceSpy.commitAction.and.returnValue(of(null));

    const apiSpy = jasmine.createSpyObj<PebEditorApi>('PebEditorApi', [
      'updateReplicas',
      'getPage',
    ]);

    const stateMock = {
      language: PebLanguage.English,
      screen: PebScreen.Desktop,
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent']);

    TestBed.configureTestingModule({
      providers: [
        PebEditorStore,
        { provide: PebEditorThemeService, useValue: themeServiceSpy },
        { provide: PebEditorApi, useValue: apiSpy },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorRenderer, useValue: rendererSpy },
      ],
    });

    store = TestBed.inject(PebEditorStore);
    api = TestBed.inject(PebEditorApi) as jasmine.SpyObj<PebEditorApi>;
    themeService = TestBed.inject(PebEditorThemeService) as jasmine.SpyObj<PebEditorThemeService>;

  });

  it('should be defined', () => {

    expect(store).toBeDefined();

  });

  it('should handle ng destroy', () => {

    const spies = {
      next: spyOn(store[`destroyedSubject$`], 'next'),
      complete: spyOn(store[`destroyedSubject$`], 'complete'),
    };

    store.ngOnDestroy();

    expect(spies.next).toHaveBeenCalledWith(true);
    expect(spies.complete).toHaveBeenCalled();

  });

  it('should get theme & theme$', () => {

    const themeMock = { test: true };

    themeService['theme' as any] = themeMock;
    themeService['theme$' as any] = of(themeMock);

    expect(store.theme).toEqual(themeMock as any);
    store.theme$.subscribe((theme) => {
      expect(theme).toEqual(themeMock as any);
    });

  });

  it('shoule set/get snapshot & snapshot$', () => {

    const snapshotMock = { test: true };

    store.snapshot = snapshotMock as any;
    themeService['snapshot$' as any] = of(snapshotMock);

    expect(store.snapshot).toEqual(snapshotMock as any);
    expect(themeService.snapshot).toEqual(snapshotMock as any);
    store.snapshot$.subscribe((snap) => {
      expect(snap).toEqual(snapshotMock as any);
    });

  });

  it('should get pages, page & page$', () => {

    const pagesMock: any = { 'p-001': { id: 'p-001' } };

    themeService.pages = pagesMock;

    expect(store.pages).toEqual(pagesMock);
    expect(store.page.id).toEqual('p-001');
    store.page$.subscribe(page => expect(page.id).toEqual('p-001'));

  });

  it('should get active page id', () => {

    const pageMock: any = { id: 'p-001' };

    /**
     * themeService.page is null
     */
    themeService.page = null;

    expect(store.activePageId).toBeNull();

    /**
     * themeService.page is set
     */
    themeService.page = pageMock;

    expect(store.activePageId).toEqual('p-001');

  });

  it('should get active page id observable', () => {

    /**
     * themeService.page is set
     */
    store.activePageId$.subscribe(id => expect(id).toEqual('p-001')).unsubscribe();

    /**
     * themeService.page is null
     */
    (themeService.page$ as BehaviorSubject<any>).next(null);
    store.activePageId$.subscribe(id => expect(id).toBeNull()).unsubscribe();

  });

  it('should get last action id', () => {

    // there is loop code
    expect().nothing();

  });

  it('should check is effect template related', () => {

    const effect = { type: PebStylesheetEffect.Init };

    expect(store.isTemplateEffect(effect)).toBe(false);

    effect.type = PebTemplateEffect.Init as any;
    expect(store.isTemplateEffect(effect)).toBe(true);

  });

  it('should check is effect stylesheet related', () => {

    const effect = { type: PebTemplateEffect.Init };

    expect(store.isStylesheetEffect(effect)).toBe(false);

    effect.type = PebStylesheetEffect.Init as any;
    expect(store.isStylesheetEffect(effect)).toBe(true);

  });

  it('should get active page actions observable', () => {

    const actionsMock = [{ id: 'a-001' }];

    themeService[`activePageActions$` as any] = of(actionsMock);

    store.activePageActions$.subscribe(actions => expect(actions).toEqual(actionsMock));

  });

  it('should get active page actions', () => {

    const actionsMock: any = [{ id: 'a-001' }];

    themeService[`activePageActions` as any] = actionsMock;

    expect(store.activePageActions).toEqual(actionsMock);

  });

  it('should get page actions', () => {

    const actionsMock: any = [{ id: 'a-001' }];

    themeService[`actions` as any] = actionsMock;

    expect(store.pageActions).toEqual(actionsMock);

  });

  it('should reset', () => {

    store.reset();

    expect(themeService.reset).toHaveBeenCalled();

  });

  it('should open theme', () => {

    const themeMock: any = { id: 'theme' };
    const snapshotMock = {
      application: null,
      pages: null,
    };
    const activateSpy = spyOn(store, 'activatePage');
    const warnSpy = spyOn(console, 'warn');
    const pagesMock = [{
      id: 'p-001',
      variant: PebPageVariant.Default,
    }];

    /**
     * argument theme is null
     */
    expect(() => {
      store.openTheme(null, null, null);
    }).toThrowError('Attempt to initiate store for empty theme');
    expect(themeService.openTheme).not.toHaveBeenCalled();
    expect(themeService.openPage).not.toHaveBeenCalled();
    expect(activateSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();

    /**
     * argument snapshot.application is null
     * argument snapshot.pages is null
     * argument initialPageId is null
     */
    store.openTheme(themeMock, snapshotMock as any, null);

    expect(themeService.openTheme).toHaveBeenCalledWith(themeMock, snapshotMock as any);
    expect(themeService.openPage).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalled();
    expect(activateSpy).toHaveBeenCalledWith(undefined);

    /**
     * argument snapshot.application.data is null
     * argument snapshot.pages is []
     */
    snapshotMock.application = { data: null };
    snapshotMock.pages = [];

    store.openTheme(themeMock, snapshotMock as any, null);

    expect(themeService.openPage).not.toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledTimes(2);
    expect(activateSpy).toHaveBeenCalledWith(undefined);

    /**
     * argument snapshot.application.data is set
     * argument snapshot.pages is set
     */
    snapshotMock.application = {
      data: {
        defaultLanguage: PebLanguage.Chinese,
      },
    };
    snapshotMock.pages = pagesMock;

    store.openTheme(themeMock, snapshotMock as any, null);

    expect(themeService.openPage).not.toHaveBeenCalled();
    expect(store[`state`].language).toEqual(PebLanguage.Chinese);
    expect(activateSpy).toHaveBeenCalledWith(pagesMock[0].id);
    expect(warnSpy).toHaveBeenCalledTimes(3);

    /**
     * argument snapshot.pages has a page with variant PebPageVariant.Front
     */
    warnSpy.calls.reset();
    pagesMock.push({
      id: 'p-002',
      variant: PebPageVariant.Front,
    });

    store.openTheme(themeMock, snapshotMock as any, null);

    expect(themeService.openPage).not.toHaveBeenCalled();
    expect(activateSpy).toHaveBeenCalledWith('p-002');
    expect(warnSpy).not.toHaveBeenCalled();

    /**
     * argument initialPageId is set
     */
    activateSpy.calls.reset();

    store.openTheme(themeMock, snapshotMock as any, 'p-013');

    expect(themeService.openPage).toHaveBeenCalledWith('p-013', PebScreen.Desktop);
    expect(warnSpy).not.toHaveBeenCalled();
    expect(activateSpy).not.toHaveBeenCalled();

  });

  it('should set version update', () => {

    const nextSpy = spyOn(store[`versionUpdatedSubject$`], 'next');

    store.setVersionUpdated();

    expect(nextSpy).toHaveBeenCalledWith(true);

  });

  it('should set published action id', () => {

    store.setLastPublishedActionId();

    expect(themeService.setPublishedActionId).toHaveBeenCalled();

  });

  it('should update theme preview', () => {

    const url = 'test';

    themeService.updatePreview.and.returnValue(of(null));

    store.updateThemePreview(url).subscribe();

    expect(themeService.updatePreview).toHaveBeenCalledWith(url);

  });

  it('should update theme name', () => {

    const name = 'test';

    themeService.updateThemeName.and.returnValue(of(null));

    store.updateThemeName(name).subscribe();

    expect(themeService.updateThemeName).toHaveBeenCalledWith(name);

  });

  it('should activate page', fakeAsync(() => {

    store.snapshot = {
      pages: [{
        id: 'p-001',
        type: PebPageType.Master,
      }],
    } as any;

    // w/o page id
    store.activatePage(null).pipe(isEmpty()).subscribe((empty) => {
      expect(empty).toBe(true);
      expect(themeService.openPage).toHaveBeenCalledWith(null, PebScreen.Desktop);
    });

    // w/o page
    themeService.openPage.calls.reset();

    store.activatePage('p-002').pipe(isEmpty()).subscribe((empty) => {
      expect(empty).toBe(true);
      expect(themeService.openPage).not.toHaveBeenCalled();
    });

    // w/ page
    store.activatePage('p-001').subscribe(result => expect(result).toEqual('p-001'));

    tick(50);

    expect(store.lastActivePages[PebPageType.Master]).toEqual('p-001');
    expect(themeService.openPage.calls.allArgs()).toEqual([
      [null, PebScreen.Desktop],
      ['p-001', PebScreen.Desktop],
    ]);

  }));

  it('should activate last page by view', () => {

    const activateSpy = spyOn(store, 'activatePage').and.returnValue(of({ activated: true }));
    const type = PebPageType.Master;

    store.snapshot = {
      pages: [
        {
          id: 'p-001',
          type: PebPageType.Replica,
        },
      ],
    } as any;

    // w/o active page
    store.activateLastPageByView(type).subscribe();

    expect(activateSpy).not.toHaveBeenCalled();

    // w/ possible page
    store.snapshot.pages[0].type = PebPageType.Master;

    store.activateLastPageByView(type).subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    expect(activateSpy).toHaveBeenCalledWith('p-001');
    expect(activateSpy).toHaveBeenCalledTimes(1);

    // w/ active page
    store.lastActivePages[type] = 'p-001';

    store.activateLastPageByView(type).subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    expect(activateSpy).toHaveBeenCalledWith('p-001');
    expect(activateSpy).toHaveBeenCalledTimes(2);

  });

  it('should create page', () => {

    const input = {
      name: 'new page',
      variant: PebPageVariant.Default,
      type: PebPageType.Master,
      masterId: null,
    };
    const emptyPageMock = {
      id: 'np-001',
      type: null,
    };
    const forkedPageMock = {
      id: 'fp-001',
      type: null,
      master: { id: 'master-001' },
    };
    const actionMock: any = { id: 'a-001' };
    const activateSpy = spyOn(store, 'activatePage').and.returnValue(of(null));
    const forkSpy = spyOn<any>(store, 'forkMasterPage').and.returnValue(of({ empty: true }));
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));
    const createEmptyPageSpy = spyOn(pebCore, 'pebCreateEmptyPage').and.returnValue(emptyPageMock as any);
    const createActionSpy = spyOn(acs, 'pebCreateAction').and.returnValue(actionMock);

    // w/o master id & type = master
    store.createPage(input).subscribe();

    expect(forkSpy).toHaveBeenCalledWith(input.masterId, input.name);
    expect(createEmptyPageSpy).toHaveBeenCalledWith(input.name, input.variant, input.type);
    expect(activateSpy).not.toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalledWith(actionMock);
    expect(createActionSpy).toHaveBeenCalledWith(PebActionType.CreatePage as any, {
      ...emptyPageMock,
      type: PebPageType.Master,
      master: null,
    } as any);

    // w/ master id & type = replica
    // input.activatePage is TRUE
    input.masterId = 'master-001';
    input.type = PebPageType.Replica;
    input[`activatePage`] = true;
    forkSpy.and.returnValue(of(forkedPageMock));
    createActionSpy.calls.reset();

    store.createPage(input).subscribe();

    expect(activateSpy).toHaveBeenCalledWith(forkedPageMock.id);
    expect(createActionSpy).toHaveBeenCalledWith(PebActionType.CreatePage as any, forkedPageMock as any);

  });

  it('should update replicas', () => {

    spyOnProperty(store, 'theme').and.returnValue({ id: 't-001' });
    api.updateReplicas.and.returnValue(of({ id: 'updated' }) as any);

    store.updateReplicas([]).subscribe((result) => {
      expect(result.id).toEqual('updated');
      expect(themeService.snapshot.id).toEqual('updated');
      expect(api.updateReplicas).toHaveBeenCalledWith('t-001', []);
    });

  });

  it('should paste page', () => {

    const input = {
      name: 'paste',
      pageId: 'p-001',
      pageVariant: PebPageVariant.Front,
    };
    const pasteOrDuplicateSpy = spyOn(store, 'pasteOrDuplicatePageEffects');
    const commitSpy = spyOn(store, 'commitAction');
    const themeSpy = spyOnProperty(store, 'theme');
    const pageMock: any = {
      id: 'p-001',
      name: 'Page 1',
    };
    const actionMock: any = { id: 'a-001' };
    const effectsMock = [{
      type: PebPageEffect.Create,
      target: 'target',
      payload: { test: 'payload' },
    }];

    pasteOrDuplicateSpy.and.returnValue(effectsMock);
    commitSpy.and.returnValue(of(actionMock));

    /**
     * themeService.page is null
     * themeService.pages is set
     */
    themeService.page = null;
    themeService.pages = {
      [pageMock.id]: pageMock,
    };

    store.pastePage(input).subscribe();

    expect(api.getPage).not.toHaveBeenCalled();
    expect(pasteOrDuplicateSpy).toHaveBeenCalledWith(pageMock);
    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    const { effects, id, targetPageId, affectedPageIds, createdAt } = commitSpy.calls.argsFor(0)[0];
    expect(effects).toEqual(effectsMock);
    expect(id).toEqual('gid-001');
    expect(targetPageId).toEqual(pageMock.id);
    expect(affectedPageIds).toEqual([pageMock.id]);
    expect(createdAt).toBeInstanceOf(Date);

    /**
     * themeService.pages is {}
     * store.theme is null
     */
    themeService.pages = {};
    themeSpy.and.returnValue(null);
    api.getPage.and.returnValue(of(pageMock) as any);

    store.pastePage(input).subscribe();

    expect(api.getPage).toHaveBeenCalledWith(undefined, input.pageId);

    /**
     * store.theme is set
     */
    themeSpy.and.returnValue({ id: 't-001' });

    store.pastePage(input).subscribe();

    expect(api.getPage).toHaveBeenCalledWith('t-001', input.pageId);

    /**
     * store.page is set
     */
    themeService.page = pageMock;

    store.pastePage(input).subscribe();

  });

  it('should paste pages', () => {

    const inputs: any[] = [
      { id: 'p-001', name: 'Page 1', pageVariant: PebPageVariant.Default },
      { id: 'p-002', name: 'Page 2', pageVariant: PebPageVariant.Default },
    ];
    const pasteOrDuplicateSpy = spyOn(store, 'pasteOrDuplicatePageEffects');
    const actionMock: any = { id: 'a-001' };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(actionMock));
    const activateSpy = spyOn(store, 'activatePage').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue({ id: 'p-013' });

    /**
     * store.pasteOrDuplicatePageEffects returns []
     */
    pasteOrDuplicateSpy.and.returnValue([]);

    store.pastePages(inputs).subscribe(result => expect(result).toBeNull());

    expect(pasteOrDuplicateSpy.calls.allArgs()).toEqual(inputs.map((p) => [p]));
    expect(commitSpy).not.toHaveBeenCalled();
    expect(activateSpy).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();

    /**
     * store.pasteOrDuplicatePageEffects returns mocked data
     */
    pasteOrDuplicateSpy.and.callFake((page) => ([{
      type: PebPageEffect.Create,
      target: 'target',
      payload: { test: page.id },
    }]));

    store.pastePages(inputs).subscribe(result => expect(result).toEqual(actionMock));

    expect(commitSpy).toHaveBeenCalled();
    const { effects, id, targetPageId, affectedPageIds, createdAt } = commitSpy.calls.argsFor(0)[0];
    expect(effects).toEqual(inputs.map(page => ({
      type: PebPageEffect.Create,
      target: 'target',
      payload: { test: page.id },
    })));
    expect(id).toEqual('gid-001');
    expect(targetPageId).toEqual('p-013');
    expect(affectedPageIds).toEqual(inputs.map(page => page.id));
    expect(createdAt).toBeInstanceOf(Date);
    expect(activateSpy).toHaveBeenCalledWith(inputs[0].id);
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should paste or duplicate effects', () => {

    const pageMock = {
      id: 'p-001',
      name: 'Page 1',
      type: PebPageType.Master,
      template: {
        id: 'tpl-001',
        children: [
          { id: 'child-001' },
          { id: 'child-002' },
        ],
      },
      variant: PebPageVariant.Front,
      master: null,
      stylesheets: {
        [PebScreen.Desktop]: {
          'child-001': { color: '#333333' },
          'child-002': { color: '#454545' },
          'child-003': { color: '#666666' },
        },
      },
      context: {
        'tpl-001': { state: 'ready' },
        'tpl-002': { state: 'loading' },
      },
    };
    const actionMock: any = {
      id: 'a-001',
      effects: [{
        type: 'effect.type',
        target: 'effect.target',
        payload: 'effect.payload',
      }],
    };
    const uniqueIds = {
      'tpl-001': btoa('tpl-001'),
      'child-001': btoa('child-001'),
    };
    const createActionSpy = spyOn(acs, 'pebCreateAction').and.returnValue(actionMock);
    const generateUniqueIdsForPageSpy = spyOn(pebCore, 'generateUniqueIdsForPage').and.returnValue(uniqueIds);

    /**
     * argument isDuplicate is FALSE as default
     * page.name does not contain (Duplicate)
     * page.master is null
     */
    expect(store.pasteOrDuplicatePageEffects(pageMock as any)).toEqual(actionMock.effects);
    expect(createActionSpy).toHaveBeenCalledWith(PebActionType.CreatePage as any, {
      id: 'gid-p-001',
      name: 'Page 1 (Duplicate)',
      type: PebPageType.Master,
      data: undefined,
      template: {
        id: uniqueIds['tpl-001'],
        children: [
          {
            id: uniqueIds['child-001'],
            children: undefined,
          },
          {
            id: 'child-002',
            children: undefined,
          },
        ],
      },
      variant: PebPageVariant.Default,
      master: null,
      stylesheets: {
        [PebScreen.Desktop]: {
          [uniqueIds['child-001']]: { color: '#333333' },
          'child-002': { color: '#454545' },
          'child-003': { color: '#666666' },
        },
      },
      context: {
        [uniqueIds['tpl-001']]: { state: 'ready' },
        'tpl-002': { state: 'loading' },
      },
      'tpl-001': uniqueIds['tpl-001'],
      'child-001': uniqueIds['child-001'],
      contextId: 'gid-001',
    } as any);
    expect(generateIdSpy).toHaveBeenCalledWith('page');
    expect(generateUniqueIdsForPageSpy).toHaveBeenCalled();

    /**
     * argument isDuplicate is TRUE
     * page.name does contains (Duplicate)
     * page.master is set
     */
    createActionSpy.calls.reset();
    pageMock.name = 'Page 1 (Duplicate)';
    pageMock.master = { id: 'master-001' };

    expect(store.pasteOrDuplicatePageEffects(pageMock as any, true)).toEqual(actionMock.effects);
    expect(createActionSpy).toHaveBeenCalledWith(PebActionType.CreatePage as any, {
      id: 'gid-p-001',
      name: 'Page 1 (Duplicate)',
      type: PebPageType.Master,
      data: undefined,
      template: {
        id: uniqueIds['tpl-001'],
        children: [
          {
            id: uniqueIds['child-001'],
            children: undefined,
          },
          {
            id: 'child-002',
            children: undefined,
          },
        ],
      },
      variant: PebPageVariant.Default,
      master: { id: 'master-001' },
      stylesheets: {
        [PebScreen.Desktop]: {
          [uniqueIds['child-001']]: { color: '#333333' },
          'child-002': { color: '#454545' },
          'child-003': { color: '#666666' },
        },
      },
      context: {
        [uniqueIds['tpl-001']]: { state: 'ready' },
        'tpl-002': { state: 'loading' },
      },
      duplicatedPageId: pageMock.id,
      contextId: 'gid-001',
    } as any);

  });

  it('should reorder pages', () => {

    const pageIds = ['p-001', 'p-003', 'p-002'];
    const actionMock: any = { id: 'a-001' };
    const commitSpy = spyOn(store, 'commitAction');
    const createActionSpy = spyOn(acs, 'pebCreateAction').and.returnValue(actionMock);

    commitSpy.and.returnValue(of({ committed: true }) as any);

    store.reorderPages(pageIds).subscribe(result => expect(result.committed).toBe(true));
    expect(commitSpy).toHaveBeenCalledWith(actionMock);
    expect(createActionSpy).toHaveBeenCalledWith(PebActionType.ReorderPages, pageIds);

  });

  it('should duplicate page', () => {

    const input = {
      name: 'duplicate',
      pageId: 'p-001',
      pageVariant: PebPageVariant.Front,
    };
    const pasteOrDuplicateSpy = spyOn(store, 'pasteOrDuplicatePageEffects');
    const commitSpy = spyOn(store, 'commitAction');
    const themeSpy = spyOnProperty(store, 'theme');
    const pageMock: any = {
      id: 'p-001',
      name: 'Page 1',
    };
    const actionMock: any = { id: 'a-001' };
    const effectsMock = [{
      type: PebPageEffect.Create,
      target: 'target',
      payload: { test: 'payload' },
    }];

    pasteOrDuplicateSpy.and.returnValue(effectsMock);
    commitSpy.and.returnValue(of(actionMock));

    /**
     * themeService.page is null
     * themeService.pages is set
     * page.name does not contain (Duplicate)
     */
    themeService.page = null;
    themeService.pages = {
      [pageMock.id]: pageMock,
    };

    store.duplicatePage(input).subscribe();

    expect(api.getPage).not.toHaveBeenCalled();
    expect(pasteOrDuplicateSpy).toHaveBeenCalledWith(pageMock, true);
    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    const { effects, id, targetPageId, affectedPageIds, createdAt } = commitSpy.calls.argsFor(0)[0];
    expect(effects).toEqual(effectsMock);
    expect(id).toEqual('gid-001');
    expect(targetPageId).toEqual(pageMock.id);
    expect(affectedPageIds).toEqual([pageMock.id]);
    expect(createdAt).toBeInstanceOf(Date);
    expect(pageMock.name).toEqual('Page 1 (Duplicate)');

    /**
     * themeService.pages is {}
     * store.theme is null
     * page.name contains (Duplicate)
     */
    themeService.pages = {};
    themeSpy.and.returnValue(null);
    api.getPage.and.returnValue(of(pageMock) as any);

    store.duplicatePage(input).subscribe();

    expect(api.getPage).toHaveBeenCalledWith(undefined, input.pageId);

    /**
     * store.theme is set
     */
    themeSpy.and.returnValue({ id: 't-001' });

    store.duplicatePage(input).subscribe();

    expect(api.getPage).toHaveBeenCalledWith('t-001', input.pageId);

    /**
     * store.page is set
     */
    themeService.page = pageMock;

    store.duplicatePage(input).subscribe();

  });

  it('should duplicate pages', () => {

    const inputs: any[] = [
      { id: 'p-001', name: 'Page 1', pageVariant: PebPageVariant.Default },
      { id: 'p-002', name: 'Page 2 (Duplicate)', pageVariant: PebPageVariant.Default },
    ];
    const pasteOrDuplicateSpy = spyOn(store, 'pasteOrDuplicatePageEffects');
    const actionMock: any = { id: 'a-001' };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(actionMock));

    spyOnProperty(store, 'page').and.returnValue({ id: 'p-013' });
    pasteOrDuplicateSpy.and.callFake((page) => ([{
      type: PebPageEffect.Create,
      target: 'target',
      payload: { test: page.id },
    }]));

    store.duplicatePages(inputs).subscribe(result => expect(result).toEqual(actionMock));

    expect(commitSpy).toHaveBeenCalled();
    const { effects, id, targetPageId, affectedPageIds, createdAt } = commitSpy.calls.argsFor(0)[0];
    expect(effects).toEqual(inputs.map(page => ({
      type: PebPageEffect.Create,
      target: 'target',
      payload: { test: page.id },
    })));
    expect(id).toEqual('gid-001');
    expect(targetPageId).toEqual('p-013');
    expect(affectedPageIds).toEqual(inputs.map(page => page.id));
    expect(createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();
    expect(inputs[0].name).toEqual('Page 1 (Duplicate)');

  });

  it('should update pages with shop routing', () => {

    const pagesPayload = [
      { id: 'p-001' },
      { id: 'p-002' },
    ];
    const routingPayload = [{
      routeId: 'r-001',
      url: 'pages/r-001',
      pageId: 'p-001',
    }];
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    store.updatePagesWithShopRouting(pagesPayload, routingPayload).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    const { effects, id, targetPageId, affectedPageIds, createdAt } = commitSpy.calls.argsFor(0)[0];
    expect(effects).toEqual([
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
    ]);
    expect(id).toEqual('gid-a-001');
    expect(generateIdSpy).toHaveBeenCalledWith('action');
    expect(targetPageId).toBeNull();
    expect(affectedPageIds).toEqual(pagesPayload.map(page => page.id));
    expect(createdAt).toBeInstanceOf(Date);

  });

  it('should update shop theme routing', () => {

    const routes = [
      {
        routeId: 'r-001',
        url: 'pages/r-001',
        pageId: 'p-001',
      },
      {
        routeId: 'r-002',
        url: 'pages/r-002',
        pageId: 'p-002',
      },
    ];
    const pagesMock: any = {
      'p-002': {
        id: 'p-002',
        variant: PebPageVariant.Category,
      },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    themeService.pages = pagesMock;

    store.updateShopThemeRouting(routes).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    const { effects, id, targetPageId, affectedPageIds, createdAt } = commitSpy.calls.argsFor(0)[0];
    expect(effects).toEqual([
      {
        type: PebShopEffect.PatchRouting,
        target: `${PebEffectTarget.Shop}`,
        payload: routes,
      },
      {
        type: PebShopEffect.UpdateData,
        target: `${PebEffectTarget.Shop}`,
        payload: { categoryPages: `${routes[1].url}/:categoryId` },
      },
    ]);
    expect(id).toEqual('gid-a-001');
    expect(targetPageId).toEqual(null);
    expect(affectedPageIds).toEqual([]);
    expect(createdAt).toBeInstanceOf(Date);

  });

  it('should update page', () => {

    const page: any = { id: 'p-001' };
    const payload = {
      variant: PebPageVariant.Product,
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));
    const actionMock = {
      id: 'gid-a-001',
      targetPageId: page.id,
      affectedPageIds: [page.id],
      effects: [{
        payload: null,
        type: PebPageEffect.Update,
        target: `${PebEffectTarget.Pages}:${page.id}`,
      }],
    };
    const routingMock = [{
      routeId: 'r-001',
      url: 'pages/p-001',
      pageId: 'p-001',
    }];

    store.snapshot = {
      id: 'snap-001',
      application: {
        routing: [],
      },
      pages: [
        { id: 'p-001', variant: PebPageVariant.Product },
        { id: 'p-002', variant: PebPageVariant.Product },
        { id: 'p-003', variant: PebPageVariant.Category },
      ],
    } as any;

    /**
     * argument payload is null
     */
    store.updatePage(page, null).subscribe();

    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual(actionMock);
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument payload is set
     * payload.variant is PebPageVariant.Product
     * store.snapshot.application.routing is []
     */
    store.updatePage(page, payload).subscribe();

    expect(omit(commitSpy.calls.argsFor(1)[0], 'createdAt')).toEqual({
      ...actionMock,
      effects: [{
        ...actionMock.effects[0],
        payload,
      }],
    });

    /**
     * store.snapshot.application.routing is set
     */
    store.snapshot.application.routing = routingMock;
    store.updatePage(page, payload).subscribe();

    expect(omit(commitSpy.calls.argsFor(2)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: page.id,
      affectedPageIds: [page.id, 'p-002'],
      effects: [
        {
          payload,
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${page.id}`,
        },
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:p-002`,
          payload: { variant: PebPageVariant.Default },
        },
      ],
    });

    /**
     * payload.variant is PebPageVariant.Category
     */
    payload.variant = PebPageVariant.Category;

    store.updatePage(page, payload).subscribe();

    expect(omit(commitSpy.calls.argsFor(3)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: page.id,
      affectedPageIds: [page.id, 'p-003'],
      effects: [
        {
          payload,
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:${page.id}`,
        },
        {
          type: PebPageEffect.Update,
          target: `${PebEffectTarget.Pages}:p-003`,
          payload: { variant: PebPageVariant.Default },
        },
        {
          type: PebShopEffect.UpdateData,
          target: `${PebEffectTarget.Shop}:snap-001`,
          payload: { categoryPages: `${routingMock[0].url}/:categoryId` },
        },
      ],
    });

  });

  it('should delete page', () => {

    const pageMock = { id: 'p-001' };
    const pagesMock = [{ id: 'p-002' }, { id: 'p-003' }];
    const deleteHandlerSpy = spyOn(store, 'deletePageHandler').and.returnValue(of(null));
    const pagesView = PebPageType.Master;

    /**
     * argument page is typeof object
     */
    store.deletePage(pageMock, pagesView).subscribe();

    expect(deleteHandlerSpy.calls.allArgs()).toEqual([[pageMock, pagesView]]);

    /**
     * argument page is typeof array
     */
    deleteHandlerSpy.calls.reset();

    store.deletePage(pagesMock, pagesView).subscribe();

    expect(deleteHandlerSpy.calls.allArgs()).toEqual(pagesMock.map((page) => ([page, pagesView])));

  });

  it('should handle page delete', () => {

    const actionMock: any = {
      effects: [{
        type: HandlerStateEffect.DeletePage,
        target: 'target',
      }],
    };
    const page = { id: 'p-013' };
    const pagesView = PebPageType.Master;
    const createActionSpy = spyOn(acs, 'pebCreateAction').and.returnValue(actionMock as any);
    const activateSpy = spyOn<any>(store, 'activateExistPage');
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));
    const routingMock = [
      {
        routeId: 'r-002',
        pageId: 'p-001',
        url: 'pages/p-001',
      },
      {
        routeId: 'r-001',
        pageId: 'p-013',
        url: 'pages/p-013',
      },
    ];

    spyOnProperty(store, 'activePageId').and.returnValue('p-001');

    /**
     * store.activePageId is not equal to page.id
     */
    store.snapshot = {
      application: {
        routing: routingMock,
      },
    } as any;
    store.deletePageHandler(page, pagesView).subscribe();

    expect(createActionSpy).toHaveBeenCalledWith(PebActionType.DeletePage as any, page);
    expect(actionMock.effects[0].target).toEqual('');
    expect(actionMock.effects[1]).toEqual({
      type: PebShopEffect.DeleteRoutes,
      target: `${PebEffectTarget.Shop}`,
      payload: [routingMock[1]],
    });
    expect(activateSpy).not.toHaveBeenCalled();

    /**
     * store.activePageId is equal to page.id
     */
    page.id = 'p-001';

    store.deletePageHandler(page, pagesView).subscribe();

    expect(activateSpy).toHaveBeenCalledWith(page.id, pagesView);

  });

  it('should append grid element', () => {

    const elementKit = {
      element: {
        id: 'elem',
      },
      styles: {
        [PebScreen.Desktop]: { opacity: 1 },
        [PebScreen.Tablet]: { opacity: .75 },
        [PebScreen.Mobile]: { opacity: .5 },
      },
      contextSchema: null,
    };
    const childrenMock = [
      {
        element: {
          id: 'c-001',
        },
        styles: {
          [PebScreen.Desktop]: { color: '#000000' },
          [PebScreen.Tablet]: { color: '#333333' },
          [PebScreen.Mobile]: { color: '#cccccc' },
        },
      },
    ];
    const page = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'sd-001',
        [PebScreen.Tablet]: 'st-001',
        [PebScreen.Mobile]: 'sm-001',
      },
      contextId: 'ctx-001',
    };
    const parentTransforms = {
      definition: {
        id: 'parent',
        context: {},
        children: [],
      },
      styles: { backgroundColor: '#ffffff' },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of({ updated: true }) as any);

    spyOnProperty(store, 'page').and.returnValue(page);

    // w/o parentTransforms & children & contextSchema
    store.appendGridElement('parent', elementKit as any).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    let args = commitSpy.calls.argsFor(0)[0];
    expect(args.targetPageId).toEqual(page.id);
    expect(args.affectedPageIds).toEqual([page.id]);
    expect(args.effects[0]).toEqual({
      payload: {
        to: 'parent',
        element: elementKit.element,
      },
      type: PebTemplateEffect.AppendElement,
      target: `${PebEffectTarget.Templates}:${page.templateId}`,
    });
    Object.values(PebScreen).forEach((screen, index) => {
      expect(args.effects[index + 1]).toEqual({
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
        payload: { elem: elementKit.styles[screen] },
      });
    });
    expect(args.effects[4]).toEqual({
      type: PebContextSchemaEffect.Update,
      target: `${PebEffectTarget.ContextSchemas}:${page.contextId}`,
      payload: null,
    });

    // w/ parentTransforms & children & contextSchema
    commitSpy.calls.reset();
    elementKit.contextSchema = { test: true };

    store.appendGridElement('parent', elementKit as any, parentTransforms as any, childrenMock as any).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    args = commitSpy.calls.argsFor(0)[0];
    expect(args.effects[0]).toEqual({
      type: PebTemplateEffect.UpdateElement,
      target: `${PebEffectTarget.Templates}:${page.templateId}`,
      payload: { id: 'parent' },
    });
    Object.values(PebScreen).forEach((screen, index) => {
      expect(args.effects[index + 1]).toEqual({
        type: PebStylesheetEffect.Replace,
        target: `${PebEffectTarget.Stylesheets}:${page.stylesheetIds[screen]}`,
        payload: {
          selector: parentTransforms.definition.id,
          styles: parentTransforms.styles,
        },
      });
    });
    Object.values(PebScreen).forEach((screen, index) => {
      expect(args.effects[index + 5].payload[childrenMock[0].element.id]).toEqual(childrenMock[0].styles[screen]);
    });

  });

  it('should group elements', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
      contextId: 'ctx-001',
    };
    const groupElementKit = {
      children: [{ id: 'child-001' }],
    };
    const parentTransformations = {
      definition: {
        id: 'parent-001',
        children: [
          { id: 'child-002' },
          { id: 'child-003' },
        ],
      },
      styles: {
        [PebScreen.Desktop]: { color: '#333333' },
      },
    };
    const groupTransformation = {
      definition: { id: 'group-001' },
      styles: {
        [PebScreen.Desktop]: { backgroundColor: '#cccccc' },
      },
      contextSchema: { test: 'context.schema' },
    };
    const elementKitTransformationSpy = spyOn(pebCore, 'getElementKitTransformationDeep')
      .and.returnValue(groupTransformation as any);
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    store.groupElements(groupElementKit as any, parentTransformations as any).subscribe();

    expect(elementKitTransformationSpy).toHaveBeenCalledWith(groupElementKit as any);
    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            ...parentTransformations.definition,
            children: [
              ...parentTransformations.definition.children,
              groupTransformation.definition,
            ],
          },
        },
        ...Object.entries(parentTransformations.styles).map(([screen, stylesheet]) => ({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
          payload: stylesheet,
        })),
        ...Object.entries(groupTransformation.styles).map(([screen, stylesheet]) => ({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
          payload: stylesheet,
        })),
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
          payload: groupTransformation.contextSchema,
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

  });

  it('should ungroup elements', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
    };
    const parentId = 'parent-001';
    const groupElementId = 'ge-001';
    const groupElementChildren: any = [{ id: 'elem-001' }];
    const styleChanges: any = {
      [PebScreen.Desktop]: { color: '#333333' },
    };
    const additionalEffects = [{
      type: PebPageEffect.Update,
      target: 'target',
      payload: 'payload',
    }];
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument addEfects is undefined as default
     */
    store.ungroupElements(parentId, groupElementId, groupElementChildren, styleChanges).subscribe();

    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          type: PebTemplateEffect.RelocateElement,
          payload: {
            nextParentId: parentId,
            elementId: 'elem-001',
          },
        },
        {
          payload: groupElementId,
          type: PebTemplateEffect.DeleteElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
        },
        ...Object.values(PebScreen).reduce((acc, screen) => {
          acc.push({
            type: PebStylesheetEffect.Delete,
            target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
            payload: groupElementId,
          });
          if (screen === PebScreen.Desktop) {
            acc.push({
              type: PebStylesheetEffect.Update,
              target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
              payload: styleChanges[PebScreen.Desktop],
            });
          }
          return acc;
        }, []),
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

    /**
     * argument addEffects is set
     */
    store.ungroupElements(parentId, groupElementId, groupElementChildren, styleChanges, additionalEffects).subscribe();

    expect(commitSpy.calls.argsFor(1)[0].effects).toEqual([
      {
        target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
        type: PebTemplateEffect.RelocateElement,
        payload: {
          nextParentId: parentId,
          elementId: 'elem-001',
        },
      },
      {
        payload: groupElementId,
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
      },
      ...Object.values(PebScreen).reduce((acc, screen) => {
        acc.push({
          type: PebStylesheetEffect.Delete,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
          payload: groupElementId,
        });
        if (screen === PebScreen.Desktop) {
          acc.push({
            type: PebStylesheetEffect.Update,
            target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
            payload: styleChanges[PebScreen.Desktop],
          });
        }
        return acc;
      }, []),
      ...additionalEffects,
    ]);

  });

  it('should add element transformations', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
      contextId: 'ctx-001',
    };
    const parentId = 'parent-001';
    const beforeId = 'before-001';
    const transformation = {
      definition: { type: PebElementType.Product },
      styles: {
        [PebScreen.Desktop]: { color: '#333333' },
      },
      contextSchema: { test: 'context.schema' },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument beforeId is null
     */
    store.appendElementTransformation(parentId, transformation as any).subscribe();

    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.AppendElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            to: parentId,
            element: transformation.definition,
          },
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
          payload: { color: '#333333' },
        },
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
          payload: transformation.contextSchema,
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

    /**
     * argument beforId is set
     */
    store.appendElementTransformation(parentId, transformation as any, beforeId).subscribe();

    expect(commitSpy.calls.argsFor(1)[0].effects[0].payload).toEqual({
      to: parentId,
      element: transformation.definition,
      before: beforeId,
    });

  });

  it('should append element', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
    };
    const parentId = 'parent-001';
    const elementKit = {
      element: { id: 'elem' },
      styles: {
        [PebScreen.Desktop]: {},
        [PebScreen.Tablet]: {},
        [PebScreen.Mobile]: {},
      },
      contextSchema: {},
    };
    const snapshotMock = {
      application: { id: 'app-001' },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    store.snapshot = snapshotMock as any;
    store.appendElement(parentId, elementKit as any).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(commitSpy.calls.argsFor(0)[0].id).toEqual('gid-a-001');
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should paste element', () => {

    const pagesMock = {
      'p-001': {
        id: 'p-001',
        context: { test: 'context.page.1' },
      },
      'p-002': {
        id: 'p-002',
        context: { test: 'context.page.2' },
      },
    };
    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Mobile]: 'm-001',
      },
    };
    const pasteElements: any[] = [{
      parentId: 'parent',
      elementDef: {
        element: { id: 'elem' },
        styles: {
          [PebScreen.Desktop]: {
            elem: { color: '#333333' },
          },
          [PebScreen.Mobile]: {
            elem: { backgroundColor: '#cccccc' },
          },
        },
      },
      childIds: [],
    }];
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);
    spyOnProperty(store, 'pages').and.returnValue(pagesMock);

    store.pasteElement(pasteElements, PebScreen.Desktop, PebScreen.Mobile).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(commitSpy.calls.argsFor(0)[0].id).toEqual('gid-a-001');
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should delete element', () => {

    const pageMock = {
      id: 'p-001',
      template: {
        id: 'tpl-001',
        children: [
          { id: 'elem-001' },
        ],
      },
      templateId: 'tpl-001',
      contextId: 'ctx-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
    };
    const elementIds = ['elem-001', 'elem-002'];
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));
    const additionalEffects = [{
      type: PebPageEffect.Update,
      target: 'target',
      payload: 'payload',
    }];

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument addEffects is undefined as default
     */
    store.deleteElement(elementIds).subscribe();

    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.DeleteElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: 'elem-001',
        },
        {
          type: PebContextSchemaEffect.Delete,
          target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
          payload: 'elem-001',
        },
        ...Object.values(PebScreen).map((s: PebScreen) => ({
          type: PebStylesheetEffect.Delete,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[s]}`,
          payload: 'elem-001',
        })),
        {
          type: PebTemplateEffect.DeleteElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: 'elem-002',
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

    /**
     * argument addEffects is set
     */
    store.deleteElement(elementIds, additionalEffects).subscribe();

    expect(commitSpy.calls.argsFor(1)[0].effects).toEqual([
      {
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
        payload: 'elem-001',
      },
      {
        type: PebContextSchemaEffect.Delete,
        target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
        payload: 'elem-001',
      },
      ...Object.values(PebScreen).map((s: PebScreen) => ({
        type: PebStylesheetEffect.Delete,
        target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[s]}`,
        payload: 'elem-001',
      })),
      {
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
        payload: 'elem-002',
      },
      ...additionalEffects,
    ]);

  });

  it('should set before element', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
    };
    const parentId = 'parent-001';
    const elementDef = {
      element: {
        id: 'elem-001',
      },
      styles: {
        [PebScreen.Desktop]: {},
        [PebScreen.Tablet]: {},
        [PebScreen.Mobile]: {},
      },
      contextSchema: {},
    };
    const beforeId = 'before-001';
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument beforeId is undefined as default
     */
    store.setBeforeElement(parentId, elementDef).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(commitSpy.calls.argsFor(0)[0].id).toEqual('gid-a-001');
    expect(commitSpy.calls.argsFor(0)[0].effects[0].payload).toEqual({
      to: parentId,
      element: elementDef.element,
    });
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument beforeId is set
     */
    store.setBeforeElement(parentId, elementDef, beforeId).subscribe();

    expect(commitSpy.calls.argsFor(1)[0].effects[0].payload).toEqual({
      to: parentId,
      element: elementDef.element,
      before: beforeId,
    });

  });

  it('should update element', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
    };
    const element: any = { id: 'elem-001' };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));
    const additionalEffects = [{
      type: PebPageEffect.Update,
      target: 'target',
      payload: 'payload',
    }];

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument element is typeof object
     * argument addEffects is undefined as default
     */
    store.updateElement(element).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [{
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
        payload: element,
      }],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument element is typeof array
     * argument addEffects is set
     */
    store.updateElement([element], additionalEffects).subscribe();

    expect(commitSpy.calls.argsFor(1)[0].effects[1]).toEqual(additionalEffects[0]);

  });

  it('should relocate element', () => {

    const elementMock = {
      elementId: 'elem-001',
      nextParentId: 'next-parent-001',
      styles: {
        'elem-001': { backgroundColor: '#cccccc' },
      },
      stylesScreen: PebScreen.Desktop,
      transformation: null,
    };
    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
    };
    const transformation = {
      definition: null,
      styles: null,
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * element.transformation is null
     */
    store.relocateElement([elementMock]).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: elementMock.styles,
        },
        {
          type: PebTemplateEffect.RelocateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            elementId: elementMock.elementId,
            nextParentId: elementMock.nextParentId,
          },
        },
      ],
    });
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * element.transformation is set
     * transformation.definition & styles are null
     */
    elementMock.transformation = transformation;

    store.relocateElement([elementMock]).subscribe();

    expect(omit(commitSpy.calls.argsFor(1)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: elementMock.styles,
        },
        {
          type: PebTemplateEffect.RelocateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            elementId: elementMock.elementId,
            nextParentId: elementMock.nextParentId,
          },
        },
      ],
    });

    /**
     * transformation.definition & styles are set
     */
    transformation.definition = { id: 'elem-001' };
    transformation.styles = { color: 'red' };

    store.relocateElement([elementMock]).subscribe();

    expect(omit(commitSpy.calls.argsFor(2)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: elementMock.styles,
        },
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: transformation.definition,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: {
            [transformation.definition.id]: {
              ...transformation.styles,
            },
          },
        },
        {
          type: PebTemplateEffect.RelocateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            elementId: elementMock.elementId,
            nextParentId: elementMock.nextParentId,
          },
        },
      ],
    });

  });

  it('should update styles', () => {

    const pageMock = {
      id: 'p-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
      stylesheets: {
        [PebScreen.Desktop]: {
          'elem-001': {
            backgroundColor: '#cccccc',
          },
        },
        [PebScreen.Tablet]: {
          'elem-001': {
            margin: '10 11 12 13',
          },
        },
        [PebScreen.Mobile]: {},
      },
    };
    const styles = {
      'elem-001': {
        backgroundColor: '#333333',
        margin: null,
      },
    };
    const calcSpy = spyOn(store, 'calcElementLeftWidthByScreen').and.returnValue(1200);
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument curScreen is undefined as default
     * argument screen is null
     */
    store.updateStyles(null, styles).subscribe();

    expect(generateIdSpy).toHaveBeenCalled();
    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: styles,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:t-001`,
          payload: styles,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:m-001`,
          payload: styles,
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(calcSpy).not.toHaveBeenCalled();

    /**
     * argument curScreen is set
     * argument screen is typeof array
     * new styles does not have margin property
     */
    store.updateStyles([PebScreen.Desktop, PebScreen.Mobile], styles, PebScreen.Desktop).subscribe();

    expect(omit(commitSpy.calls.argsFor(1)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: styles,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:m-001`,
          payload: styles,
        },
      ],
    });
    expect(calcSpy).not.toHaveBeenCalled();

    /**
     * argument screen is PebScreen.Desktop
     * new styles have maring property
     */
    styles['elem-001'].margin = '10 20 10 20';

    store.updateStyles(PebScreen.Tablet, styles, PebScreen.Desktop).subscribe();

    expect(omit(commitSpy.calls.argsFor(2)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:t-001`,
          payload: {
            'elem-001': {
              backgroundColor: '#333333',
              margin: '10 11 12 13',
              marginTop: 10,
              marginRight: 11,
              marginBottom: 12,
              marginLeft: 13,
              width: 1200,
            },
          },
        },
      ],
    });

  });

  it('should update motion element', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
    };
    const element: any = { id: 'elem-001' };
    const motion: any = {
      buildIn: { duration: 500 },
      action: { duration: 1500 },
      buildOut: { duration: 750 },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    store.updateMotionElement(element, motion).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          payload: {
            ...element,
            motion
          },
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

  });

  it('should calc element left width by screen', () => {

    const styles = { width: 500 };
    const oldStyles = { marginLeft: 30 };

    // possible width > 0
    expect(store.calcElementLeftWidthByScreen(styles, oldStyles, PebScreen.Desktop)).toEqual(styles.width);

    // possible width < 0
    styles.width = 1500;
    expect(store.calcElementLeftWidthByScreen(styles, oldStyles, PebScreen.Desktop)).toBe(1170);

  });

  it('should update styles by screen', () => {

    const pageMock = {
      id: 'p-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
    };
    const styles = {
      [PebScreen.Desktop]: {
        'elem-001': { backgroundColor: '#cccccc' },
      },
      [PebScreen.Tablet]: {
        'elem-001': { backgroundColor: '#aaaaaa' },
      },
      [PebScreen.Mobile]: {
        'elem-001': { backgroundColor: '#777777' },
      },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    store.updateStylesByScreen(styles).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: styles[PebScreen.Desktop],
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:t-001`,
          payload: styles[PebScreen.Tablet],
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:m-001`,
          payload: styles[PebScreen.Mobile],
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);

  });

  it('should update element kit', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
      contextId: 'ctx-001',
    };
    const context = {
      'elem-001': { state: 'ready' },
    };
    const newDefinition: any = { id: 'elem-001' };
    const newStyles = {
      'elem-001': { backgroundColor: '#cccccc' },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument screen is null
     * argument context is undefined as default
     * argument newDefinition is typeof object
     */
    store.updateElementKit(null, newDefinition, newStyles).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: newDefinition,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: newStyles,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:t-001`,
          payload: newStyles,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:m-001`,
          payload: newStyles,
        },
      ],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument screen is PebScreen.Desktop
     * argument context is set
     * argument newDefinition is typeof array
     */
    store.updateElementKit(PebScreen.Desktop, [newDefinition], [newStyles], context).subscribe();

    expect(omit(commitSpy.calls.argsFor(1)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: newDefinition,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: newStyles,
        },
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
          payload: { [newDefinition.id]: context },
        },
      ],
    });

    /**
     * argument screen is typeof array
     */
    store.updateElementKit([PebScreen.Desktop, PebScreen.Mobile], [newDefinition], [newStyles], context).subscribe();

    expect(omit(commitSpy.calls.argsFor(2)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: newDefinition,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: newStyles,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:m-001`,
          payload: newStyles,
        },
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
          payload: { [newDefinition.id]: context },
        },
      ],
    });

  });

  it('should update element kit by screen', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
      },
      contextId: 'ctx-001',
    };
    const newDefinition: any = { id: 'elem-001' };
    const newStyles = {
      [PebScreen.Desktop]: {
        'kit-001': {
          'elem-001': { backgroundColor: '#cccccc' },
        },
      },
    };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    store.updateElementKitByScreen(newDefinition, newStyles).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: newDefinition,
        },
        {
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: newStyles[PebScreen.Desktop],
        },
      ] as any,
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should update context', () => {

    const pageMock = {
      id: 'p-001',
      contextId: 'ctx-001',
    };
    const elementId = 'elem-001';
    const context = { state: 'ready' };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    spyOnProperty(store, 'page').and.returnValue(pageMock);

    /**
     * argument context is null
     */
    store.updateContext(elementId, null).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [{
        type: PebContextSchemaEffect.Update,
        target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
        payload: null,
      }],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument context is set
     */
    store.updateContext(elementId, context).subscribe();

    expect(omit(commitSpy.calls.argsFor(1)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [{
        type: PebContextSchemaEffect.Update,
        target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
        payload: { [elementId]: context },
      }],
    });

  });

  it('should update shop', () => {

    const dataMock: any = { defaultLanguage: PebLanguage.English };
    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));

    store.updateShop(dataMock).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-001',
      targetPageId: null,
      affectedPageIds: [],
      effects: [{
        type: PebShopEffect.UpdateData,
        target: PebEffectTarget.Shop,
        payload: dataMock,
      }],
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

  });

  it('should get can undo', () => {

    themeService['canUndo$' as any] = of(true);

    store.canUndo$.subscribe((can) => {
      expect(can).toBe(true);
    });

  });

  it('should get can redo', () => {

    themeService['canRedo$' as any] = of(false);

    store.canRedo$.subscribe((can) => {
      expect(can).toBe(false);
    });

  });

  it('should undo action', () => {

    themeService.undo.and.returnValue(of(() => { }) as any);

    store.undoAction();

    expect(themeService.undo).toHaveBeenCalled();

  });

  it('should redo action', () => {

    themeService.redo.and.returnValue(of(() => { }) as any);

    store.redoAction();

    expect(themeService.redo).toHaveBeenCalled();

  });

  it('should update page preview', () => {

    const commitSpy = spyOn(store, 'commitAction').and.returnValue(of(null));
    const dataMock = {
      'p-001': {
        [PebScreen.Desktop]: 'url/page-preview/p-001',
      },
      'p-002': {
        [PebScreen.Desktop]: 'url/page-preview/p-002',
      }
    };
    const pagesMock = [{
      id: 'p-001',
      data: { test: 'data' },
    }];

    themeService.snapshot = { pages: pagesMock } as any;

    /**
     * argument data is {}
     */
    store.updatePagePreview({}).subscribe();

    expect(commitSpy).toHaveBeenCalled();
    expect(omit(commitSpy.calls.argsFor(0)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      effects: [],
      affectedPageIds: [],
      targetPageId: null,
      background: true,
    });
    expect(commitSpy.calls.argsFor(0)[0].createdAt).toBeInstanceOf(Date);
    expect(generateIdSpy).toHaveBeenCalled();

    /**
     * argument data is set
     */
    store.updatePagePreview(dataMock).subscribe();

    expect(omit(commitSpy.calls.argsFor(1)[0], 'createdAt')).toEqual({
      id: 'gid-a-001',
      effects: [{
        type: PebPageEffect.Update,
        target: `${PebEffectTarget.Pages}:p-001`,
        payload: {
          data: {
            test: 'data',
            preview: dataMock['p-001'],
          },
        },
      }],
      affectedPageIds: ['p-001', 'p-002'],
      targetPageId: 'p-001',
      background: true,
    });

  });

  it('should remove duplicate effects', () => {

    const appendElementEffects = [
      {
        type: PebTemplateEffect.AppendElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: {
          element: { id: 'elem-001' },
        },
      },
      {
        type: PebTemplateEffect.AppendElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: {
          element: { id: 'elem-002' },
        },
      },
      {
        type: PebTemplateEffect.AppendElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: {
          element: { id: 'elem-001' },
        },
      },
    ];
    const relocateElementEffects = [
      {
        type: PebTemplateEffect.RelocateElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: { elementId: 'elem-001' },
      },
      {
        type: PebTemplateEffect.RelocateElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: { elementId: 'elem-002' },
      },
      {
        type: PebTemplateEffect.RelocateElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: { elementId: 'elem-001' },
      },
    ];
    const updateElementEffects = [
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: { id: 'elem-001' },
      },
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: { id: 'elem-002' },
      },
      {
        type: PebTemplateEffect.UpdateElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: { id: 'elem-001' },
      },
    ];
    const deleteElementEffects = [
      {
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: 'elem-001',
      },
      {
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: 'elem-002',
      },
      {
        type: PebTemplateEffect.DeleteElement,
        target: `${PebEffectTarget.Templates}:tpl-001`,
        payload: 'elem-001',
      },
    ];
    const deleteStylesheetEffects = [
      {
        type: PebStylesheetEffect.Delete,
        target: `${PebEffectTarget.Stylesheets}:d-001`,
        payload: 'elem-001',
      },
      {
        type: PebStylesheetEffect.Delete,
        target: `${PebEffectTarget.Stylesheets}:d-001`,
        payload: 'elem-002',
      },
      {
        type: PebStylesheetEffect.Delete,
        target: `${PebEffectTarget.Stylesheets}:d-001`,
        payload: 'elem-001',
      },
    ];
    const updateStylesheetEffects = [
      {
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:d-001`,
        payload: {
          'elem-001': { color: '#333333', display: 'none' },
        },
      },
      {
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:d-001`,
        payload: {
          'elem-002': { color: '#454545' },
        },
      },
      {
        type: PebStylesheetEffect.Update,
        target: `${PebEffectTarget.Stylesheets}:d-001`,
        payload: {
          'elem-001': { color: '#333333', display: 'block' },
        },
      },
    ];
    const actionMock = {
      id: 'a-001',
      effects: [
        {
          type: PebStylesheetEffect.Init,
          target: `${PebEffectTarget.Stylesheets}:d-001`,
          payload: {
            'elem-001': { color: '#333333' },
          },
        },
        ...appendElementEffects,
        ...relocateElementEffects,
        ...updateElementEffects,
        ...deleteElementEffects,
        ...deleteStylesheetEffects,
        ...updateStylesheetEffects,
      ],
    };

    expect(store.removeDuplicateEffects(actionMock as any)).toEqual({
      ...actionMock,
      effects: [
        actionMock.effects[0],
        ...appendElementEffects.slice(0, 2),
        ...relocateElementEffects.slice(0, 2),
        ...updateElementEffects.slice(0, 2),
        ...deleteElementEffects.slice(0, 2),
        ...deleteStylesheetEffects.slice(0, 2),
        ...updateStylesheetEffects.slice(0, 2).map((effect, i) => {
          if (i === 0)
          effect.payload['elem-001'].display = 'block';
          return effect;
        }),
      ],
    } as any);

  });



  it('should commit action', () => {

    const removeSpy = spyOn(store, 'removeDuplicateEffects');
    const setVersionSpy = spyOn(store, 'setElementsVersion');
    const prepareForAllScreensSpy = spyOn(store, 'prepareActionForAllScreens');
    const nextSpy = spyOn(store[`actionCommittedSubject$`], 'next');
    const actionMock: any = { id: 'a-001' };

    removeSpy.and.returnValue(actionMock);
    setVersionSpy.and.returnValue(actionMock);
    prepareForAllScreensSpy.and.returnValue(actionMock);

    store.commitAction(actionMock).subscribe();

    expect(removeSpy).toHaveBeenCalledWith(actionMock);
    expect(setVersionSpy).toHaveBeenCalledWith(actionMock);
    expect(prepareForAllScreensSpy).toHaveBeenCalledWith(actionMock);
    expect(themeService.commitAction).toHaveBeenCalledWith(actionMock);
    expect(nextSpy).toHaveBeenCalled();

  });

  it('should get pages', () => {

    const pagesMock: any[] = [{ id: 'p-001' }];

    themeService.getPages.and.returnValue(of(pagesMock));

    store.getPages().subscribe(pages => expect(pages).toEqual(pagesMock));

    expect(themeService.getPages).toHaveBeenCalled();

  });

  it('should get page', () => {

    const pageMock: any = { id: 'p-001' };

    themeService.getPage.and.returnValue(of(pageMock));

    store.getPage(pageMock.id).subscribe(page => expect(page).toEqual(pageMock));

    expect(themeService.getPage).toHaveBeenCalledWith(pageMock.id);

  });

  it('should activate existing page', () => {

    const activateSpy = spyOn(store, 'activatePage').and.returnValue(of({ activated: true }) as any);

    setSnapshot(store);

    // w/o existing page
    // w/o replica page
    store[`activateExistPage`]('page').subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    // w/o existing page
    store[`activateExistPage`]('page', PebPageType.Master).subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    // w/o existing page
    // w/o front page
    store.snapshot.pages.push({
      ...store.snapshot.pages[0],
      variant: PebPageVariant.Default,
    });

    store[`activateExistPage`]('page', PebPageType.Master).subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    // w/o existing page
    // w/o front page & replica page
    store.snapshot.pages[0].variant = PebPageVariant.Default;

    store[`activateExistPage`]('page').subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    // w/ existing page
    store[`activateExistPage`]('p-001').subscribe((result: any) => {
      expect(result.activated).toBe(true);
    });

    expect(activateSpy).toHaveBeenCalledTimes(5);

  });

  it('should fork master page', () => {

    const pageMock = {
      id: 'page',
      name: 'page',
      template: {
        children: [],
      },
      stylesheets: {
        [PebScreen.Desktop]: { color: '#333333' },
        [PebScreen.Tablet]: { color: '#cccccc' },
        [PebScreen.Mobile]: { color: '#000000' },
      },
      master: null,
    };
    const pageSpy = spyOnProperty(store, 'page').and.returnValue(null);

    // w/o page & theme
    api.getPage.and.returnValue(EMPTY);

    store[`forkMasterPage`]('page', 'name').pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

    // w/o page
    // w/ theme
    spyOnProperty(store, 'theme').and.returnValue({ id: 't-001' });

    store[`forkMasterPage`]('page', 'name').pipe(isEmpty()).subscribe(empty => expect(empty).toBe(true));

    // w/ page
    // w/o master
    pageSpy.and.returnValue(pageMock);

    store[`forkMasterPage`]('page', 'name').subscribe((page) => {
      expect(page.name).toEqual('name');
      expect(page.type).toEqual(PebPageType.Replica);
      expect(page.master.id).toEqual(pageMock.id);
      expect(page.master.lastActionId).toBeUndefined();
    });

    // w/ master
    pageMock.master = { lastActionId: 'a-001' };

    store[`forkMasterPage`]('page', 'name').subscribe((page) => {
      expect(page.master.lastActionId).toEqual(pageMock.master.lastActionId);
    });

  });

  it('should make append element action', () => {

    const pageMock = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: {
        [PebScreen.Desktop]: 'd-001',
        [PebScreen.Tablet]: 't-001',
        [PebScreen.Mobile]: 'm-001',
      },
      contextId: 'ctx-001',
    };
    const parentId = 'parent-001';
    const beforeId = 'before-001';
    const elementKit = {
      element: {
        id: 'elem-001',
      },
      rootContextKey: null,
      contextSchema: null,
      styles: Object.values(PebScreen).reduce((acc, screen) => {
        acc[screen] = { color: '#333333' };
        return acc;
      }, {}),
    };
    const transformation = {
      definition: { id: 'elem-001', type: PebElementType.Product },
      styles: { width: 1200 },
    };
    const shopMock = { contextId: 'ctx-002' };
    const childrenMock = [
      {
        element: { id: 'child-001' },
        styles: Object.values(PebScreen).reduce((acc, screen) => {
          acc[screen] = { color: '#454545' };
          return acc;
        }, {}),
      },
    ];
    let action: PebAction;

    /**
     * arguments beforeId, transformation & shop are undefined as default
     * argument children is [] as default
     * elementKit.rootContextKey & contextSchema are null
     */
    action = makeAppendElementAction(pageMock as any, parentId, elementKit as any);

    expect(omit(action, 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.AppendElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            to: parentId,
            element: elementKit.element,
          },
        },
        ...Object.values(PebScreen).map((screen: PebScreen) => ({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
          payload: {
            [elementKit.element.id]: elementKit.styles[screen],
          },
        })),
        {
          type: PebContextSchemaEffect.Update,
          target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
          payload: null,
        },
      ] as any[],
    });
    expect(action.createdAt).toBeInstanceOf(Date);

    /**
     * arguments beforeId, transformation & shop are set
     * argument children is set
     * elementKit.rootContextKey & contextSchema are set
     */
    elementKit.rootContextKey = 'root.context.key';
    elementKit.contextSchema = { test: 'context.schema' };
    action = makeAppendElementAction(
      pageMock as any,
      parentId,
      elementKit as any,
      beforeId,
      transformation,
      shopMock as any,
      childrenMock as any[],
    );

    expect(omit(action, 'createdAt')).toEqual({
      id: 'gid-a-001',
      targetPageId: pageMock.id,
      affectedPageIds: [pageMock.id],
      effects: [
        {
          type: PebTemplateEffect.UpdateElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: transformation.definition,
        },
        ...Object.values(PebScreen).map(screen => ({
          type: PebStylesheetEffect.Replace,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
          payload: {
            selector: transformation.definition.id,
            styles: transformation.styles,
          },
        })),
        {
          type: PebTemplateEffect.AppendElement,
          target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
          payload: {
            to: parentId,
            element: elementKit.element,
            before: beforeId,
          },
        },
        ...Object.values(PebScreen).map((screen: PebScreen) => ({
          type: PebStylesheetEffect.Update,
          target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
          payload: {
            [elementKit.element.id]: elementKit.styles[screen],
            ...childrenMock.reduce(
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
          target: `${PebEffectTarget.ContextSchemas}:${shopMock.contextId}`,
          payload: { [elementKit.rootContextKey]: elementKit.contextSchema },
        },
      ] as any[],
    });

  });

  // it('should make paste element action', () => {

  //   const pageMock = {
  //     id: 'p-001',
  //     templateId: 'tpl-001',
  //     stylesheetIds: {
  //       [PebScreen.Desktop]: 'd-001',
  //       [PebScreen.Tablet]: 't-001',
  //       [PebScreen.Mobile]: 'm-001',
  //     },
  //     contextId: 'ctx-001',
  //   };
  //   const pageContextSchema = {
  //     'child-001': { test: 'context.schema.child-001' },
  //   };
  //   const parentId = 'parent-001';
  //   const elementKit = {
  //     element: {
  //       id: 'elem-002',
  //       type: PebElementType.Block,
  //       meta: null,
  //       data: null,
  //       motion: null,
  //       children: null,
  //     },
  //     prevId: 'elem-001',
  //     contextSchema: null,
  //     styles: {
  //       [PebScreen.Desktop]: {
  //         'elem-001': { backgroundColor: '#cccccc' },
  //         'child-001': { color: '#333333' },
  //       },
  //       [PebScreen.Tablet]: {
  //         'elem-001': { backgroundColor: '#999999' },
  //         'child-001': { color: '#333333' },
  //       },
  //       [PebScreen.Mobile]: {},
  //     },
  //   };
  //   const childIds = ['child-001'];
  //   const beforeId = 'before-001';
  //   let effects: any[];

  //   /**
  //    * elementKit.element.type is PebElementType.Block
  //    * elementKit.element.meta is null
  //    * elementKit.contextSchema is null
  //    */
  //   effects = makePasteElementAction(
  //     pageMock as any,
  //     {},
  //     parentId,
  //     elementKit as any,
  //     childIds,
  //     PebScreen.Desktop,
  //     beforeId,
  //     PebScreen.Tablet,
  //   );

  //   expect(effects).toEqual([
  //     {
  //       type: PebTemplateEffect.AppendElement,
  //       target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
  //       payload: {
  //         to: parentId,
  //         element: {
  //           ...elementKit.element,
  //           children: [],
  //         },
  //         before: beforeId,
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         'elem-002': { backgroundColor: '#999999' },
  //         'gid-001': { color: '#333333' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         'elem-002': { backgroundColor: '#999999' },
  //         'gid-001': { color: '#333333' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         'elem-002': { backgroundColor: '#999999' },
  //         'gid-001': { color: '#333333' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Tablet]}`,
  //       payload: {
  //         'elem-002': { display: 'none' },
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Tablet]}`,
  //       payload: {
  //         'elem-002': { display: 'none' },
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Tablet]}`,
  //       payload: {
  //         'elem-002': { display: 'none' },
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Mobile]}`,
  //       payload: {
  //         'elem-002': { display: 'none' },
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Mobile]}`,
  //       payload: {
  //         'elem-002': { display: 'none' },
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Mobile]}`,
  //       payload: {
  //         'elem-002': { display: 'none' },
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebContextSchemaEffect.Update,
  //       target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
  //       payload: {},
  //     },
  //   ]);

  //   /**
  //    * elementKit.element.type is PebElementType.Document
  //    * elementKit.element.meta is null
  //    * elementKit.contextSchema is null
  //    */
  //   childIds.push('elem-001');
  //   elementKit.element.type = PebElementType.Document;
  //   elementKit.element.children = [{ id: 'child-001' }];
  //   elementKit.element.meta = { deletable: false };
  //   elementKit.contextSchema = { test: 'context.schema' };

  //   effects = makePasteElementAction(
  //     pageMock as any,
  //     pageContextSchema,
  //     parentId,
  //     elementKit as any,
  //     childIds,
  //     PebScreen.Desktop,
  //     beforeId,
  //     PebScreen.Tablet,
  //   );

  //   expect(effects).toEqual([
  //     {
  //       type: PebTemplateEffect.AppendElement,
  //       target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
  //       payload: {
  //         to: parentId,
  //         element: {
  //           id: 'gid-001',
  //           type: undefined,
  //           meta: null,
  //           data: null,
  //           motion: null,
  //           children: [],
  //         },
  //         before: beforeId,
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         'gid-001': { backgroundColor: '#999999' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         'gid-001': { backgroundColor: '#999999' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         'gid-001': { backgroundColor: '#999999' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Tablet]}`,
  //       payload: {
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Tablet]}`,
  //       payload: {
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Tablet]}`,
  //       payload: {
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Mobile]}`,
  //       payload: {
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Mobile]}`,
  //       payload: {
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Mobile]}`,
  //       payload: {
  //         'gid-001': { display: 'none' },
  //       },
  //     },
  //     {
  //       type: PebContextSchemaEffect.Update,
  //       target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
  //       payload: {
  //         'elem-002': { test: 'context.schema' },
  //         'gid-001': { test: 'context.schema.child-001' },
  //       },
  //     },
  //   ]);

  // });

  // it('should make delete elements effects', () => {

  //   const pageMock = {
  //     id: 'p-001',
  //     templateId: 'tpl-001',
  //     stylesheetIds: {
  //       [PebScreen.Desktop]: 'd-001',
  //       [PebScreen.Tablet]: 't-001',
  //       [PebScreen.Mobile]: 'm-001',
  //     },
  //     contextId: 'ctx-001',
  //   };
  //   const snapshotMock = {
  //     application: {
  //       context: {
  //         '#logo': {
  //           usedBy: [],
  //         },
  //       },
  //       contextId: 'ctxs-001',
  //     },
  //   };
  //   const widgets = [
  //     {
  //       element: {
  //         id: 'elem-001',
  //         type: PebElementType.Logo,
  //         data: null
  //       },
  //     },
  //     {
  //       element: {
  //         id: 'elem-002',
  //         type: PebElementType.ProductCatalog,
  //         data: { sync: true },
  //       },
  //     },
  //     {
  //       element: {
  //         id: 'elem-003',
  //         type: PebElementType.Block,
  //         data: { sync: false },
  //       },
  //     },
  //   ];
  //   let effects: PebEffect[];

  //   /**
  //    * snapshot.application.context['#logo'].usedBy is []
  //    */
  //   effects = makeDeleteElementsEffects(pageMock as any, widgets as any[], snapshotMock as any, PebScreen.Desktop);

  //   expect(effects).toEqual([
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         ['elem-001']: {
  //           display: 'none',
  //         },
  //       },
  //     },
  //     {
  //       type: PebTemplateEffect.DeleteElement,
  //       target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
  //       payload: 'elem-002',
  //     },
  //     ...Object.values(PebScreen).map(screen => ({
  //       type: PebStylesheetEffect.Delete,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
  //       payload: 'elem-002',
  //     })),
  //     {
  //       type: PebContextSchemaEffect.Delete,
  //       target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
  //       payload: 'elem-002',
  //     },
  //     {
  //       type: PebContextSchemaEffect.Delete,
  //       target: `${PebEffectTarget.ContextSchemas}:${snapshotMock.application.contextId}`,
  //       payload: 'elem-002',
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         ['elem-003']: {
  //           display: 'none',
  //         },
  //       },
  //     },
  //   ]);

  //   /**
  //    * snapshot.application.context['#logo'].usedBy is set
  //    */
  //   widgets[0].element.data = { sync: true };
  //   widgets[1].element.data = null;
  //   snapshotMock.application.context['#logo'].usedBy = ['elem-002'];

  //   effects = makeDeleteElementsEffects(pageMock as any, widgets as any[], snapshotMock as any, PebScreen.Desktop);

  //   expect(effects).toEqual([
  //     {
  //       type: PebTemplateEffect.DeleteElement,
  //       target: `${PebEffectTarget.Templates}:${pageMock.templateId}`,
  //       payload: 'elem-001',
  //     },
  //     ...Object.values(PebScreen).map(screen => ({
  //       type: PebStylesheetEffect.Delete,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[screen]}`,
  //       payload: 'elem-001',
  //     })),
  //     {
  //       type: PebContextSchemaEffect.Delete,
  //       target: `${PebEffectTarget.ContextSchemas}:${pageMock.contextId}`,
  //       payload: 'elem-001',
  //     },
  //     {
  //       type: PebContextSchemaEffect.Update,
  //       target: `${PebEffectTarget.ContextSchemas}:${snapshotMock.application.contextId}`,
  //       payload: {
  //         ['#logo']: snapshotMock.application.context['#logo'],
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         ['elem-002']: {
  //           display: 'none',
  //         },
  //       },
  //     },
  //     {
  //       type: PebStylesheetEffect.Update,
  //       target: `${PebEffectTarget.Stylesheets}:${pageMock.stylesheetIds[PebScreen.Desktop]}`,
  //       payload: {
  //         ['elem-003']: {
  //           display: 'none',
  //         },
  //       },
  //     },
  //   ]);

  // });

  it('should extract page from snapshot', () => {

    const page = {
      id: 'p-001',
      name: 'Page 001',
      variant: PebPageVariant.Default,
      type: PebPageType.Replica,
      template: { id: 't-001' },
      stylesheets: {
        [PebScreen.Desktop]: { color: '#000000' },
        [PebScreen.Tablet]: { color: '#333333' },
        [PebScreen.Mobile]: { color: '#cccccc' },
      },
      context: { id: 'ctx-001' },
      lastActionId: 'a-001',
      master: { master: true },
      data: { data: true },
    };

    expect(extractPageFromSnapshot(page as any)).toEqual(page as any);

  });

  it('should set snapshot default routes', () => {

    const snapshotMock = {
      pages: {
        'p-001': {
          id: 'p-001',
          name: 'Page 1',
        },
        'p-002': {
          id: 'p-002',
          name: 'Page 1',
        },
        'p-003': {
          id: 'p-003',
          name: 'Page 3',
        },
      },
      routing: [
        {
          routeId: 'r-001',
          pageId: 'p-003',
          url: 'pages/p-003',
        },
        {
          routeId: 'r-002',
          pageId: 'p-002',
          url: 'pages/p-002',
        },
      ],
    };

    setSnapshotDefaultRoutes(snapshotMock as any);
    expect(snapshotMock.routing).toEqual([
      {
        routeId: 'r-001',
        pageId: 'p-003',
        url: 'pages/p-003',
      },
      {
        routeId: 'r-002',
        pageId: 'p-002',
        url: 'pages/p-002',
      },
      {
        routeId: 'gid-001',
        pageId: 'p-001',
        url: '/page-1-2',
      },
    ]);

  });

});
