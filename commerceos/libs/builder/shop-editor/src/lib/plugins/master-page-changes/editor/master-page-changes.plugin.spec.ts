import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import * as pebCore from '@pe/builder-core';
import { PebEditorState, PebPageType, PebScreen } from '@pe/builder-core';
import * as pebEditor from '@pe/builder-editor';
import {
  PebActionType,
  PebDeselectAllAction,
  PebEditor,
  PebEditorAccessorService,
  PebEditorSlot,
  PebEditorStore,
} from '@pe/builder-editor';
import { ShopEditorSidebarTypes } from '@pe/builder-shop-plugins';
import { of, Subject } from 'rxjs';
import { PebEditorMasterChangesBannerComponent } from './master-changes-banner/master-changes-banner.component';
import { PebEditorShopMasterPageChangesPlugin } from './master-page-changes.plugin';

describe('PebEditorShopMasterPageChangesPlugin', () => {

  let plugin: PebEditorShopMasterPageChangesPlugin;
  let state: jasmine.SpyObj<PebEditorState>;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let store: jasmine.SpyObj<Store>;
  let editorStore: {
    page$: Subject<any>;
    activePageId$: Subject<string>;
    snapshot: {
      pages: any[];
      application: {
        routing: any[],
      },
    };
    updateReplicas: jasmine.Spy;
    activatePage: jasmine.Spy;
    getPage: jasmine.Spy;
  };

  beforeAll(() => {

    Object.defineProperties(pebCore, {
      generateUniqueIdsForPage: {
        value: pebCore.generateUniqueIdsForPage,
        writable: true,
      },
      applyIdsMapForPage: {
        value: pebCore.applyIdsMapForPage,
        writable: true,
      },
    });

    Object.defineProperty(pebEditor, 'pebCreateAction', {
      value: pebEditor.pebCreateAction,
      writable: true,
    });

  });

  beforeEach(() => {

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', ['insertToSlot']);

    editorStore = {
      page$: new Subject(),
      activePageId$: new Subject(),
      snapshot: {
        pages: [],
        application: {
          routing: [],
        },
      },
      updateReplicas: jasmine.createSpy('updateReplicas'),
      activatePage: jasmine.createSpy('activatePage'),
      getPage: jasmine.createSpy('getPage'),
    };

    const stateMock = {
      hoveredElement: null,
      selectedElements: [],
      sidebarsActivity: {},
      pagesView: PebPageType.Master
    };

    const storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        PebEditorShopMasterPageChangesPlugin,
        { provide: PebEditorStore, useValue: editorStore },
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: Store, useValue: storeSpy },
      ],
    });

    plugin = TestBed.inject(PebEditorShopMasterPageChangesPlugin);
    state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should get editor', () => {

    expect(plugin[`editor`]).toEqual(editorComponent);

  });

  it('should handle after global init', () => {

    const currentPage = {
      id: 'p-001',
      name: 'Page 1',
      type: PebPageType.Master,
      master: null,
    };
    const banner = {
      instance: {
        loading: null,
        pageName: null,
        apply: new Subject<void>(),
      },
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
      destroy: jasmine.createSpy('destroy'),
    };
    const pages = [
      currentPage,
      {
        id: 'p-002',
        name: 'Page 2',
        master: null,
      },
      {
        id: 'p-003',
        name: 'Page 3',
        master: {
          id: currentPage.id,
          lastActionId: 'a-001',
        },
      },
    ];
    const applyChangesSpy = spyOn<any>(plugin, 'applyChanges').and.returnValue(of(null));

    editorComponent.insertToSlot.and.returnValue(banner as any);
    editorStore.snapshot.pages = pages;

    /**
     * emit page with type as PebPageType.Replica
     */
    plugin.afterGlobalInit().subscribe();
    editorStore.page$.next({ type: PebPageType.Replica });

    expect(editorComponent.insertToSlot).not.toHaveBeenCalled();
    expect(applyChangesSpy).not.toHaveBeenCalled();

    /**
     * emit page with type as PebPageType.Master
     */
    editorStore.page$.next(currentPage);

    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(
      PebEditorMasterChangesBannerComponent,
      PebEditorSlot.ngContentContainer,
    );
    expect(banner.instance.loading).toBe(false);
    expect(banner.instance.pageName).toEqual(currentPage.name);
    expect(banner.changeDetectorRef.detectChanges).toHaveBeenCalled();
    expect(applyChangesSpy).not.toHaveBeenCalled();
    expect(banner.destroy).not.toHaveBeenCalled();

    /**
     * emit banner.instance.apply
     * currentPage.master is null
     */
    banner.instance.apply.next();

    expect(applyChangesSpy).toHaveBeenCalledWith({
      banner,
      masterPage: currentPage,
      notUpdatedForks: pages.slice(-1),
    });

    /**
     * currentPage.master is set
     */
    currentPage.master = { lastActionId: 'a-001' };
    banner.instance.apply.next();

    expect(applyChangesSpy.calls.mostRecent().args[0]['notUpdatedForks']).toEqual([]);

    /**
     * emit editorStore.activePageId$ as 'p-013'
     */
    editorStore.activePageId$.next('p-013');

    expect(banner.destroy).toHaveBeenCalled();

  });

  it('should apply changes', () => {

    const masterPage = { id: 'p-001' };
    const banner = {
      instance: { loading: false },
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
    };
    const notUpdatedForks = [{ id: 'p-002' }];
    const action = { id: 'a-001' };
    const snapshot: any = { test: 'snapshot' };
    const closeSpy = spyOn<any>(plugin, 'closeMasterPages').and.returnValue(of(null));
    const getNextActionSpy = spyOn<any>(plugin, 'getNextInitAction').and.returnValue(of(action));

    editorStore.updateReplicas.and.returnValue(of(snapshot));

    /**
     * argument notUpdatedForks is []
     */
    plugin[`applyChanges`]({
      masterPage,
      banner,
      notUpdatedForks: [],
    } as any).subscribe();

    expect(banner.instance.loading).toBe(true);
    expect(banner.changeDetectorRef.detectChanges).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalledWith({
      masterPage,
      banner,
      notUpdatedForks: [],
    });
    expect(getNextActionSpy).not.toHaveBeenCalled();
    expect(editorStore.updateReplicas).not.toHaveBeenCalled();
    expect(editorStore.snapshot).not.toEqual(snapshot);

    /**
     * argument notUpdatedForks is set
     */
    plugin[`applyChanges`]({
      masterPage,
      banner,
      notUpdatedForks,
    } as any).subscribe();

    expect(getNextActionSpy).toHaveBeenCalledWith(notUpdatedForks[0]);
    expect(editorStore.updateReplicas).toHaveBeenCalledWith([action]);
    expect(editorStore.snapshot).toEqual(snapshot);
    expect(closeSpy).toHaveBeenCalledWith({
      masterPage,
      banner,
      notUpdatedForks,
    });

  });

  it('should close master pages', () => {

    const page = { id: 'p-001', type: PebPageType.Master };
    const notUpdatedForks = [{ id: 'p-002' }];

    editorStore.activatePage.and.returnValue(of(null));

    /**
     * argument notUpdatedForks is []
     * editorStore.snapshot.pages is without replica page
     */
    editorStore.snapshot.pages = [page];

    plugin[`closeMasterPages`]({ notUpdatedForks: [] } as any).subscribe();

    expect(state.hoveredElement).toBeNull();
    expect(state.selectedElements).toEqual([]);
    expect(state.sidebarsActivity).toEqual({
      [ShopEditorSidebarTypes.EditMasterPages]: false,
    });
    expect(state.pagesView).toEqual(PebPageType.Replica);
    expect(store.dispatch).toHaveBeenCalledWith(new PebDeselectAllAction());
    expect(editorStore.activatePage).toHaveBeenCalledWith(undefined);

    /**
     * editorStore.snapshot.pages is set with replica page
     */
    page.type = PebPageType.Replica;

    plugin[`closeMasterPages`]({ notUpdatedForks: [] } as any).subscribe();

    expect(editorStore.activatePage).toHaveBeenCalledWith(page.id);

    /**
     * argument notUpdatedForks is set
     */
    plugin[`closeMasterPages`]({ notUpdatedForks } as any).subscribe();

    expect(editorStore.activatePage).toHaveBeenCalledWith(notUpdatedForks[0].id);

  });

  it('should get next init action', () => {

    const generateSpy = spyOn(pebCore, 'generateUniqueIdsForPage');
    const applyIdsSpy = spyOn(pebCore, 'applyIdsMapForPage');
    const createActionSpy = spyOn(pebEditor, 'pebCreateAction');
    const page = {
      id: 'p-001',
      templateId: 'tpl-001',
      stylesheetIds: Object.values(PebScreen).reduce((acc, screen) => {
        return { ...acc, [screen]: `${screen.charAt(0)}-001` };
      }, {}),
      contextId: 'ctx-001',
      master: {
        id: 'master-001',
        idsMap: {
          'master-001': 'p-001',
        },
      },
    };
    const routing = [{
      pageId: page.id,
      routeId: 'r-001',
    }];
    const action: any = { id: 'a-001' };

    editorStore.snapshot.application.routing = routing;
    editorStore.getPage.and.returnValue(of(page));
    generateSpy.and.callFake((masterPageSource) => {
      const idsMap = { ...masterPageSource.master.idsMap };
      idsMap['master-001-updated'] = idsMap['master-001'];
      delete idsMap['master-001'];
      return idsMap;
    });
    applyIdsSpy.and.returnValue(page as any);
    createActionSpy.and.returnValue(action);

    plugin[`getNextInitAction`](page as any).subscribe();

    expect(generateSpy).toHaveBeenCalledWith(page as any);
    expect(applyIdsSpy).toHaveBeenCalledWith(page as any, {
      'master-001': 'p-001',
      'master-001-updated': 'p-001',
    });
    expect(createActionSpy).toHaveBeenCalledWith(
      PebActionType.CreatePageWithIds as any,
      {
        ids: {
          routeId: routing[0].routeId,
          templateId: page.templateId,
          stylesheetIds: page.stylesheetIds,
          contextId: page.contextId,
          pageId: page.id,
        },
        page: {
          ...page,
          type: PebPageType.Replica,
          master: {
            ...page.master,
            idsMap: {
              'master-001': 'p-001',
              'master-001-updated': 'p-001',
            },
          },
        },
      },
    );

  });

});
