import { SimpleChange } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import {
  PebEditorState,
  PebElementType,
  PebPageType,
  PebPageVariant,
  PebScreen,
} from '@pe/builder-core';
import { PagePreviewService, PebEditorStore } from '@pe/builder-editor';
import { PebDeviceService } from '@pe/common';
import { of, Subject } from 'rxjs';
import { PageListComponent } from './page-list.component';

describe('PageListComponent', () => {

  let fixture: ComponentFixture<PageListComponent>;
  let component: PageListComponent;
  let editorStore: jasmine.SpyObj<PebEditorStore>;
  let deviceService: { isMobile: boolean; };
  let previewService: jasmine.SpyObj<PagePreviewService>;

  beforeEach(waitForAsync(() => {

    deviceService = { isMobile: false };

    const stateMock = {
      screen$: of(PebScreen.Desktop),
    };

    const storeSpy = jasmine.createSpyObj<PebEditorStore>('PebEditorStore', ['updatePage'], {
      pages: {
        'page-001': {
          id: 'page-001',
          name: 'Page1',
          type: PebPageType.Replica,
          variant: PebPageVariant.Default,
          master: null,
          data: {},
          templateId: 'template-001',
          stylesheetIds: Object.values(PebScreen).reduce(
            (acc, screen) => ({ ...acc, [screen]: `stylesheet-${screen}-001` }),
            {},
          ) as any,
          contextId: 'context-001',
          stylesheets: Object.values(PebScreen).reduce(
            (acc, screen) => {
              return { ...acc, [screen]: { display: 'none' } };
            },
            {},
          ),
          template: {
            id: 'template-001',
            children: [],
            type: PebElementType.Document,
          },
          context: {},
        },
        'page-002': {
          id: 'page-002',
          name: 'PageShort',
          type: PebPageType.Replica,
          variant: PebPageVariant.Default,
          master: null,
          data: {},
          templateId: 'template-001',
          stylesheetIds: Object.values(PebScreen).reduce(
            (acc, screen) => ({ ...acc, [screen]: `stylesheet-${screen}-001` }),
            {},
          ) as any,
          contextId: 'context-001',
        },
      },
    });

    const previewServiceMock = { previewSavedSubject$: new Subject() };

    TestBed.configureTestingModule({
      declarations: [PageListComponent],
      providers: [
        { provide: PebEditorState, useValue: stateMock },
        { provide: PebEditorStore, useValue: storeSpy },
        { provide: PebDeviceService, useValue: deviceService },
        { provide: PagePreviewService, useValue: previewServiceMock },
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PageListComponent);
      component = fixture.componentInstance;

      editorStore = TestBed.inject(PebEditorStore) as jasmine.SpyObj<PebEditorStore>;
      previewService = TestBed.inject(PagePreviewService) as jasmine.SpyObj<PagePreviewService>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should handle ng init', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const pageSnapshot: any = { id: 'p-001', name: 'Page 1' };

    component.activePageSnapshot = pageSnapshot;
    component.ngOnInit();

    expect(component.pagesDict).toEqual({});
    expect(detectSpy).not.toHaveBeenCalled();

    previewService.previewSavedSubject$.next();

    expect(component.pagesDict[pageSnapshot.id]).toEqual(pageSnapshot);
    expect(detectSpy).toHaveBeenCalled();

  });

  it('should handle ng changes', () => {

    const snapshot = { id: 'p-001', name: 'Page 1' };
    const changes = {
      activePageSnapshot: new SimpleChange(null, null, true),
    };

    /**
     * argument changes is {}
     */
    component.ngOnChanges({});

    expect(component.pagesDict).toEqual({});

    /**
     * changes.activePageSnapshot.currentValue is null
     */
    component.ngOnChanges(changes);

    expect(component.pagesDict).toEqual({ ['undefined']: null });

    /**
     * changes.activePageSnapshot.currentValue is set
     */
    changes.activePageSnapshot.currentValue = snapshot;

    component.ngOnChanges(changes);

    expect(component.pagesDict[snapshot.id]).toEqual(snapshot);

  });

  it('should track by page', () => {

    const page = { id: 'p-001' };

    // w/o page
    expect(component.trackByPage(null, null)).toBeUndefined();

    // w/ page
    expect(component.trackByPage(null, page)).toEqual(page.id);

  });

  it('should get screen$', () => {

    component.screen$.subscribe(screen => expect(screen).toEqual(PebScreen.Desktop));

  });

  it('should activate page on select', () => {

    const emitSpy = spyOn(component.execCommand, 'emit');
    const page = { id: 'p-001' };

    component.onSelect(page as any);

    expect(emitSpy).toHaveBeenCalledWith({ type: 'activatePage', params: page });

  });

  it('should get page snapshot', () => {

    const pageSnapshot: any = { id: 'p-001', name: 'Test 1' };

    // argument pageId is NOT equal to component.activePageSnapshot.id
    component.activePageSnapshot = pageSnapshot;
    expect(component.getPageSnapshot('p-002')).toBeNull();

    // argument pageId is equal to component.activePageSnapshot.id
    expect(component.getPageSnapshot('p-001')).toEqual(pageSnapshot);

  });

  it('should get child pages', () => {

    const pages = [
      { id: 'p-001', parentId: null },
      { id: 'p-002', parentId: 'p-001' },
    ];
    const page = pages[0];

    component.totalPages = pages as any;
    expect(component.getChildPages(page as any)).toEqual([pages[1]] as any);

  });

  it('should open context menu and its _ version', () => {

    const event = new MouseEvent('click');
    const page = { id: 'page-001' };
    const emitSpy = spyOn(component.openMenu, 'emit');

    component.openContextMenu(event, page as any);
    expect(emitSpy).toHaveBeenCalledWith([event, page]);

    component._openContextMenu(event);
    expect(emitSpy).toHaveBeenCalledWith(event);

  });

  it('should get page', () => {

    component.pagesDict['page-001'] = editorStore.pages['page-001'];
    expect(component.getPage('page-002')).toBeNull();
    expect(component.getPage('page-001')).toEqual(editorStore.pages['page-001']);

  });

  it('should execute action command', () => {

    const event = { test: true };
    const emitSpy = spyOn(component.execCommand, 'emit');

    component.actionCommand(event);

    expect(emitSpy).toHaveBeenCalledWith(event);

  });

  it('should get preview class name', () => {

    const page = { id: 'p-002', parentId: null };

    // w/o parentId
    expect(component.getPreviewClassName(page as any)).toEqual('page__preview');

    // w/ parentId
    page.parentId = 'p-001';

    expect(component.getPreviewClassName(page as any)).toEqual('page__preview_child');

  });

  it('should get page name class name', () => {

    const page = { id: 'p-002', parentId: null };

    // w/o parentId
    expect(component.getPageNameClassName(page as any)).toEqual('page__name');

    // w/ parentId
    page.parentId = 'p-001';

    expect(component.getPageNameClassName(page as any)).toEqual('page__name_child');

  });

  it('should get skip class name', () => {

    const page = { id: 'p-002', parentId: null };

    // w/o parentId
    expect(component.getSkipClassName(page as any)).toEqual('skip-container');

    // w/ parentId
    page.parentId = 'p-001';

    expect(component.getSkipClassName(page as any)).toEqual('skip-container-child');

  });

  it('should handle drag moved', () => {

    const event = {
      distance: { x: 10 },
    };

    component.dragPlaceHolder = undefined;

    // distance.x < insertGroupDragX
    component.dragMoved(event as any);
    expect(component.dragPlaceHolder).toEqual('page-box-placeholder');

    // distance.x > insertGroupDragX
    event.distance.x = 30;

    component.dragMoved(event as any);
    expect(component.dragPlaceHolder).toEqual('page-box-child-placeholder');

  });

  it('should check has childs', () => {

    const page = { id: 'p-001' };
    const spy = spyOn(component, 'getChildPages');

    // children = undefined
    expect(component.hasChild(page as any)).toBe(false);
    expect(spy).toHaveBeenCalledWith(page as any);

    // children.length > 0
    spy.and.returnValue([{}, {}] as any);

    expect(component.hasChild(page as any)).toBe(true);

  });

  it('should show expand arrow', () => {

    const page = { id: 'p-001', expand: false };
    const spy = spyOn(component, 'hasChild');

    // w/o children
    expect(component.showExpandArrow(page as any)).toEqual('expand-arrow-hide');

    // w/ children
    // expand = FALSE
    spy.and.returnValue(true);
    expect(component.showExpandArrow(page as any)).toEqual('collapse-arrow-show');

    // expand = TRUE
    page.expand = true;
    expect(component.showExpandArrow(page as any)).toEqual('expand-arrow-show');

  });

  it('should switch expand collapse', () => {

    const emitSpy = spyOn(component.expandCollapse, 'emit');
    const page = { id: 'p-001', expand: true };

    component.switchExpandCollapse(page as any);

    expect(page.expand).toBe(false);
    expect(emitSpy).toHaveBeenCalledWith(page as any);

  });

  it('should handle dropped', () => {

    const reorderSpy = spyOn(component, 'actionReorderPages');
    const parentSpy = spyOn(component, 'getParentPage');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const emitSpy = spyOn(component.execCommand, 'emit');
    const event = {
      previousIndex: 2,
      currentIndex: 0,
      distance: { x: 10 },
    };
    const pages = Array.from({ length: 3 }, (_, i) => ({ id: `p-00${i + 1}` }));

    component.pages = pages as any;
    component.totalPages = pages as any;

    editorStore.updatePage.and.returnValue(of({ updated: 'page' }) as any);

    // distance.x < insertGroupDragX
    // w/o parentPage
    component.dropped(event as any);

    expect(editorStore.updatePage).not.toHaveBeenCalled();
    expect(reorderSpy).toHaveBeenCalled();

    // distance.x > insertGroupDragX
    // w/o parentPage
    reorderSpy.calls.reset();

    event.distance.x = 30;

    component.dropped(event as any);

    expect(parentSpy).toHaveBeenCalled();
    expect(reorderSpy).toHaveBeenCalled();

    // w/ parentPage
    reorderSpy.calls.reset();
    parentSpy.and.returnValue(pages[0] as any);

    component.dropped(event as any);

    expect(reorderSpy).not.toHaveBeenCalled();
    expect(editorStore.updatePage).toHaveBeenCalledWith(pages[2] as any, { parentId: 'p-001' });
    expect(emitSpy).toHaveBeenCalledWith({ type: 'reorderPages', params: ['p-001', 'p-003', 'p-002'] });
    expect(detectSpy).toHaveBeenCalled();

    // distance.x < insertGroupDragX
    // w/ parentPage
    event.distance.x = 10;

    component.parentPage = pages[0] as any;
    component.dropped(event as any);

    expect(editorStore.updatePage).toHaveBeenCalledWith(pages[2] as any, { parentId: undefined });
    expect(emitSpy).toHaveBeenCalledWith({ type: 'reorderPages', params: [undefined, 'p-001', 'p-002', 'p-003'] });
    expect(detectSpy).toHaveBeenCalledTimes(2);

    // distance.x > insertGroupDragX
    editorStore.updatePage.calls.reset();

    event.distance.x = 30;

    component.dropped(event as any);

    expect(editorStore.updatePage).not.toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith({ type: 'reorderPages', params: ['p-003', 'p-001', undefined, 'p-002'] });

  });

  it('should move item in array', () => {

    function generateArray() {
      return Array.from({ length: 4 }, (_, i) => `p-00${i + 1}`);
    }

    let array = generateArray();

    // newIndex < array.length
    expect(component.array_move(array, 1, 3)).toEqual(['p-001', 'p-003', 'p-004', 'p-002']);

    // newIndex > array.length
    array = generateArray();
    expect(component.array_move(array, 1, 5)).toEqual(['p-001', 'p-003', 'p-004', undefined, undefined, 'p-002']);

  });

  it('should get parent page', () => {

    const event = {
      previousIndex: 2,
      currentIndex: 4,
    };
    const pages = Array.from({ length: 5 }, (_, i) => ({ id: `p-00${i + 1}` }));

    component.pages = pages as any;

    expect(component.getParentPage(event as any)).toEqual(pages[3] as any);

    // previousIndex = currentIndex
    event.currentIndex = 2;
    expect(component.getParentPage(event as any)).toEqual(pages[1] as any);

    // currentIndex = previousIndex + 1
    event.currentIndex = 3;
    expect(component.getParentPage(event as any)).toEqual(pages[3] as any);

  });

  it('should execute command reorder pages', () => {

    const event = {
      previousIndex: 2,
      currentIndex: 0,
    };
    const pages = Array.from({ length: 3 }, (_, i) => ({ id: `p-00${i + 1}` }));;
    const emitSpy = spyOn(component.execCommand, 'emit');
    const spy = spyOn(component, 'getChildPages').and.returnValue([]);

    component.pages = pages as any;
    component.actionReorderPages(event as any);

    expect(spy).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith({ type: 'reorderPages', params: ['p-003', 'p-001', 'p-002'] });

  });

});
