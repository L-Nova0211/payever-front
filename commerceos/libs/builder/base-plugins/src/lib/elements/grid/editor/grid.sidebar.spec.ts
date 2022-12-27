import { ComponentFactoryResolver, NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { BehaviorSubject, of, Subject } from 'rxjs';

import {
  PebEditorState,
  PebElementType,
  PebFunctionType,
  PebGridElementBorderOption,
  PebIntegrationActionTag,
  PebIntegrationTag,
  PebLanguage,
  PebScreen,
} from '@pe/builder-core';
import { PebEditor } from '@pe/builder-main-editor';
import { ImageSize, PebEditorAccessorService, PebEditorSlot } from '@pe/builder-shared';

import { PebEditorGridCellProductSidebarComponent } from './grid-cell-product/grid-cell-product.sidebar';
import { PebEditorGridCellTypeSidebarComponent } from './grid-cell-type/grid-cell-type.sidebar';
import { PebEditorGridSidebarComponent } from './grid.sidebar';

describe('PebEditorGridSidebarComponent', () => {

  let fixture: ComponentFixture<PebEditorGridSidebarComponent>;
  let component: PebEditorGridSidebarComponent;
  let cfr: jasmine.SpyObj<ComponentFactoryResolver>;
  let state: jasmine.SpyObj<PebEditorState>;
  let editorComponent: jasmine.SpyObj<PebEditor>;
  let events: {
    controls: {
      gridAnchorMousedown$: Subject<any>;
    };
    contentContainer: {
      mouseup$: Subject<any>,
    },
  };

  beforeEach(waitForAsync(() => {

    const cfrSpy = jasmine.createSpyObj<ComponentFactoryResolver>('ComponentFactoryResolver', [
      'resolveComponentFactory',
    ]);

    const stateSpy = {
      selectedGridCells: [{ id: 'c-001' }, { id: 'c-002' }],
      selectedGridCells$: of([{ id: 'c-001' }, { id: 'c-002' }]),
    };

    editorComponent = jasmine.createSpyObj<PebEditor>('PebEditor', [
      'insertToSlot',
      'backTo',
      'clearSlot',
    ], {
      state: {
        interactionCompleted$: of(null),
      } as any,
    });

    events = {
      controls: {
        gridAnchorMousedown$: new Subject(),
      },
      contentContainer: {
        mouseup$: new Subject(),
      },
    };

    TestBed.configureTestingModule({
      declarations: [PebEditorGridSidebarComponent],
      providers: [
        FormBuilder,
        { provide: ComponentFactoryResolver, useValue: cfrSpy },
        { provide: PebEditorState, useValue: stateSpy },
        { provide: PebEditorAccessorService, useValue: { editorComponent } },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorGridSidebarComponent);
      component = fixture.componentInstance;
      component.element = {
        id: 'elem',
        type: PebElementType.GridCellCategory,
        data: {},
      };
      component.component = {
        definition: {
          data: {},
        },
        styles: {
          height: 300,
        },
        target: {
          gridRef: null,
          styles: {},
        },
        options: {
          scale: 1,
          screen: PebScreen.Desktop,
          locale: PebLanguage.English,
          interactions: false,
        },
        parent: {
          styles: {
            height: 1200,
          },
        },
      } as any;

      cfr = TestBed.inject(ComponentFactoryResolver) as jasmine.SpyObj<ComponentFactoryResolver>;
      state = TestBed.inject(PebEditorState) as jasmine.SpyObj<PebEditorState>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get is cell element', () => {

    // w/ cells
    component.isCellElement$.subscribe(is => expect(is).toBe(true));

    // w/o cells
    component[`selectedCells$` as any] = of(null);
    component.isCellElement$.subscribe(is => expect(is).toBe(false));

  });

  it('should get show font form', () => {

    const formMock = new FormGroup({
      functionLink: new FormGroup({
        integration: new FormControl(),
        action: new FormControl(),
      }),
    });

    /**
     * component.form.value.functionLink.integration & action are null
     */
    component.form = formMock;
    expect(component.showFontForm).toBe(true);

    /**
     * component.form.value.functionLink.integration.tag is PebIntegrationTag.Products
     */
    formMock.patchValue({
      functionLink: {
        integration: { tag: PebIntegrationTag.Products },
      },
    });
    expect(component.showFontForm).toBe(true);

    /**
     * component.form.value.functionLink.action.tags is null
     */
    formMock.patchValue({
      functionLink: {
        action: { tags: null },
      },
    });
    expect(component.showFontForm).toBe(true);

    /**
     * component.form.value.functionLink.action.tags has PebIntegrationActionTag.GetList tag
     */
    formMock.patchValue({
      functionLink: {
        action: { tags: [PebIntegrationActionTag.GetList] },
      },
    });
    expect(component.showFontForm).toBe(false);

  });

  it('should get editor', () => {

    expect(component[`editor`]).toEqual(editorComponent);

  });

  it('should handle mouse up', () => {

    const formMock = new FormGroup({
      dimensions: new FormGroup({
        width: new FormControl(100),
      }),
    });
    const patchSpy = spyOn(formMock.get('dimensions.width'), 'patchValue');
    const clearSpies = {
      timeout: spyOn(window, 'clearTimeout').and.callThrough(),
      interval: spyOn(window, 'clearInterval').and.callThrough(),
    };

    component.form = formMock;
    component.onMouseup('width');

    expect(patchSpy).toHaveBeenCalledWith(100);
    expect(clearSpies.timeout).toHaveBeenCalledWith(component.timeoutHandler);
    expect(clearSpies.interval).toHaveBeenCalledWith(component.intervalHandler);

  });

  it('should handle mouse down', fakeAsync(() => {

    const formMock = new FormGroup({
      dimensions: new FormGroup({
        width: new FormControl(100),
      }),
    });
    const patchSpy = spyOn(formMock.get('dimensions.width'), 'patchValue').and.callThrough();

    /**
     * argument direct is 'plus'
     */
    component.form = formMock;
    component.onMousedown('width', 'plus');

    tick(600);

    clearTimeout(component.timeoutHandler);
    clearInterval(component.intervalHandler);

    expect(patchSpy.calls.allArgs()).toEqual([
      [101, { emitEvent: false }],
      [102, { emitEvent: false }],
    ]);
    patchSpy.calls.reset();

    /**
     * argument direct is 'minus'
     */
    component.onMousedown('width', 'minus');

    tick(600);

    clearTimeout(component.timeoutHandler);
    clearInterval(component.intervalHandler);

    expect(patchSpy.calls.allArgs()).toEqual([
      [101, { emitEvent: false }],
      [100, { emitEvent: false }],
    ]);

  }));

  it('should get first cell dimensions', () => {

    const cellsMock = [{
      row: 1,
      col: 2,
    }];

    /**
     * component.component.target.gridRef is null
     * component.component.target.styles is { height: 300 }
     * component.component.definition.data is {}
     * component.nativeElement is null
     * argument cells is [] as default
     */
    expect(component.getFirstCellDimensions()).toEqual({
      firstCellHeight: 300,
      firstCellWidth: NaN,
    });

    /**
     * component.component.target.gridRef is set
     * component.component.traget.gridRef.nativeElement.children is null
     */
    component.component.target[`gridRef`] = {
      nativeElement: {
        style: {
          gridTemplateColumns: '300px',
          gridTemplateRows: '200px',
        },
        children: null,
      },
    } as any;
    component.component[`nativeElement` as any] = {
      clientHeight: 500,
    };
    expect(component.getFirstCellDimensions()).toEqual({
      firstCellHeight: 200,
      firstCellWidth: 300,
    });

    /**
     * argument cells is set
     * component.component.traget.gridRef.nativeElement.children is [null]
     */
    component.component.target[`gridRef`].nativeElement.style = {
      gridTemplateColumns: '200px 400px 300px',
      gridTemplateRows: '100px 100px',
    };
    component.component.target[`gridRef`].nativeElement.children = [null];
    expect(component.getFirstCellDimensions(cellsMock as any)).toEqual({
      firstCellHeight: 100,
      firstCellWidth: 300,
    });

    /**
     * component.component.target.gridRef.nativeElement.style is {}
     * component.component.traget.gridRef.nativeElement.children is set
     */
    component.component.target[`gridRef`].nativeElement.style = {};
    component.component.target[`gridRef`].nativeElement.children = [{ clientHeight: 350 }];
    expect(component.getFirstCellDimensions(cellsMock as any)).toEqual({
      firstCellHeight: 350,
      firstCellWidth: NaN,
    });

  });

  it('should set dimensions', () => {

    const dimensions = {
      firstCellHeight: 300,
      firstCellWidth: 500,
    };
    const getSpy = spyOn(component, 'getFirstCellDimensions').and.returnValue(dimensions);
    const formMock = new FormGroup({
      dimensions: new FormGroup({
        width: new FormControl(),
        height: new FormControl(),
      }),
    });
    const patchSpy = spyOn(formMock.get('dimensions'), 'patchValue');

    /**
     * component.form is null
     */
    component.form = null;
    component.setDimensions([]);

    expect(getSpy).toHaveBeenCalledWith([]);

    /**
     * component.form is set
     */
    component.form = formMock;
    component.setDimensions([]);

    expect(patchSpy).toHaveBeenCalledWith({
      width: dimensions.firstCellWidth,
      height: dimensions.firstCellHeight,
    }, { emitEvent: false });

  });

  it('should handle ng init', () => {

    const dimensions = {
      firstCellHeight: 300,
      firstCellWidth: 500,
    };
    const getSpy = spyOn(component, 'getFirstCellDimensions').and.returnValue(dimensions);
    const setDimensionsSpy = spyOn(component, 'setDimensions');
    const setDimensionsLimitsSpy = spyOn(component, 'setDimensionsLimits');
    const gridDataMock = {
      rowCount: 2,
      colCount: 3,
      spacing: 2,
      borderOption: null,
      borderColor: null,
      borderWidth: null,
      functionLink: null,
      fullHeight: null,
      openInOverlay: null,
      imageSize: null,
      imageScale: null,
    };

    /**
     * all props in component.element.data are null except:
     *
     * rowCount
     * colCount
     * spacing
     */
    component.form = null;
    component.element.data = gridDataMock;
    component.ngOnInit();

    expect(component.form).toBeDefined();
    expect(component.form.value).toEqual({
      grid: {
        rowCount: gridDataMock.rowCount,
        colCount: gridDataMock.colCount,
        elType: null,
      },
      spacing: gridDataMock.spacing,
      borderOptions: {
        option: null,
        color: '#000000',
        width: 1,
      },
      functionLink: {
        integration: null,
        action: false,
        actionData: false,
      },
      cellBorderOptions: {
        option: null,
        color: '#000000',
        width: 1,
      },
      dimensions: {
        width: dimensions.firstCellWidth,
        height: dimensions.firstCellHeight,
      },
      fullHeight: false,
      openInOverlay: false,
      image: {
        size: ImageSize.OriginalSize,
        scale: 100,
      },
    });
    expect(getSpy).toHaveBeenCalled();
    expect(setDimensionsLimitsSpy).toHaveBeenCalled();
    expect(editorComponent.backTo).toHaveBeenCalledWith('main');

    /**
     * emit events.controls.gridAnchorMousedown$ & events.contentContainer.mouseup$
     */
    setDimensionsSpy.calls.reset();

    events.controls.gridAnchorMousedown$.next(new MouseEvent('mousedown'));
    events.contentContainer.mouseup$.next(new MouseEvent('mouseup'));

    /**
     * all props in component.element.data are set
     */
    gridDataMock.borderOption = PebGridElementBorderOption.All;
    gridDataMock.borderColor = '#333333';
    gridDataMock.borderWidth = 2;
    gridDataMock.functionLink = {
      functionType: PebFunctionType.Action,
      integration: { test: 'functionLink.integration' },
      action: { test: 'functionLink.action' },
      actionData: { test: 'functionLink.actionData' },
    };
    gridDataMock.fullHeight = true;
    gridDataMock.openInOverlay = true;
    gridDataMock.imageSize = ImageSize.Cover;
    gridDataMock.imageScale = 150;

    component.form = null;
    component.ngOnInit();

    expect(component.form.value).toEqual({
      grid: {
        rowCount: gridDataMock.rowCount,
        colCount: gridDataMock.colCount,
        elType: null,
      },
      spacing: gridDataMock.spacing,
      borderOptions: {
        option: gridDataMock.borderOption,
        color: gridDataMock.borderColor,
        width: gridDataMock.borderWidth,
      },
      functionLink: {
        integration: gridDataMock.functionLink.integration,
        action: gridDataMock.functionLink,
        actionData: gridDataMock.functionLink.actionData,
      },
      cellBorderOptions: {
        option: null,
        color: '#000000',
        width: 1,
      },
      dimensions: {
        width: dimensions.firstCellWidth,
        height: dimensions.firstCellHeight,
      },
      fullHeight: gridDataMock.fullHeight,
      openInOverlay: gridDataMock.openInOverlay,
      image: {
        size: gridDataMock.imageSize,
        scale: gridDataMock.imageScale,
      },
    });

  });

  it('should insert cell sidebar', () => {

    const compRef = {
      instance: null,
      hostView: { host: true },
    };
    const compFactory = {
      create: jasmine.createSpy('create'),
    };
    const tabSidebarSlotMock = {
      clear: jasmine.createSpy('tabSidebarSlot.clear'),
      insert: jasmine.createSpy('tabSidebarSlot.insert'),
    };
    const cellSidebarSlotMock = {
      clear: jasmine.createSpy('cellSidebarSlot.clear'),
      insert: jasmine.createSpy('cellSidebarSlot.insert'),
    };
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    class MockClass { }

    compFactory.create.and.returnValue(compRef);
    cfr.resolveComponentFactory.and.returnValue(compFactory as any);

    /**
     * componentRef.instance is instanceOf MockClass
     * component.cellSidebarSlot is null
     */
    component.cellSidebarSlot = null;
    expect(component.insertCellSidebar(MockClass)).toEqual(compRef as any);
    expect(cfr.resolveComponentFactory).toHaveBeenCalledWith(MockClass);
    expect(compFactory.create).toHaveBeenCalledWith(component[`injector`]);
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * component.cellSidebarSlot is set
     */
    component.cellSidebarSlot = cellSidebarSlotMock as any;
    expect(component.insertCellSidebar(MockClass)).toEqual(compRef as any);

    expect(cellSidebarSlotMock.clear).toHaveBeenCalled();
    expect(cellSidebarSlotMock.insert).toHaveBeenCalledWith(compRef.hostView);

    /**
     * componentRef.instance is instanceOf PebEditorGridCellProductSidebarComponent
     * component.tabSidebarSlot is null
     */
    Object.values(cellSidebarSlotMock).forEach(spy => spy.calls.reset());
    compRef.instance = new PebEditorGridCellProductSidebarComponent(TestBed.inject(FormBuilder));

    component.tabSidebarSlot = null;
    expect(component.insertCellSidebar(PebEditorGridCellProductSidebarComponent)).toEqual(compRef as any);
    expect(cfr.resolveComponentFactory).toHaveBeenCalledWith(PebEditorGridCellProductSidebarComponent);
    expect(detectSpy).toHaveBeenCalled();
    Object.values(cellSidebarSlotMock).forEach(spy => expect(spy).not.toHaveBeenCalled());

    /**
     * component.tabSidebarSlot is set
     */
    component.tabSidebarSlot = tabSidebarSlotMock as any;
    expect(component.insertCellSidebar(PebEditorGridCellProductSidebarComponent)).toEqual(compRef as any);
    expect(tabSidebarSlotMock.clear).toHaveBeenCalled();
    expect(tabSidebarSlotMock.insert).toHaveBeenCalledWith(compRef.hostView);
    Object.values(cellSidebarSlotMock).forEach(spy => expect(spy).not.toHaveBeenCalled());

  });

  it('should handle cell type change', () => {

    const emitSpy = spyOn(component.cellTypeChange, 'emit');
    const sidebarRef = {
      instance: {
        cellTypeChange: new Subject<any>(),
        destroyed$: new Subject<any>(),
      },
    };
    const selectedSubject$ = new BehaviorSubject<any>([]);

    state[`selectedGridCells$` as any] = selectedSubject$;
    editorComponent.insertToSlot.and.returnValue(sidebarRef as any);

    component.cellTypeChangeOn();

    expect(editorComponent.detail).toEqual({ back: 'Back', title: 'Cell type' });
    expect(editorComponent.clearSlot).toHaveBeenCalledWith(PebEditorSlot.sidebarDetail);
    expect(editorComponent.insertToSlot).toHaveBeenCalledWith(
      PebEditorGridCellTypeSidebarComponent,
      PebEditorSlot.sidebarDetail,
    );
    expect(editorComponent.backTo).not.toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();

    /**
     * change cell type
     */
    sidebarRef.instance.cellTypeChange.next(PebElementType.GridCellCategory);

    expect(emitSpy).toHaveBeenCalledWith(PebElementType.GridCellCategory);
    expect(editorComponent.backTo).toHaveBeenCalledWith('main');

    /**
     * emit state.selectedGridCells$
     */
    editorComponent.backTo.calls.reset();

    selectedSubject$.next([{ id: 'c-001' }]);

    expect(editorComponent.backTo).toHaveBeenCalledWith('main');

  });

  it('should check is product grid', () => {

    /**
     * component.component.definition.data is null
     */
    component.component.definition.data = null;
    expect(component.isProductGrid()).toBe(false);

    /**
     * component.component.definition.data.functionLink.integration is null
     */
    component.component.definition.data = {
      functionLink: {
        functionType: PebFunctionType.Action,
        integration: null,
        tags: [],
      },
    } as any;
    expect(component.isProductGrid()).toBe(false);

    /**
     * component.component.definition.data.functionLink.integration.tag is PebIntegrationTag.Products
     */
    component.component.definition.data.functionLink.integration = { tag: PebIntegrationTag.Products } as any;
    expect(component.isProductGrid()).toBe(false);

    /**
     * component.component.definition.data.functionLink.action.tags include PebIntegrationActionTag.GetList
     */
    component.component.definition.data.functionLink[`tags`] = [PebIntegrationActionTag.GetList];
    expect(component.isProductGrid()).toBe(true);

  });

});
