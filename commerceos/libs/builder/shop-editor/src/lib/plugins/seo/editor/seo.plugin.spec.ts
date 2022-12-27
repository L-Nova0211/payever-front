import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Store } from '@ngxs/store';
import * as pebCore from '@pe/builder-core';
import { PebEditorState } from '@pe/builder-core';
import * as pebEditor from '@pe/builder-editor';
import {
  EditorSidebarTypes,
  PebActionType,
  PebDeselectAllAction,
  PebEditorAccessorService,
  PebEditorSlot,
  PebEditorStore,
  PebSelectAction,
} from '@pe/builder-editor';
import { of, Subject } from 'rxjs';
import { PebEditorShopSeoPlugin } from './seo.plugin';
import { PebEditorShopSeoSidebarComponent } from './seo.sidebar';

describe('PebEditorShopSeoPlugin', () => {

  let plugin: PebEditorShopSeoPlugin;
  let store: jasmine.SpyObj<Store>;
  let editorComponent: {
    commands$: Subject<any>;
    detail: any;
    insertToSlot: jasmine.Spy;
    backTo: jasmine.Spy;
  };
  let editorStore: {
    page: {
      id: string;
      data: any;
    };
    snapshot: {
      application: {
        routing: any[];
      };
    };
    updatePage: jasmine.Spy;
    updateShopThemeRouting: jasmine.Spy;
    commitAction: jasmine.Spy;
  };
  let state: {
    seoSidebarOpened: Boolean;
    selectedElements: string[];
    selectedElements$: Subject<string[]>;
    hoveredElement: string;
    sidebarsActivity: { [key: string]: Boolean };
  };

  beforeAll(() => {

    Object.defineProperty(pebCore, 'pebGenerateId', {
      value: pebCore.pebGenerateId,
      writable: true,
    });

    Object.defineProperty(pebEditor, 'pebCreateAction', {
      value: pebEditor.pebCreateAction,
      writable: true,
    });

  });

  beforeEach(() => {

    editorComponent = {
      commands$: new Subject(),
      detail: null,
      insertToSlot: jasmine.createSpy('insertToSlot'),
      backTo: jasmine.createSpy('backTo'),
    };

    editorStore = {
      page: null,
      snapshot: {
        application: {
          routing: [],
        },
      },
      updatePage: jasmine.createSpy('updatePage'),
      updateShopThemeRouting: jasmine.createSpy('updateShopThemeRouting'),
      commitAction: jasmine.createSpy('commitAction'),
    };

    state = {
      seoSidebarOpened: false,
      selectedElements: ['selected'],
      selectedElements$: new Subject(),
      hoveredElement: 'hovered',
      sidebarsActivity: { test: true },
    };

    const storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

    TestBed.configureTestingModule({
      providers: [
        PebEditorShopSeoPlugin,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: PebEditorState, useValue: state },
        { provide: Store, useValue: storeSpy },
      ],
    });

    plugin = TestBed.inject(PebEditorShopSeoPlugin);
    store = TestBed.inject(Store) as jasmine.SpyObj<Store>;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should get editor', () => {

    expect(plugin[`editor`]).toEqual(editorComponent as any);

  });

  it('should get active page', () => {

    const page: any = { id: 'p-001' };

    editorStore.page = page;
    expect(plugin.activePage).toEqual(page);

  });

  it('should handle after global init', () => {

    const trackSpy = spyOn<any>(plugin, 'trackSidebarChanges');
    const sidebarCmpRef = {
      instance: {
        page: null,
        routing: null,
        url: null,
        destroy$: new Subject(),
      },
      destroy: jasmine.createSpy('destroy'),
    };
    const page = { id: 'p-001', data: null };
    const routing = [{
      pageId: 'p-001',
      routeId: 'r-001',
      url: 'pages/p-001',
    }];
    const tracker$ = new Subject();

    editorComponent.insertToSlot.and.returnValue(sidebarCmpRef);
    editorStore.page = page;
    trackSpy.and.returnValue(tracker$);

    /**
     * editorStore.snapshot.application.routing is []
     */
    plugin.afterGlobalInit().subscribe();
    editorComponent.commands$.next({ type: 'toggleSeoSidebar' });

    expect(state.seoSidebarOpened).toBe(true);
    expect(state.hoveredElement).toBeNull();
    expect(state.selectedElements).toEqual([]);
    expect(store.dispatch).toHaveBeenCalledOnceWith(new PebDeselectAllAction());
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(
      PebEditorShopSeoSidebarComponent,
      PebEditorSlot.sidebarDetail,
    );
    expect(editorComponent.detail).toEqual({ back: 'Page', title: 'SEO' });
    expect(sidebarCmpRef.instance.page).toEqual(page);
    expect(sidebarCmpRef.instance.routing).toEqual([]);
    expect(sidebarCmpRef.instance.url).toEqual('');
    expect(state.sidebarsActivity).toEqual({
      ...state.sidebarsActivity,
      [EditorSidebarTypes.Inspector]: true,
    });
    expect(trackSpy).toHaveBeenCalledWith(sidebarCmpRef.instance);
    expect(sidebarCmpRef.destroy).not.toHaveBeenCalled();
    expect(editorComponent.backTo).not.toHaveBeenCalled();

    /**
     * emit state.selectedElements$
     */
    store.dispatch.calls.reset();
    state.selectedElements$.next(['selected']);

    expect(sidebarCmpRef.destroy).toHaveBeenCalled();
    expect(editorComponent.backTo).toHaveBeenCalledWith('main');
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(state.seoSidebarOpened).toBe(false);

    /**
     * editorStore.snapshot.application.routing is set
     */
    editorStore.snapshot.application.routing = routing;
    editorComponent.backTo.calls.reset();
    sidebarCmpRef.destroy.calls.reset();
    editorComponent.commands$.next({ type: 'toggleSeoSidebar' });

    expect(sidebarCmpRef.instance.url).toEqual(routing[0].url);
    expect(sidebarCmpRef.destroy).not.toHaveBeenCalled();
    expect(editorComponent.backTo).not.toHaveBeenCalled();
    expect(state.selectedElements).toEqual([]);

    /**
     * emit command with type 'activatePage'
     */
    store.dispatch.calls.reset();
    editorComponent.commands$.next({ type: 'activatePage' });

    expect(sidebarCmpRef.destroy).toHaveBeenCalled();
    expect(editorComponent.backTo).toHaveBeenCalledWith('main');
    expect(store.dispatch).not.toHaveBeenCalled();
    expect(state.seoSidebarOpened).toBe(false);

    /**
     * emit command with type 'toggleSeoSidebar'
     */
    editorStore.snapshot.application.routing = routing;
    editorComponent.backTo.calls.reset();
    sidebarCmpRef.destroy.calls.reset();
    state.selectedElements = ['selected'];
    editorComponent.commands$.next({ type: 'toggleSeoSidebar' });

    expect(sidebarCmpRef.destroy).not.toHaveBeenCalled();
    expect(editorComponent.backTo).not.toHaveBeenCalled();
    expect(state.selectedElements).toEqual([]);

    store.dispatch.calls.reset();
    editorComponent.commands$.next({ type: 'toggleSeoSidebar' });

    expect(sidebarCmpRef.destroy).toHaveBeenCalled();
    expect(editorComponent.backTo).toHaveBeenCalledWith('main');
    expect(store.dispatch).toHaveBeenCalledWith(new PebSelectAction(['selected']));
    expect(state.selectedElements).toEqual(['selected']);
    expect(state.seoSidebarOpened).toBe(false);

  });

  it('should track sidebar changes', () => {

    const sidebar = {
      changeTitle: new EventEmitter<any>(),
      changeUrl: new EventEmitter<any>(),
      changeDescription: new EventEmitter<any>(),
      changeShowInSearchResults: new EventEmitter<any>(),
      changeCanonicalUrl: new EventEmitter<any>(),
      changeMarkupData: new EventEmitter<any>(),
      changeCustomMetaTags: new EventEmitter<any>(),
    };
    const page: any = { id: 'p-001' };
    const routing = [{
      pageId: page.id,
      routeId: 'r-001',
      url: `pages/${page.id}`,
    }];
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');
    const updateSpy = spyOn<any>(plugin, 'updateSeo').and.returnValue(of(null));

    editorStore.updatePage.and.returnValue(of(null));
    editorStore.updateShopThemeRouting.and.returnValue(of(null));
    editorStore.page = page;
    editorStore.snapshot.application.routing = [];

    /**
     * emit sidebar.changeTitle
     */
    plugin.trackSidebarChanges(sidebar as any).subscribe();
    sidebar.changeTitle.emit({ title: 'test.title' });

    expect(editorStore.updatePage).toHaveBeenCalledWith(page, { title: 'test.title' });
    expect(editorStore.updateShopThemeRouting).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();

    /**
     * emit sidebar.changeUrl
     * editorStore.snapshot.application.routing is []
     */
    editorStore.updatePage.calls.reset();
    sidebar.changeUrl.emit('pages/new');

    expect(editorStore.updateShopThemeRouting).toHaveBeenCalledWith([{
      url: 'pages/new',
      pageId: page.id,
      routeId: 'gid-001',
    }]);
    expect(editorStore.updatePage).not.toHaveBeenCalled();
    expect(generateIdSpy).toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();

    /**
     * editorStore.snapshot.application.routing is set
     */
    editorStore.snapshot.application.routing = routing;
    generateIdSpy.calls.reset();
    sidebar.changeUrl.emit('pages/new');

    expect(editorStore.updateShopThemeRouting).toHaveBeenCalledWith([{
      url: 'pages/new',
      pageId: page.id,
      routeId: routing[0].routeId,
    }]);
    expect(editorStore.updatePage).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();
    expect(updateSpy).not.toHaveBeenCalled();

    /**
     * emit sidebar.changeDescription
     */
    editorStore.updateShopThemeRouting.calls.reset();
    sidebar.changeDescription.emit('test.desc');

    expect(updateSpy).toHaveBeenCalledWith({ description: 'test.desc' });
    expect(editorStore.updatePage).not.toHaveBeenCalled();
    expect(editorStore.updateShopThemeRouting).not.toHaveBeenCalled();
    expect(generateIdSpy).not.toHaveBeenCalled();

    /**
     * emit sidebar.changeShowInSearchResults
     */
    sidebar.changeShowInSearchResults.emit(false);

    expect(updateSpy).toHaveBeenCalledWith({ showInSearchResults: false });

    /**
     * emit sidebar.changeCanonicalUrl
     */
    sidebar.changeCanonicalUrl.emit('test.canonical.url');

    expect(updateSpy).toHaveBeenCalledWith({ canonicalUrl: 'test.canonical.url' });

    /**
     * emit sidebar.changeMarkupData
     */
    sidebar.changeMarkupData.emit('test.markup');

    expect(updateSpy).toHaveBeenCalledWith({ markupData: 'test.markup' });

    /**
     * emit sidebar.changeCustomMetaTags
     */
    sidebar.changeCustomMetaTags.emit('test.meta');

    expect(updateSpy).toHaveBeenCalledWith({ customMetaTags: 'test.meta' });

  });

  it('should update seo', () => {

    const seoChanges = { showInSearchResults: false };
    const seoData = {
      description: 'desc',
      showInSearchResults: true,
      canonicalUrl: 'canonical',
      markupData: 'markup',
      customMetaTags: 'meta',
    };
    const page = {
      id: 'p-001',
      data: null,
    };
    const action: any = { id: 'a-001' };
    const createActionSpy = spyOn(pebEditor, 'pebCreateAction').and.returnValue(action);

    editorStore.commitAction.and.returnValue(of(null));
    editorStore.page = page;

    /**
     * editorStore.page.data is null
     */
    plugin[`updateSeo`](seoChanges).subscribe();

    expect(createActionSpy).toHaveBeenCalledWith(
      PebActionType.UpdatePageData as any,
      {
        ...page,
        data: {
          ...page.data,
          seo: {
            description: null,
            showInSearchResults: false,
            canonicalUrl: null,
            markupData: null,
            customMetaTags: null,
          },
        },
      },
    );
    expect(editorStore.commitAction).toHaveBeenCalledWith(action);

    /**
     * editorStore.page.data.seo is set
     */
    editorStore.page.data = {
      seo: seoData,
    };

    plugin[`updateSeo`](seoChanges).subscribe();

    expect(createActionSpy).toHaveBeenCalledWith(
      PebActionType.UpdatePageData as any,
      {
        ...page,
        data: {
          ...page.data,
          seo: {
            ...seoData,
            ...seoChanges,
          },
        },
      },
    );
    expect(editorStore.commitAction).toHaveBeenCalledWith(action);

  });

});
