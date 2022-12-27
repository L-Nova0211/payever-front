import { EventEmitter } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { of, Subject } from 'rxjs';

import { PebEditorApi } from '@pe/builder-api';
import * as pebCore from '@pe/builder-core';
import { PebEditorState, PebElementType, PebMediaService, PebPageVariant, PebShopRoute } from '@pe/builder-core';
import { PebEditor } from '@pe/builder-main-editor';
import { PebEditorAccessorService, PebEditorRenderer, PebEditorStore, SnackbarErrorService } from '@pe/builder-shared';
import { SnackbarService } from '@pe/snackbar';

import { PebEditorPagePlugin } from './page.plugin';

import { PebEditorAddElementPlugin } from 'src/modules/base-plugins/general/add-element.plugin';

describe('PebEditorPagePlugin', () => {

  let plugin: PebEditorPagePlugin;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let renderer: jasmine.SpyObj<PebEditorRenderer>;
  let behaviorAddElement: jasmine.SpyObj<PebEditorAddElementPlugin>;
  let editorStore: {
    snapshot: {
      pages: any[];
      application: { routing: any[]; };
    };
    page: {
      id: string;
      template: { id: string; };
    };
    page$: Subject<any>;
    updatePage: jasmine.Spy;
    updatePagesWithShopRouting: jasmine.Spy;
    updateShopThemeRouting: jasmine.Spy;
  };
  let state: {
    selectedElements$: Subject<string[]>;
  };

  beforeAll(() => {

    Object.defineProperties(pebCore, {
      pebGenerateId: {
        value: pebCore.pebGenerateId,
        writable: true,
      },
      getPageUrlByName: {
        value: pebCore.getPageUrlByName,
        writable: true,
      },
    });

  });

  beforeEach(() => {

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', ['openSidebarPage']);

    state = {
      selectedElements$: new Subject(),
    };

    const rendererSpy = jasmine.createSpyObj<PebEditorRenderer>('PebEditorRenderer', ['getElementComponent'], {
      rendered: of(null),
    });

    editorStore = {
      snapshot: {
        pages: [],
        application: {
          routing: [],
        },
      },
      page: {
        id: 'p-001',
        template: { id: 'tpl-001' },
      },
      page$: new Subject(),
      updatePage: jasmine.createSpy('updatePage'),
      updatePagesWithShopRouting: jasmine.createSpy('updatePagesWithShopRouting'),
      updateShopThemeRouting: jasmine.createSpy('updateShopThemeRouting'),
    };

    const behaviorAddElementSpy = jasmine.createSpyObj<PebEditorAddElementPlugin>('PebEditorAddElementPlugin', {
      addSection: of(null),
    });

    TestBed.configureTestingModule({
      providers: [
        PebEditorPagePlugin,
        FormBuilder,
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: PebEditorState, useValue: state },
        { provide: PebEditorRenderer, useValue: rendererSpy },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: SnackbarService, useValue: {} },
        { provide: SnackbarErrorService, useValue: {} },
        { provide: PebEditorApi, useValue: {} },
        { provide: PebMediaService, useValue: {} },
        { provide: 'PEB_ENTITY_NAME', useValue: 'entity' },
        { provide: PebEditorAddElementPlugin, useValue: behaviorAddElementSpy },
      ],
    });

    plugin = TestBed.inject(PebEditorPagePlugin);
    renderer = TestBed.inject(PebEditorRenderer) as jasmine.SpyObj<PebEditorRenderer>;
    behaviorAddElement = TestBed.inject(PebEditorAddElementPlugin) as jasmine.SpyObj<PebEditorAddElementPlugin>;

  });

  it('should be defined', () => {

    expect(plugin).toBeDefined();

  });

  it('should open page sidebar after global init', () => {

    const openSpy = spyOn<any>(plugin, 'openPageSidebar').and.returnValue(of(null));
    const documentEl = {
      id: 'tpl-001',
      type: PebElementType.Document,
    };

    plugin.afterGlobalInit().subscribe();

    /**
     * emit editorStore.page$ as null
     */
    editorStore.page$.next(null);
    state.selectedElements$.next([]);

    expect(renderer.getElementComponent).not.toHaveBeenCalled();
    expect(openSpy).not.toHaveBeenCalled();

    /**
     * emit editorStore.page$ as mocked data
     * renderer.getElementComponent returns mocked data
     */
    renderer.getElementComponent.and.returnValue(documentEl as any);
    editorStore.page$.next(editorStore.page);
    state.selectedElements$.next([editorStore.page.template.id]);

    expect(renderer.getElementComponent).toHaveBeenCalledOnceWith(editorStore.page.template.id);
    expect(openSpy).toHaveBeenCalledOnceWith(editorStore.page, editorStore.snapshot, documentEl);

    /**
     * renderer.getElementComponent returns null and then mocked data
     */
    openSpy.calls.reset();
    renderer.getElementComponent.calls.reset();
    renderer.getElementComponent.and.returnValues(null, documentEl as any);
    state.selectedElements$.next([]);

    expect(renderer.getElementComponent.calls.allArgs()).toEqual(Array(2).fill([editorStore.page.template.id]));
    expect(openSpy).toHaveBeenCalledOnceWith(editorStore.page, editorStore.snapshot, documentEl);

  });

  it('should open page sidebar', () => {

    const activePage = { id: 'p-002' };
    const snapshot = { application: { id: 'app-001' } };
    const elCmp = {
      definition: {
        id: 'elem',
      },
      styles: {
        display: 'none',
      },
    };
    const sidebarCmp = {
      instance: {
        page: undefined,
        application: undefined,
        component: undefined,
      },
      changeDetectorRef: {
        detectChanges: jasmine.createSpy('detectChanges'),
      },
      destroy: jasmine.createSpy('destroy'),
    };
    const trackSidebarChangesSpy = spyOn<any>(plugin, 'trackSidebarChanges').and.returnValue(new Subject());

    editorComponent.openSidebarPage.and.returnValue(sidebarCmp as any);

    /**
     * argument activePage is set
     */
    plugin[`openPageSidebar`](activePage as any, snapshot as any, elCmp as any).subscribe();

    expect(editorComponent.openSidebarPage).toHaveBeenCalledWith(plugin.sidebarComponent);
    expect(sidebarCmp.instance).toEqual({
      page: activePage,
      application: snapshot.application,
      component: elCmp,
    });
    expect(sidebarCmp.changeDetectorRef.detectChanges).toHaveBeenCalled();
    expect(trackSidebarChangesSpy).toHaveBeenCalledWith(activePage, sidebarCmp.instance);
    expect(sidebarCmp.destroy).not.toHaveBeenCalled();

    /**
     * finalize
     * emit editorStore.page$ as null
     */
    editorStore.page$.next(null);
    expect(sidebarCmp.destroy).toHaveBeenCalled();

    /**
     * argument activePage is null
     */
    sidebarCmp.destroy.calls.reset();

    plugin[`openPageSidebar`](null, snapshot as any, elCmp as any).subscribe();

    expect(sidebarCmp.instance.page).toBeNull();
    expect(trackSidebarChangesSpy).toHaveBeenCalledWith(null, sidebarCmp.instance);
    expect(sidebarCmp.destroy).not.toHaveBeenCalled();

    /**
     * finalize
     * emit editorStore.page$ as mocked data
     */
    editorStore.page$.next(editorStore.page);
    expect(sidebarCmp.destroy).toHaveBeenCalled();

    /**
     * argument activePage is set
     */
    sidebarCmp.destroy.calls.reset();

    plugin[`openPageSidebar`](activePage as any, snapshot as any, elCmp as any).subscribe();

    expect(sidebarCmp.destroy).not.toHaveBeenCalled();

    /**
     * finalize
     * emit editorStore.page$ as activePage
     */
    editorStore.page$.next(activePage);
    expect(sidebarCmp.destroy).not.toHaveBeenCalled();

    /**
     * emit editorStore.page$ as mocked data with id NOT equal to activePage.id
     */
    editorStore.page$.next(editorStore.page);
    expect(sidebarCmp.destroy).toHaveBeenCalled();

  });

  it('should track sidebar changes', () => {

    const activePage = {
      id: 'p-001',
      name: 'Active Page',
    };
    const sidebar = {
      createNewSection: new EventEmitter<boolean>(),
      changePageName: new EventEmitter<string>(),
      changePageType: new EventEmitter<PebPageVariant>(),
      changeRootPage: new EventEmitter<boolean>(),
      changePageLink: new EventEmitter<PebShopRoute>(),
    };
    const routingPayload = [{
      routeId: 'r-001',
      pageId: 'p-001',
      url: 'pages/p-001',
    }];
    const pagesPayloadSpy = spyOn<any>(plugin, 'getPagesPayload').and.returnValue([activePage]);
    const routingPayloadSpy = spyOn<any>(plugin, 'getRoutingPayload').and.returnValue(routingPayload);
    const newRoute = {
      routeId: 'r-002',
      pageId: 'p-001',
      url: 'page/001',
    };

    behaviorAddElement.addSection.and.returnValue(of(null));
    editorStore.updatePage.and.returnValue(of(null));
    editorStore.updatePagesWithShopRouting.and.returnValue(of(null));
    editorStore.updateShopThemeRouting.and.returnValue(of(null));

    plugin.trackSidebarChanges(activePage as any, sidebar as any).subscribe();

    /**
     * emit sidebar.createNewSection
     */
    sidebar.createNewSection.emit(true);

    expect(behaviorAddElement.addSection).toHaveBeenCalledWith({
      variant: PebElementType.Section,
      type: PebElementType.Section,
      setAfter: true,
    });

    /**
     * emit sidebar.changePageName
     */
    sidebar.changePageName.emit('New Page Name');

    expect(editorStore.updatePage).toHaveBeenCalledWith(activePage, { name: 'New Page Name' });

    /**
     * emit sidebar.changePageType
     */
    editorStore.updatePage.calls.reset();
    sidebar.changePageType.emit(PebPageVariant.Product);

    expect(editorStore.updatePage).toHaveBeenCalledWith(activePage, { variant: PebPageVariant.Product });

    /**
     * emit sidebar.changeRootPage
     */
    sidebar.changeRootPage.next(false);

    expect(pagesPayloadSpy).toHaveBeenCalledWith(false, activePage);
    expect(routingPayloadSpy).toHaveBeenCalledWith([activePage]);
    expect(editorStore.updatePagesWithShopRouting).toHaveBeenCalledWith([activePage], routingPayload);

    /**
     * emit sidebar.changePageLink
     */
    sidebar.changePageLink.next(newRoute);

    expect(editorStore.updateShopThemeRouting).toHaveBeenCalledWith([newRoute]);

  });

  it('should get pages payload', () => {

    const activePage = {
      id: 'p-002',
      name: 'Page 2',
    };

    /**
     * editorStore.snapshot.pages is []
     * argument value is FALSE
     */
    expect(plugin[`getPagesPayload`](false, activePage as any)).toEqual([]);

    /**
     * editorStore.snapshot.pages contains previous fron page
     * argument value is TRUE
     */
    editorStore.snapshot.pages.push({
      id: 'p-001',
      name: 'Page 1',
      variant: PebPageVariant.Front,
    });

    expect(plugin[`getPagesPayload`](true, activePage as any)).toEqual([
      {
        ...editorStore.snapshot.pages[0],
        variant: PebPageVariant.Default,
      },
      {
        ...activePage,
        variant: PebPageVariant.Front,
      },
    ]);

  });

  it('should get routing payload', () => {

    const pages = [
      {
        id: 'p-001',
        name: 'Page 001',
        variant: PebPageVariant.Front,
      },
      {
        id: 'p-002',
        name: 'Page 002',
        variant: PebPageVariant.Default,
      },
    ];
    const routing = [
      {
        pageId: 'p-002',
        routeId: 'r-002',
        url: '/pages/p-002',
      },
    ];
    const nameSpy = spyOn(pebCore, 'getPageUrlByName')
      .and.callFake((name: string) => `/${name.toLowerCase().replace(/\s+/, '-')}-generated`);
    const generateIdSpy = spyOn(pebCore, 'pebGenerateId').and.returnValue('gid-001');

    editorStore.snapshot.application.routing = routing;

    expect(plugin[`getRoutingPayload`](pages)).toEqual([
      { pageId: 'p-001', routeId: 'gid-001', url: '/' },
      { pageId: 'p-002', routeId: 'r-002', url: '/page-002-generated' },
    ]);
    expect(generateIdSpy).toHaveBeenCalledTimes(1);
    expect(nameSpy).toHaveBeenCalledOnceWith('Page 002');

  });

});
