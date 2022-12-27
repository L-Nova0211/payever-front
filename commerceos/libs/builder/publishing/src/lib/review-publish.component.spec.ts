import { NO_ERRORS_SCHEMA, Renderer2 } from '@angular/core';
import {
  ComponentFixture,
  fakeAsync,
  TestBed,
  tick,
  waitForAsync,
} from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { ActivatedRoute, Router } from '@angular/router';
import { omit } from 'lodash';
import { Subject } from 'rxjs';

import { PebScreen } from '@pe/builder-core';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { ReviewPublishComponent } from './review-publish.component';
import { SidebarAnimationProgress } from './sidebar.animation';

describe('ReviewPublishComponent', () => {

  let fixture: ComponentFixture<ReviewPublishComponent>;
  let component: ReviewPublishComponent;
  let renderer: jasmine.SpyObj<Renderer2>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;
  let platformHeader: jasmine.SpyObj<PePlatformHeaderService>;
  let router: jasmine.SpyObj<Router>;
  let route: { queryParams: Subject<any>; };

  const data = {
    totalPages: [],
    current: { test: 'current' },
    published: { id: 'theme-001' },
  };

  beforeEach(waitForAsync(() => {

    const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', ['close']);

    const platformHeaderSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService', [
      'setConfig',
      'assignConfig',
    ]);

    renderer = jasmine.createSpyObj<Renderer2>('Renderer2', ['setStyle']);

    route = {
      queryParams: new Subject<any>(),
    };

    const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        NoopAnimationsModule,
      ],
      declarations: [ReviewPublishComponent],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: PePlatformHeaderService, useValue: platformHeaderSpy },
        { provide: ActivatedRoute, useValue: route },
        { provide: Router, useValue: routerSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(ReviewPublishComponent);
      component = fixture.componentInstance;
      component[`renderer`] = renderer;
      component.draftSnapshot = { pages: [] } as any;
      component.publishedTheme = { pages: [] } as any;

      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<any>>;
      platformHeader = TestBed.inject(PePlatformHeaderService) as jasmine.SpyObj<PePlatformHeaderService>;
      router = TestBed.inject(Router) as jasmine.SpyObj<Router>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should set grid animation progress', () => {

    component.gridAnimationProgress$.subscribe(progress => expect(progress).toEqual(SidebarAnimationProgress.Done));
    component.gridAnimationProgress = SidebarAnimationProgress.Done;

  });

  it('should set/get tree data', () => {

    const data = [{ name: 'Test' }];
    const getSpy = spyOnProperty(component, 'treeData').and.callThrough();

    expect(component.treeData).toEqual([]);
    component.treeData = data;
    expect(component.treeData).toEqual(data);
    expect(getSpy).toHaveBeenCalledTimes(2);

  });

  it('should handle ng init', () => {

    const initPagesSpy = spyOn(component, 'initPages');
    const createHeaderSpy = spyOn(component, 'createHeader');
    const previewNextSpy = spyOn(component.preview$, 'next');
    const markSpy = spyOn(component[`cdr`], 'markForCheck');
    const pageMock = { id: 'p-001' };

    component.draftSnapshot = {
      pages: [pageMock],
    } as any;
    component.publishedTheme = {
      pages: [pageMock],
    } as any;
    component.ngOnInit();

    expect(initPagesSpy).toHaveBeenCalled();
    expect(createHeaderSpy).toHaveBeenCalled();
    expect(component.fullscreens).toEqual([false, false]);
    expect(previewNextSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    /**
     * emit component.selectedVersion$
     */
    component.selectedVersion$.next(pageMock.id);

    expect(component.currentPage).toEqual(pageMock);
    expect(component.publishedPage).toEqual(pageMock);
    expect(previewNextSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

    /**
     * emit router.queryParams
     * params.pageId is null
     */
    route.queryParams.next({ pageId: null });

    expect(component.activeNodeId).toBeUndefined();
    expect(previewNextSpy).toHaveBeenCalledWith({
      current: { pages: [pageMock] },
      published: { pages: [pageMock] },
    } as any);
    expect(markSpy).toHaveBeenCalled();

    /**
     * params.pageId is set
     */
    route.queryParams.next({ pageId: pageMock.id });

    expect(component.activeNodeId).toEqual(pageMock.id);

    /**
     * emit router.queryParams error
     */
    previewNextSpy.calls.reset();
    markSpy.calls.reset();
    route.queryParams.error('test error');

    expect(previewNextSpy).not.toHaveBeenCalled();
    expect(markSpy).not.toHaveBeenCalled();

  });

  it('should create header', () => {

    const menuTrigger = {
      openMenu: jasmine.createSpy('openMenu'),
    };
    const toggleSpy = spyOn(component, 'onToggleSidebar');
    let config: PePlatformHeaderConfig;

    platformHeader.setConfig.and.callFake((c) => config = c);

    /**
     * component.totalPages is []
     */
    component.screen = PebScreen.Desktop;
    component.menuTrigger = menuTrigger as any;
    component.totalPages = [];
    component.createHeader()

    expect(platformHeader.setConfig).toHaveBeenCalledWith(config);
    expect(omit(config, ['rightSectionItems', 'closeItem', 'showDataGridToggleItem', 'leftSectionItems'])).toEqual({
      isShowDataGridToggleComponent: false,
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      isShowCloseItem: false,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
    expect(config.rightSectionItems.length).toBe(1);

    // right section item
    expect(omit(config.rightSectionItems[0], 'onClick')).toEqual({
      title: 'Close',
      class: 'dialog-btn',
    });
    config.rightSectionItems[0].onClick();
    expect(dialogRef.close).toHaveBeenCalledWith(null);

    // close item
    dialogRef.close.calls.reset();

    expect(config.closeItem.title).toEqual('Close');
    config.closeItem.onClick();
    expect(dialogRef.close).toHaveBeenCalledWith(null);

    // show data grid toggle item
    expect(omit(config.showDataGridToggleItem, 'onClick')).toEqual({
      iconSize: '24px',
      iconType: 'vector',
      isActive: true,
      isLoading: true,
      showIconBefore: true,
    });
    config.showDataGridToggleItem.onClick();
    expect(toggleSpy).toHaveBeenCalled();

    // left section item
    expect(config.leftSectionItems.length).toBe(1);
    expect(omit(config.leftSectionItems[0], 'onClick')).toEqual({
      title: 'Desktop',
      class: 'dialog-btn screen-btn',
    });
    config.leftSectionItems[0].onClick();
    expect(menuTrigger.openMenu).toHaveBeenCalled();

    /**
     * component.totalPages is set
     */
    component.totalPages = [{ id: 'p-001' }];
    component.createHeader();

    expect(config.isShowDataGridToggleComponent).toBe(true);

    // right section item
    dialogRef.close.calls.reset();

    expect(config.rightSectionItems.length).toBe(2);
    expect(omit(config.rightSectionItems[1], 'onClick')).toEqual({
      title: 'Publish',
      class: 'dialog-btn active',
    });
    config.rightSectionItems[1].onClick();
    expect(dialogRef.close).toHaveBeenCalledWith(true);

  });

  it('should init pages', () => {

    const treeDataSetSpy = spyOnProperty(component, 'treeData', 'set');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const selectedNextSpy = spyOn(component.selectedVersion$, 'next');
    const pageMock = {
      id: 'p-001',
      name: 'Page 1',
      updatedAt: new Date(2021, 10, 30, 12, 0, 0).toString(),
    };

    component.draftSnapshot = null;
    component.publishedTheme = null;

    /**
     * dialogData.totalPages is []
     */
    component.initPages();

    expect(component.totalPages).toEqual([]);
    expect(component.draftSnapshot).toBeNull();
    expect(component.publishedTheme).toBeNull();
    expect(component.activeNodeId).toBeUndefined();
    expect(treeDataSetSpy).not.toHaveBeenCalled();
    expect(detectSpy).not.toHaveBeenCalled();
    expect(selectedNextSpy).not.toHaveBeenCalled();

    /**
     * dialogData.totalPages is set
     */
    data.totalPages = [pageMock];

    component.initPages();

    expect(component.totalPages).toEqual([pageMock]);
    expect(component.draftSnapshot).toEqual(data.current as any);
    expect(component.publishedTheme).toEqual(data.published as any);
    expect(component.activeNodeId).toEqual(pageMock.id);
    expect(treeDataSetSpy).toHaveBeenCalledWith([{
      name: pageMock.name,
      id: pageMock.id,
      data: {
        date: '30/11/2021',
        time: '12:00',
      },
    }]);
    expect(detectSpy).toHaveBeenCalled();
    expect(selectedNextSpy).toHaveBeenCalledWith(pageMock.id);

  });

  it('should handle ng destroy', () => {

    const config: any = { test: 'config' };
    const spies = [
      spyOn(component[`destroy$`], 'next'),
      spyOn(component[`destroy$`], 'complete'),
    ];
    const storageGetSpy = spyOn(localStorage, 'getItem').and.returnValue(null);

    /**
     * component.headerConfig is null
     * localStorage.getItem returns null
     */
    component[`headerConfig`] = null;
    component.ngOnDestroy();

    expect(platformHeader.setConfig).not.toHaveBeenCalled();
    spies.forEach(spy => expect(spy).toHaveBeenCalled());
    expect(storageGetSpy).toHaveBeenCalledWith('PEB_EDITOR_STATE_SCALE');

    /**
     * component.headerConfig is set
     * localStorage.getItem returns mocked data
     */
    storageGetSpy.and.returnValue('2');

    component[`headerConfig`] = config;
    component.ngOnDestroy();

    expect(platformHeader.setConfig).toHaveBeenCalledWith(config);

  });

  it('should handle page select', () => {

    const pageMock = { id: 'p-001' };
    const event = {
      stopPropagation: jasmine.createSpy('stopPropagation'),
    };
    const selectedNextSpy = spyOn(component.selectedVersion$, 'next');

    component.onSelectPage(pageMock as any, event as any);

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(component.activeNodeId).toEqual(pageMock.id);
    expect(router.navigate).toHaveBeenCalledWith([], {
      relativeTo: route as any,
      queryParams: { pageId: pageMock.id },
    });
    expect(selectedNextSpy).toHaveBeenCalledWith(pageMock.id);

  });

  it('should get active node', () => {

    const node: any = { id: 'p-001' };

    component.activeNodeId = node.id;
    expect(component.getActiveNode(null)).toBe(false);
    expect(component.getActiveNode(node)).toBe(true);

  });

  it('should handle edit', () => {

    const logSpy = spyOn(console, 'log');
    const node: any = { id: 'node-001' };

    component.onEdit(node);

    expect(logSpy).toHaveBeenCalledWith('Edit theme', node);

  });

  it('should handle full screen change', fakeAsync(() => {

    const screenNextSpy = spyOn(component.screenChanging$, 'next');
    const toggleSpy = spyOn(component, 'onToggleSidebar');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const dispatchEventSpy = spyOn(document, 'dispatchEvent').and.callThrough();
    const elements = {
      draft: { nativeElement: document.createElement('div') },
      current: { nativeElement: document.createElement('div') },
    };

    /**
     * argument index is null
     */
    component.fullscreens = [false, true];
    component.draftPreview = elements.draft;
    component.currentVersionPreview = elements.current;
    component.onFullscreenChange(null);

    tick(450);

    expect(screenNextSpy.calls.allArgs()).toEqual([[true], [false]]);
    expect(toggleSpy).toHaveBeenCalledOnceWith(true);
    expect(renderer.setStyle).toHaveBeenCalledWith(elements.current.nativeElement, 'display', 'none');
    expect(detectSpy).toHaveBeenCalled();
    expect(dispatchEventSpy).toHaveBeenCalledWith(new KeyboardEvent('keydown', { key: 'ctrl' }));

    /**
     * argument index is 1
     */
    toggleSpy.calls.reset();
    renderer.setStyle.calls.reset();

    component.onFullscreenChange(1);

    tick(450);

    expect(toggleSpy).toHaveBeenCalledOnceWith(false);
    expect(renderer.setStyle).toHaveBeenCalledWith(elements.draft.nativeElement, 'display', 'flex');

  }));

  it('should handle sidebar toggle', fakeAsync(() => {

    const screenNextSpy = spyOn(component.screenChanging$, 'next');

    spyOnProperty(window, 'innerWidth').and.returnValue(1200);

    /**
     * argument close is undefined as default
     */
    component.onToggleSidebar();

    expect(screenNextSpy).toHaveBeenCalledOnceWith(true);
    expect(component.isSidebarClosed).toBe(true);

    tick(400);

    expect(screenNextSpy.calls.allArgs()).toEqual([[true], [false]]);

    /**
     * argument close is TRUE
     */
    component.isSidebarClosed = false;
    component.onToggleSidebar(true);

    tick(400);

    expect(component.isSidebarClosed).toBe(true);

  }));

  it('should check is active node', () => {

    const node: any = { id: 'p-001' };

    component.activeNodeId = node.id;
    expect(component.isActiveNode(node)).toBe(true);

  });

  it('should handle back', () => {

    component.onBack();

    expect(dialogRef.close).toHaveBeenCalledWith(null);

  });

  it('should handle view', () => {

    const menuTrigger = {
      openMenu: jasmine.createSpy('openMenu'),
    };
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const config = { test: 'config' };

    platformHeader[`config` as any] = config;

    component.menuTrigger = menuTrigger as any;
    component.onView(PebScreen.Tablet);

    expect(platformHeader.assignConfig).toHaveBeenCalled();
    expect(component.screen).toEqual(PebScreen.Tablet);
    expect(detectSpy).toHaveBeenCalled();

    // left section items
    const leftSectionItems = platformHeader.assignConfig.calls.first().args[0].leftSectionItems;
    expect(leftSectionItems.length).toBe(1);
    expect(omit(leftSectionItems[0], 'onClick')).toEqual({
      title: 'Tablet',
      class: 'dialog-btn screen-btn',
    });

    leftSectionItems[0].onClick();
    expect(menuTrigger.openMenu).toHaveBeenCalled();

  });

});
