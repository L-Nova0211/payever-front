import { Overlay } from '@angular/cdk/overlay';
import { EventEmitter, ViewContainerRef } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import {
  PebEditorState,
  PebLanguage,
  PebPageType,
  PebPageVariant,
  PebScreen,
} from '@pe/builder-core';
import {
  EditorSidebarTypes,
  PagePreviewService,
  PebEditorAccessorService,
  PebEditorStore,
} from '@pe/builder-editor';
import { PebPagesComponent } from '@pe/builder-pages';
import { MessageBus, PebDeviceService } from '@pe/common';
import { of, Subject, throwError } from 'rxjs';
import { isEmpty, take } from 'rxjs/operators';
import { PebEditorShopNavigationComponent } from './navigation.component';

describe('PebEditorShopNavigationComponent', () => {

  let fixture: ComponentFixture<PebEditorShopNavigationComponent>;
  let component: PebEditorShopNavigationComponent;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let previewService: jasmine.SpyObj<PagePreviewService>;
  let dialog: jasmine.SpyObj<MatDialog>;
  let overlay: jasmine.SpyObj<Overlay>;
  let overlayRef: {
    attach: jasmine.Spy;
    hasAttached: jasmine.Spy;
    detach: jasmine.Spy;
    backdropClick: jasmine.Spy;
    dispose: jasmine.Spy;
  };
  let backdropSubject: Subject<void>;
  let editorStore: {
    page: {
      id: string;
      stylesheets: any;
    };
    pageActions: any[];
    pages: { [id: string]: any };
    theme: { id: string; };
    snapshot: {
      pages: any[];
    };
    updatePagePreview: jasmine.Spy;
    updatePage: jasmine.Spy;
    getPage: jasmine.Spy;
  };
  let state: {
    screen: PebScreen;
    screen$: Subject<PebScreen>;
    pagesView: PebPageType;
    pagesView$: Subject<PebPageType>;
    language: PebLanguage;
    sidebarsActivity: { [key: string]: boolean };
  };
  let editorComponent: { commands$: Subject<any>; };
  let deviceService: { isMobile: boolean };

  const viewContainerRef = { test: 'view.container' };

  beforeEach(waitForAsync(() => {

    deviceService = { isMobile: false };

    state = {
      screen: PebScreen.Desktop,
      screen$: new Subject(),
      pagesView: PebPageType.Master,
      pagesView$: new Subject(),
      language: PebLanguage.English,
      sidebarsActivity: { test: true },
    };

    backdropSubject = new Subject<void>();
    overlayRef = {
      attach: jasmine.createSpy('attach'),
      hasAttached: jasmine.createSpy('hasAttached').and.returnValue(true),
      detach: jasmine.createSpy('detach'),
      backdropClick: jasmine.createSpy('backdropClick').and.returnValue(backdropSubject),
      dispose: jasmine.createSpy('dispose'),
    };
    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      create: overlayRef as any,
      position: {
        flexibleConnectedTo: () => ({
          withFlexibleDimensions: () => ({
            withViewportMargin: () => ({
              withPositions: () => 'positionStrategy',
            }),
          }),
        }),
      } as any,
    }, {
      scrollStrategies: {
        reposition: () => 'scrollStrategy',
      } as any,
    });

    const previewServiceSpy = jasmine.createSpyObj<PagePreviewService>('PagePreviewService', ['renderPreview']);

    editorStore = {
      page: {
        id: 'p-001',
        stylesheets: {
          [PebScreen.Desktop]: { color: '#333333' },
        },
      },
      pageActions: [],
      pages: {},
      theme: { id: 'theme-001' },
      snapshot: {
        pages: [],
      },
      updatePagePreview: jasmine.createSpy('updatePagePreview'),
      updatePage: jasmine.createSpy('updatePage'),
      getPage: jasmine.createSpy('getPage'),
    };

    const dialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

    editorComponent = {
      commands$: new Subject(),
    };

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

    TestBed.configureTestingModule({
      declarations: [PebEditorShopNavigationComponent],
      providers: [
        { provide: PebEditorState, useValue: state },
        { provide: PebDeviceService, useValue: deviceService },
        { provide: Overlay, useValue: overlaySpy },
        { provide: PagePreviewService, useValue: previewServiceSpy },
        { provide: PebEditorStore, useValue: editorStore },
        { provide: ViewContainerRef, useValue: viewContainerRef },
        { provide: MatDialog, useValue: dialogSpy },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
        { provide: MessageBus, useValue: messageBusSpy },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorShopNavigationComponent);
      component = fixture.componentInstance;

      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;
      overlay = TestBed.inject(Overlay) as jasmine.SpyObj<Overlay>;
      previewService = TestBed.inject(PagePreviewService) as jasmine.SpyObj<PagePreviewService>;
      dialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set loading', () => {

    const nextSpy = spyOn(component[`loadingSubject$`], 'next');

    component.loading = true;

    expect(nextSpy).toHaveBeenCalledWith(true);

  });

  it('should get main pages', () => {

    const pages = [
      { id: 'p-001', parentId: null },
      { id: 'p-002', parentId: 'p-001' },
    ];

    component.pages = pages as any[];
    expect(component.mainPages).toEqual([pages[0]] as any[])

  });

  it('should set/get active page snapshot', () => {

    const pageSnapshot = {
      id: 'ps-001',
      data: null,
    };
    const nextSpy = spyOn(component[`savePreviewEmitter`], 'next');
    const pageActions = [
      { id: 'a-001', affectedPageIds: ['ps-001'] },
      { id: 'a-002', affectedPageIds: ['ps-002', 'ps-003'] },
      { id: 'a-003', affectedPageIds: ['ps-001', 'ps-003'] },
    ];

    /**
     * pageSnapshot is null
     * component._activePageSnapshot is null
     */
    component.isSelectedAll = true;
    component[`_activePageSnapshot`] = null;
    component.activePageSnapshot = null;

    expect(component.isSelectedAll).toBe(false);
    expect(component.activePageSnapshot).toBeNull();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * pageSnapshot is set
     * pageSnapshot.data is null
     * editorStore.pageActions is set
     */
    editorStore.pageActions = pageActions;
    component.activePageSnapshot = { ...pageSnapshot } as any;

    expect(component.activePageSnapshot).toEqual(pageSnapshot as any);
    expect(component[`lastActionId`]).toBeUndefined();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * pageSnapshot.data.preview is null
     */
    pageSnapshot.id = 'ps-002';
    pageSnapshot.data = { preview: null };
    component.activePageSnapshot = { ...pageSnapshot } as any;

    expect(component[`lastActionId`]).toEqual('a-003');
    expect(nextSpy).toHaveBeenCalled();

    /**
     * pageSnapshot.data.preview[PebScreen.Desktop] is set
     */
    pageSnapshot.id = 'ps-001';
    pageSnapshot.data = {
      preview: {
        [PebScreen.Desktop]: { test: 'desktop.preview' },
      },
    };
    component.activePageSnapshot = { ...pageSnapshot } as any;

    expect(component[`lastActionId`]).toEqual('a-002');
    expect(nextSpy).toHaveBeenCalledTimes(2);

    pageSnapshot.id = 'ps-002';
    component.activePageSnapshot = { ...pageSnapshot } as any;

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editorComponent as any);

  });

  it('should get screen$', () => {

    component.screen$.subscribe(screen => expect(screen).toEqual(PebScreen.Mobile));
    state.screen$.next(PebScreen.Mobile);

  });

  it('should handle window blur', () => {

    const nextSpy = spyOn(component[`savePreviewEmitter`], 'next');
    const pageActions = [
      { id: 'a-001', affectedPageIds: ['ps-001'] },
      { id: 'a-002', affectedPageIds: ['ps-002', 'ps-003'] },
    ];
    const pageSnapshot = {
      id: 'ps-001',
      data: null,
    };

    editorStore.pageActions = pageActions;

    /**
     * component._activePageSnapshot is null
     */
    component[`_activePageSnapshot`] = null;
    component.onBlurWindow(null);

    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component._activePageSnapshot is set with prop data as null
     */
    component[`_activePageSnapshot`] = pageSnapshot as any;
    component.onBlurWindow(null);

    expect(nextSpy).toHaveBeenCalled();

    /**
     * component._activePageSnapshot.data.preview is null
     */
    pageSnapshot.data = { preview: null };

    component.onBlurWindow(null);

    expect(nextSpy).toHaveBeenCalledTimes(2);

    /**
     * component._activePageSnapshot.data.preview[PebScreen.Desktop] is set
     * component.lastActionId is null
     */
    pageSnapshot.data.preview = {
      [PebScreen.Desktop]: { test: 'desktop.preview' },
    };

    component[`lastActionId`] = null;
    component.onBlurWindow(null);

    expect(nextSpy).toHaveBeenCalledTimes(3);

    /**
     * component.lastActionId is 'a-001'
     */
    nextSpy.calls.reset();

    component[`lastActionId`] = 'a-001';
    component.onBlurWindow(null);

    expect(nextSpy).not.toHaveBeenCalled();

  });

  it('should handle ng after view init', () => {

    const saveSpy = spyOn(component, 'savePagePreview').and.returnValue(of(null));
    const command = {
      type: 'updatePagePreview',
      params: null,
    };
    const pageActions = [
      { id: 'a-001', affectedPageIds: ['ps-001'] },
      { id: 'a-002', affectedPageIds: ['ps-002', 'ps-003'] },
    ];
    const pageSnapshot = {
      id: 'ps-001',
      type: PebPageType.Master,
      variant: PebPageVariant.Front,
      data: null,
    };

    editorStore.pageActions = pageActions;

    /**
     * emit state.screen$
     */
    component.ngAfterViewInit();
    state.screen$.next(PebScreen.Desktop);
    state.screen$.next(PebScreen.Mobile);

    expect(saveSpy).toHaveBeenCalledWith({ screen: PebScreen.Desktop });

    /**
     * emit component.savePreviewEmitter
     */
    saveSpy.calls.reset();

    component[`savePreviewEmitter`].next();

    expect(saveSpy).toHaveBeenCalledWith();

    /**
     * emit command
     * command.type is 'updatePagePreview'
     * command.params is null
     * component._activePageSnapshot is null
     */
    saveSpy.calls.reset();

    component[`_activePageSnapshot`] = null;
    editorComponent.commands$.next(command);

    expect(saveSpy).not.toHaveBeenCalled();
    expect(messageBus.emit).not.toHaveBeenCalled();

    /**
     * component._activePageSnapshot.data is null
     */
    component[`_activePageSnapshot`] = pageSnapshot as any;
    editorComponent.commands$.next(command);

    expect(saveSpy).toHaveBeenCalledWith({ screen: state.screen });
    expect(messageBus.emit).toHaveBeenCalledWith(
      'editor.pagePreview.updated',
      null,
    );

    /**
     * command.params is set
     * component._activePageSnapshot.data.preview is null
     */
    command.params = {
      screen: PebScreen.Mobile,
      pageType: PebPageType.Master,
      pageVariant: PebPageVariant.Front,
    };
    pageSnapshot.data = { preview: null };
    saveSpy.calls.reset();
    messageBus.emit.calls.reset();
    editorComponent.commands$.next(command);

    expect(saveSpy).toHaveBeenCalledWith({ screen: command.params.screen });
    expect(messageBus.emit).toHaveBeenCalledWith(
      'editor.pagePreview.updated',
      command.params,
    );

    /**
     * component._activePageSnapshot.data.preview[PebScreen.Mobile] is set
     * component.lastActionId is null
     * command.params.pageVariant is PebPageVariant.Default
     */
    pageSnapshot.data.preview = {
      [command.params.screen]: { test: 'mobile.preview' },
    };
    component[`lastActionId`] = null;
    command.params.pageVariant = PebPageVariant.Default;
    saveSpy.calls.reset();
    editorComponent.commands$.next(command);

    expect(saveSpy).not.toHaveBeenCalled();

    /**
     * component.lastActionsId is 'a-001'
     */
    component[`lastActionId`] = 'a-001';
    editorComponent.commands$.next(command);

    expect(saveSpy).not.toHaveBeenCalled();

  });

  it('should handle ng destroy', () => {

    const completeSpy = spyOn(component[`savePreviewEmitter`], 'complete');
    const spies = [
      spyOn(component[`destroyed$`], 'next'),
      spyOn(component[`destroyed$`], 'complete'),
    ];

    component.ngOnDestroy();

    spies.forEach(spy => expect(spy).toHaveBeenCalled());
    expect(completeSpy).toHaveBeenCalled();

  });

  it('should save page preview', () => {

    const pageSnapshot = {
      id: 'p-001',
      template: { id: 'tpl-001' },
      context: { test: 'context' },
    };
    const page = {
      id: 'p-001',
      stylesheets: {
        [PebScreen.Mobile]: {
          'tpl-001': { color: '#333333' },
        },
      },
    };

    previewService.renderPreview.and.returnValue(of({ blobName: 'blob' }) as any);
    editorStore.updatePagePreview.and.returnValue(of(null));
    editorStore.pages = {
      [page.id]: page,
    };

    /**
     * argument pageSnapshot is component._activePageSnapshot as default
     * argument screen is state.screen as default
     */
    component[`_activePageSnapshot`] = {
      ...pageSnapshot,
      id: 'p-013',
    } as any;
    component.savePagePreview().pipe(
      take(1),
      isEmpty(),
    ).subscribe(empty => expect(empty).toBe(true));

    expect(previewService.renderPreview).not.toHaveBeenCalled();
    expect(editorStore.updatePagePreview).not.toHaveBeenCalled();

    /**
     * arguments pageSnapshot & screen are set
     */
    component.savePagePreview({
      pageSnapshot: pageSnapshot as any,
      screen: PebScreen.Mobile,
    }).subscribe();

    expect(previewService.renderPreview).toHaveBeenCalledWith({
      context: pageSnapshot.context,
      stylesheet: page.stylesheets[PebScreen.Mobile],
      screen: PebScreen.Mobile,
      element: pageSnapshot.template as any,
      scale: 1,
      locale: state.language,
    });
    expect(editorStore.updatePagePreview).toHaveBeenCalledWith({
      [page.id]: {
        [PebScreen.Mobile]: 'blob',
      },
    });

  });

  it('should get page snapshot', () => {

    const pageSnapshot: any = { id: 'p-001' };

    component[`_activePageSnapshot`] = pageSnapshot;
    expect(component.getPageSnapshot('p-002')).toBeNull();
    expect(component.getPageSnapshot('p-001')).toEqual(pageSnapshot);

  });

  it('should get page stylesheet', () => {

    const page = {
      id: 'p-001',
      stylesheets: {
        [PebScreen.Desktop]: {
          elem: { color: '#333333' },
        },
      },
    };

    editorStore.page = page;
    expect(component.getPageStylesheet(PebScreen.Desktop)).toEqual(page.stylesheets[PebScreen.Desktop]);

  });

  it('should handle create', () => {

    const afterClosed$ = new Subject<any>();
    const dialogRef = {
      componentInstance: {
        createPage: new EventEmitter<any>(),
      },
      afterClosed: jasmine.createSpy('afterClosed').and.returnValue(afterClosed$),
    };
    const emitSpy = spyOn(component.execCommand, 'emit');
    const mainPages = [{ id: 'p-001' }];
    const command = {
      type: 'test.type',
      payload: { test: 'params' },
    };

    spyOnProperty(component, 'mainPages').and.returnValue(mainPages);
    dialog.open.and.returnValue(dialogRef as any);

    /**
     * deviceService.isMobile is FALSE
     */
    component.onCreate();

    expect(component[`pagesDialogRef`]).toEqual(dialogRef as any);
    expect(dialog.open).toHaveBeenCalledWith(
      PebPagesComponent,
      {
        height: '82.3vh',
        maxWidth: '78.77vw',
        width: '78.77vw',
        panelClass: 'pages-dialog',
        data: {
          screen: state.screen,
          pages: mainPages,
          themeId: editorStore.theme.id,
        },
      },
    );
    expect(emitSpy).not.toHaveBeenCalled();

    /**
     * emit dialogRef.componentInstance.createPage as null
     */
    dialogRef.componentInstance.createPage.emit(null);
    expect(emitSpy).not.toHaveBeenCalled();

    /**
     * emit dialogRef.componentInstance.createPage with mocked command
     */
    dialogRef.componentInstance.createPage.emit(command);
    expect(emitSpy).toHaveBeenCalledWith({
      type: command.type,
      params: command.payload,
    });

    /**
     * emit dialogRef.afterClosed as null
     */
    emitSpy.calls.reset();
    afterClosed$.next(null);
    expect(emitSpy).not.toHaveBeenCalled();

    /**
     * emit dialogRef.afterClosed with mocked data
     */
    afterClosed$.next(command);
    expect(emitSpy).toHaveBeenCalledWith({
      type: command.type,
      params: command.payload,
    });

    /**
     * component.isMobile is TRUE
     */
    component[`isMobile`] = true;
    component.onCreate();

    expect(dialog.open.calls.mostRecent().args[1]).toEqual({
      height: '100%',
      maxWidth: '100%',
      width: '100%',
      panelClass: 'pages-dialog',
      data: {
        screen: state.screen,
        pages: mainPages,
        themeId: editorStore.theme.id,
      },
    });

  });

  it('should create page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const nextSpy = spyOn(component.execCommand, 'next');

    /**
     * argument selectedMaster is undefiend as default
     */
    component.createPage();

    expect(closeSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({
      type: 'createPage',
      params: {
        type: state.pagesView,
        masterId: undefined,
      },
    });

    /**
     * argument selectedMaster is set
     */
    component.createPage({ id: 'master-001' } as any);

    expect(nextSpy).toHaveBeenCalledWith({
      type: 'createPage',
      params: {
        type: state.pagesView,
        masterId: 'master-001',
      },
    });

  });

  it('should fork page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const nextSpy = spyOn(component.execCommand, 'next');

    /**
     * argument selectedMaster is undefiend as default
     */
    component.forkPage();

    expect(closeSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({
      type: 'createPage',
      params: {
        type: state.pagesView,
        masterId: undefined,
      },
    });
    expect(state.pagesView).toEqual(PebPageType.Replica);

    /**
     * argument selectedMaster is set
     */
    component.forkPage({ id: 'master-001' } as any);

    expect(nextSpy).toHaveBeenCalledWith({
      type: 'createPage',
      params: {
        type: state.pagesView,
        masterId: 'master-001',
      },
    });

  });

  it('should delete page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const deleteSpy = spyOn(component, 'deletePageHandler');
    const disabledSpy = spyOn(component, 'isDeleteDisabled');
    const pages: any[] = [
      { id: 'p-001' },
      { id: 'p-002' },
    ];

    /**
     * component.isSelectedAll is FALSE
     * component.isDeleteDisabled returns TRUE
     */
    disabledSpy.and.returnValue(true);

    component.isSelectedAll = false;
    component.pages = pages;
    component.deletePage(pages[0]);

    expect(closeSpy).toHaveBeenCalled();
    expect(disabledSpy).toHaveBeenCalledWith(pages[0]);
    expect(deleteSpy).not.toHaveBeenCalled();

    /**
     * component.isDeleteDisabled returns FALSE
     */
    disabledSpy.and.returnValue(false);

    component.deletePage(pages[0]);

    expect(deleteSpy).toHaveBeenCalledWith(pages[0]);

    /**
     * component.isSelectedAll is TRUE
     */
    disabledSpy.calls.reset();
    disabledSpy.and.returnValues(true, false);
    deleteSpy.calls.reset();

    component.isSelectedAll = true;
    component.deletePage(pages[0]);

    expect(component.isSelectedAll).toBe(false);
    expect(disabledSpy.calls.allArgs()).toEqual(pages.map(page => [page]));
    expect(deleteSpy).toHaveBeenCalledWith([pages[1]]);

  });

  it('should handle page delete', () => {

    const pages = [{ id: 'p-001' }];
    const nextSpy = spyOn(component.execCommand, 'next');
    const warnSpy = spyOn(console, 'warn');

    /**
     * argument page is [] (empty array)
     */
    component.deletePageHandler([]);

    expect(warnSpy).toHaveBeenCalledWith('No set page(s) to be deleted!');
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * argument page is set
     */
    warnSpy.calls.reset();

    component.deletePageHandler(pages);

    expect(nextSpy).toHaveBeenCalledWith({
      type: 'deletePage',
      params: pages,
    });
    expect(warnSpy).not.toHaveBeenCalled();

  });

  it('should check is expand disabled', () => {

    const page = { id: 'p-001', expand: false };
    const pages = [
      { id: 'p-001', parentId: null },
      { id: 'p-002', parentId: null },
      { id: 'p-003', parentId: null },
    ];

    component.pages = pages as any;

    /**
     * page does NOT have children
     * page.expand is FALSE
     */
    expect(component.isExpandDisabled(page as any)).toBe(true);

    /**
     * page.expand is TRUE
     */
    page.expand = true;

    expect(component.isExpandDisabled(page as any)).toBe(true);

    /**
     * page has children
     */
    page.expand = false;
    pages[1].parentId = 'p-001';

    expect(component.isExpandDisabled(page as any)).toBe(false);

  });

  it('should check is collapse disabled', () => {

    const page = { id: 'p-001', expand: true };
    const pages = [
      { id: 'p-001', parentId: null },
      { id: 'p-002', parentId: null },
      { id: 'p-003', parentId: null },
    ];

    component.pages = pages as any;

    /**
     * page does NOT have children
     * page.expand is TRUE
     */
    expect(component.isCollapseDisabled(page as any)).toBe(true);

    /**
     * page.expand is FALSE
     */
    page.expand = false;

    expect(component.isCollapseDisabled(page as any)).toBe(true);

    /**
     * page has children
     */
    page.expand = true;
    pages[1].parentId = 'p-001';

    expect(component.isCollapseDisabled(page as any)).toBe(false);

  });

  it('should check is delete disabled', () => {

    const page = {
      type: PebPageType.Replica,
      variant: PebPageVariant.Default,
    };
    component.pages = [page] as any;

    expect(component.isDeleteDisabled(page as any)).toBe(true);

    page.type = PebPageType.Master;
    expect(component.isDeleteDisabled(page as any)).toBe(false);

  });

  it('should check is page removable', () => {

    const page = {
      id: 'p-001',
      type: PebPageType.Replica,
    };

    /**
     * page.type is PebPageType.Replica
     */
    expect(component.isPageRemovable(page as any)).toBe(true);

    /**
     * page.type is PebPageType.Master
     */
    page.type = PebPageType.Master;
    editorStore.snapshot = {
      pages: [{
        master: {
          id: 'p-001',
        },
      }],
    };

    expect(component.isPageRemovable(page as any)).toBe(false);

  });

  it('should handle close click', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');

    component.onCloseClick();

    expect(closeSpy).toHaveBeenCalled();

  });

  it('should create new slide', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const createSpy = spyOn(component, 'createPage');

    component.newSlide(null, null);

    expect(closeSpy).toHaveBeenCalled();
    expect(createSpy).toHaveBeenCalled();

  });

  it('should skip slide', () => {

    const page = { id: 'p-001', skip: undefined };
    const closeSpy = spyOn(component, 'closeContextMenu');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    editorStore.updatePage.and.returnValue(of(null));

    /**
     * page.skip is undefined
     */
    component.skipSlide(page as any);

    expect(closeSpy).toHaveBeenCalled();
    expect(page.skip).toBe(true);
    expect(editorStore.updatePage).toHaveBeenCalledWith(page as any, { skip: true });
    expect(detectSpy).toHaveBeenCalled();

    /**
     * page.skip is TRUE
     */
    component.skipSlide(page as any);

    expect(page.skip).toBe(false);
    expect(editorStore.updatePage).toHaveBeenCalledWith(page as any, { skip: false });

  });

  it('should cut page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const deleteSpy = spyOn(component, 'deletePageHandler');
    const pages: any[] = [
      { id: 'p-001' },
      { id: 'p-002' },
    ];
    const page = pages[0];

    spyOn(component, 'isDeleteDisabled').and.returnValue(false);
    editorStore.pages = {
      [page.id]: page,
    };
    editorStore.getPage.and.callFake((id: string) => of(pages.find(p => p.id === id)));

    /**
     * component.isSelectedAll is FALSE
     */
    component.isSelectedAll = false;
    component.cutPage(page);

    expect(component.tempCopiedPage).toEqual([page]);
    expect(deleteSpy).toHaveBeenCalledWith([page]);
    expect(closeSpy).toHaveBeenCalled();

    /**
     * component.isSelectedAll is TRUE
     */
    deleteSpy.calls.reset();

    component.isSelectedAll = true;
    component.pages = pages;
    component.cutPage(page);

    expect(component.tempCopiedPage).toEqual(pages);
    expect(deleteSpy).toHaveBeenCalledWith(pages);
    expect(closeSpy).toHaveBeenCalledTimes(2);

  });

  it('should copy page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const pages: any[] = [
      { id: 'p-001' },
      { id: 'p-002' },
    ];
    const page = pages[0];

    spyOn(component, 'isDeleteDisabled').and.returnValue(false);
    editorStore.pages = {
      [page.id]: page,
    };
    editorStore.getPage.and.callFake((id: string) => of(pages.find(p => p.id === id)));

    /**
     * component.isSelectedAll is FALSE
     */
    component.isSelectedAll = false;
    component.copyPage(page);

    expect(component.tempCopiedPage).toEqual([page]);
    expect(closeSpy).toHaveBeenCalled();

    /**
     * component.isSelectedAll is TRUE
     */
    component.isSelectedAll = true;
    component.pages = pages;
    component.copyPage(page);

    expect(component.tempCopiedPage).toEqual(pages);
    expect(closeSpy).toHaveBeenCalledTimes(2);

  });

  it('should paste page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const warnSpy = spyOn(console, 'warn');
    const nextSpy = spyOn(component.execCommand, 'next');
    const page: any = { id: 'p-001' };

    /**
     * component.isSelectedAll is FALSE
     * component.tempCopiedPage is []
     */
    component.isSelectedAll = false;
    component.tempCopiedPage = [];
    component.pastePage(page);

    expect(closeSpy).toHaveBeenCalled();
    expect(component.isSelectedAll).toBe(false);
    expect(warnSpy).toHaveBeenCalledWith('No set page(s) to be pasted!');
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.isSelectedAll is TRUE
     * component.tempCopiedPage is set
     */
    warnSpy.calls.reset();

    component.isSelectedAll = true;
    component.tempCopiedPage = page;
    component.pastePage(page);

    expect(component.isSelectedAll).toBe(false);
    expect(nextSpy).toHaveBeenCalledWith({
      type: 'pastePage',
      params: page,
    });
    expect(warnSpy).not.toHaveBeenCalled();

  });

  it('should select all pages', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    component.selectAllPage();

    expect(closeSpy).toHaveBeenCalled();
    expect(component.isSelectedAll).toBe(true);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should expand page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    let page: any = { id: 'p-003', expand: false };
    const pages: any[] = [
      { id: 'p-001', expand: false },
      { id: 'p-002', expand: false },
    ];

    /**
     * page does NOT exist in component.pages
     */
    component.pages = pages;
    component.expandPage(page);

    expect(component.pages).toEqual(pages);
    expect(detectSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();

    /**
     * page exists in component.pages
     */
    page = pages[0];

    component.expandPage(page);
    expect(component.pages).toEqual([
      { id: 'p-001', expand: true },
      { id: 'p-002', expand: false },
    ] as any);

  });

  it('should collapse page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    let page: any = { id: 'p-003', expand: true };
    const pages: any[] = [
      { id: 'p-001', expand: true },
      { id: 'p-002', expand: false },
    ];

    /**
     * page does NOT exist in component.pages
     */
    component.pages = pages;
    component.collapsePage(page);

    expect(component.pages).toEqual(pages);
    expect(detectSpy).toHaveBeenCalled();
    expect(closeSpy).toHaveBeenCalled();

    /**
     * page exists in component.pages
     */
    page = pages[0];

    component.collapsePage(page);
    expect(component.pages).toEqual([
      { id: 'p-001', expand: false },
      { id: 'p-002', expand: false },
    ] as any);

  });

  it('should edit master slide', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const nextSpy = spyOn(component.execCommand, 'next');
    const pages: any[] = [
      { id: 'p-001' },
      { id: 'p-002' },
    ];

    /**
     * component.pages is []
     */
    state.pagesView = PebPageType.Replica;

    component.pages = [];
    component.editMasterSlide(null);

    expect(closeSpy).toHaveBeenCalled();
    expect(state.pagesView).toEqual(PebPageType.Master);
    expect(nextSpy).not.toHaveBeenCalled();

    state.pagesView$.next(PebPageType.Replica);
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * component.pages is set
     */
    component.pages = pages;
    component.editMasterSlide(null);

    expect(closeSpy).toHaveBeenCalledTimes(2);
    expect(nextSpy).not.toHaveBeenCalled();

    state.pagesView$.next(PebPageType.Replica);
    expect(nextSpy).toHaveBeenCalledWith({ type: 'activatePage', params: pages[0] });

  });

  it('should reapply master', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');

    component.reapplyMaster(null);

    expect(closeSpy).toHaveBeenCalled();

  });

  it('should duplicate page', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const saveSpy = spyOn(component, 'savePagePreview');
    const nextSpy = spyOn(component.execCommand, 'next');
    const warnSpy = spyOn(console, 'warn');
    const errorSpy = spyOn(console, 'error');
    const pages: any[] = [
      { id: 'p-001' },
      { id: 'p-002' },
    ];
    const page = pages[0];

    /**
     * component.isSelectedAll is FALSE
     * argument page is []
     */
    component.isSelectedAll = false;
    component.duplicatePage([] as any);

    expect(closeSpy).toHaveBeenCalled();
    expect(warnSpy).toHaveBeenCalledWith('No set page(s) to be duplicated!');
    expect(saveSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(nextSpy).not.toHaveBeenCalled();

    /**
     * argument page is set
     */
    warnSpy.calls.reset();

    component.pages = pages;
    component[`_activePageSnapshot`] = pages[1];
    component.duplicatePage(page);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    expect(saveSpy).not.toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({
      type: 'duplicatePage',
      params: page,
    });

    /**
     * component.isSelectedAll is TRUE
     * component.savePagePreview throws error
     */
    nextSpy.calls.reset();
    saveSpy.and.returnValue(throwError('test error'));

    component.isSelectedAll = true;
    component.duplicatePage(page);

    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).toHaveBeenCalledWith('test error');
    expect(saveSpy).toHaveBeenCalled();
    expect(nextSpy).toHaveBeenCalledWith({
      type: 'duplicatePage',
      params: pages,
    });

  });

  it('shoult execute action command', () => {

    const nextSpy = spyOn(component.execCommand, 'next');
    const command = {
      type: 'pastePage',
      params: { id: 'p-001' },
    };

    component.actionCommand(command);

    expect(nextSpy).toHaveBeenCalledWith(command);

  });

  it('should switch expand collapse', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const pages: any[] = [
      { id: 'p-001', expand: false },
      { id: 'p-002', expand: false },
    ];
    let page: any = { id: 'p-003', expand: false };

    /**
     * page does NOT exist in component.pages
     */
    component.pages = pages;
    component.switchExpandCollapse(page);

    expect(detectSpy).toHaveBeenCalled();
    expect(component.pages).toEqual(pages);

    /**
     * page exists in component.pages
     */
    page = { id: 'p-001', expand: true };

    component.switchExpandCollapse(page);

    expect(detectSpy).toHaveBeenCalledTimes(2);
    expect(component.pages).toEqual([
      { id: 'p-001', expand: true },
      { id: 'p-002', expand: false },
    ] as any);

  });

  it('should open context menu', () => {

    const closeSpy = spyOn(component, 'closeContextMenu');
    const warnSpy = spyOn(console, 'warn');
    const page = { id: 'p-001' };
    const event = [
      {
        preventDefault: jasmine.createSpy('preventDefault'),
        stopPropagation: jasmine.createSpy('stopPropagation'),
      },
      page,
    ];

    component.openContextMenu(event);

    expect(closeSpy).toHaveBeenCalled();
    expect((event[0] as any).preventDefault).toHaveBeenCalled();
    expect((event[0] as any).stopPropagation).toHaveBeenCalled();
    expect(overlay.create).toHaveBeenCalled();
    expect(overlayRef.attach).toHaveBeenCalled();
    expect(overlayRef.dispose).not.toHaveBeenCalled();

    /**
     * emit backdropSubject
     */
    backdropSubject.next();
    expect(overlayRef.dispose).toHaveBeenCalled();

    /**
     * window.PEB_CONTEXT_MENUS_DISABLED is TRUE
     */
    (window as any).PEB_CONTEXT_MENUS_DISABLED = true;

    component.openContextMenu(event);

    expect(warnSpy).toHaveBeenCalled();

  });

  it('should close page navigation', () => {

    /**
     * deviceService.isMobile is FALSE
     */
    component.closePageNavigation();
    expect(state.sidebarsActivity).toEqual({ test: true });

    /**
     * deviceService.isMobile is TRUE
     */
    deviceService.isMobile = true;

    component.closePageNavigation();
    expect(state.sidebarsActivity).toEqual({
      test: true,
      [EditorSidebarTypes.Navigator]: false,
    });

  });

  it('should close context menu', () => {

    /**
     * component.overlayRef is undefined
     */
    component.closeContextMenu();

    expect(overlayRef.dispose).not.toHaveBeenCalled();

    /**
     * component.overlayRef is set
     */
    component[`overlayRef`] = overlayRef as any;
    component.closeContextMenu();

    expect(overlayRef.dispose).toHaveBeenCalled();

  });

  it('should detach overlay', () => {

    /**
     * component.hasOverlayAttached returns FALSE
     */
    component[`detachOverlay`]();

    expect(overlayRef.detach).not.toHaveBeenCalled();

    /**
     * component.hasOverlayAttached returns TRUE
     */
    component[`overlayRef`] = overlayRef as any;
    component[`detachOverlay`]();

    expect(overlayRef.detach).toHaveBeenCalled();

  });

});
