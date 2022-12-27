import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { omit } from 'lodash';
import { EMPTY, of, throwError } from 'rxjs';
import { skip } from 'rxjs/operators';

import { PebContextApi } from '@pe/builder-context';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PebProductCategoriesComponent } from './product-categories.component';

describe('PebProductCategoriesComponent', () => {

  let fixture: ComponentFixture<PebProductCategoriesComponent>;
  let component: PebProductCategoriesComponent;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;
  let platformHeader: jasmine.SpyObj<PePlatformHeaderService>;
  let contextApi: jasmine.SpyObj<PebContextApi>;

  const data = {
    selectedCategories: ['category-001'],
    integration: { id: 'i-001' },
    action: { id: 'a-001' },
  };

  beforeEach(waitForAsync(() => {

    const dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    const platformHeaderSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService', [
      'setConfig',
    ]);

    const contextApiSpy = jasmine.createSpyObj<PebContextApi>('PebContextApi', {
      fetchIntegrationAction: EMPTY,
    });

    TestBed.configureTestingModule({
      declarations: [PebProductCategoriesComponent],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: PePlatformHeaderService, useValue: platformHeaderSpy },
        { provide: PebContextApi, useValue: contextApiSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebProductCategoriesComponent);
      component = fixture.componentInstance;

      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<any>>;
      platformHeader = TestBed.inject(PePlatformHeaderService) as jasmine.SpyObj<PePlatformHeaderService>;
      contextApi = TestBed.inject(PebContextApi) as jasmine.SpyObj<PebContextApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get data grid items', () => {

    const gridItems = [
      { id: 'gi-001', selected: false },
      { id: 'gi-002', selected: false },
    ];

    component.dataGridItems$.pipe(skip(1)).subscribe(items => expect(items).toEqual(gridItems));
    expect(component.dataGridItems).toEqual([]);

    component[`dataGridItemsSubject$`].next(gridItems);
    expect(component.dataGridItems).toEqual(gridItems);

  });

  it('should set/get selected', () => {

    const gridItems = [
      { id: 'gi-001', selected: false },
      { id: 'gi-002', selected: false },
    ];
    const getSpy = spyOnProperty(component, 'selected').and.callThrough();

    spyOnProperty(component, 'dataGridItems').and.returnValue(gridItems);

    component.selected = ['gi-002'];

    expect(gridItems[1].selected).toBe(true);
    expect(component.selected).toEqual(['gi-002']);
    expect(getSpy).toHaveBeenCalled();

  });

  it('should handle callbacks of multiple selected actions', () => {

    const gridItems = [
      { id: 'gi-001', selected: false },
      { id: 'gi-002', selected: false },
    ];
    const setSpy = spyOnProperty(component, 'selected', 'set');
    const closeSpy = spyOn(component, 'onClose');

    spyOnProperty(component, 'dataGridItems').and.returnValue(gridItems);

    // select all
    let action = component.multipleSelectedActions.find(a => a.label === 'Select all');
    action.callback();

    expect(setSpy).toHaveBeenCalledWith(gridItems.map(gi => gi.id));
    expect(closeSpy).not.toHaveBeenCalled();

    // deselect all
    setSpy.calls.reset();
    action = component.multipleSelectedActions.find(a => a.label === 'Deselect all');
    action.callback();

    expect(setSpy).toHaveBeenCalledWith([]);
    expect(closeSpy).not.toHaveBeenCalled();

    // add to collection
    action = component.multipleSelectedActions.find(a => a.label === 'Add to Collection');
    action.callback();

    expect(closeSpy).toHaveBeenCalledWith(true);

    // close
    action = component.multipleSelectedActions.find(a => a.label === 'Close');
    action.callback();

    expect(closeSpy).toHaveBeenCalledWith(false);

  });

  it('should handle callback of single selected action', () => {

    component.singleSelectedAction.callback('test');

    expect(dialogRef.close).toHaveBeenCalledWith(['test']);

  });

  it('should handle callback of all categories action', () => {

    component.allCategoriesAction.callback();

    expect(dialogRef.close).toHaveBeenCalledWith([]);

  });

  it('should handle ng init', () => {

    const createHeaderSpy = spyOn<any>(component, 'createHeader');
    const fetchSpy = spyOn<any>(component, 'fetchCategories');
    const categories = [
      { id: 'category-001', name: 'Category 1' },
      { id: 'category-002', name: 'Category 2' },
    ];
    const categoriesNextSpy = spyOn(component[`categoriesSubject$`], 'next').and.callThrough();
    const dataGridNextSpy = spyOn(component[`dataGridItemsSubject$`], 'next');

    spyOnProperty(component, 'selected').and.returnValue(['category-002']);

    /**
     * component.fetchCategories throws error
     */
    fetchSpy.and.returnValue(throwError('test error'));

    component.ngOnInit();

    expect(createHeaderSpy).toHaveBeenCalled();
    expect(fetchSpy).toHaveBeenCalled();
    expect(categoriesNextSpy).toHaveBeenCalledWith([]);
    expect(dataGridNextSpy).toHaveBeenCalledWith([]);

    /**
     * component.fetchCategories returns mocked data
     */
    fetchSpy.and.returnValue(of(categories));

    component.ngOnInit();

    expect(categoriesNextSpy).toHaveBeenCalledWith(categories);
    expect(dataGridNextSpy).toHaveBeenCalledWith(categories.map(category => ({
      id: category.id,
      title: category.name,
      data: category,
      selected: category.id === 'category-002' ? true : false,
      actions: [component.singleSelectedAction],
    })));

  });

  it('should handle ng destroy', () => {

    const config: any = { test: 'config' };
    const spies = [
      spyOn(component[`destroyed$`], 'next'),
      spyOn(component[`destroyed$`], 'complete'),
    ];

    /**
     * component.headerConfig is null
     */
    component[`headerConfig`] = null;
    component.ngOnDestroy();

    expect(platformHeader.setConfig).not.toHaveBeenCalled();
    spies.forEach(spy => expect(spy).toHaveBeenCalled());

    /**
     * component.headerConfig is set
     */
    component[`headerConfig`] = config;
    component.ngOnDestroy();

    expect(platformHeader.setConfig).toHaveBeenCalledWith(config);

  });

  it('should create header', () => {

    const config: any = { test: 'config' };

    platformHeader[`config` as any] = config;

    component[`headerConfig`] = null;
    component[`createHeader`]();

    expect(component[`headerConfig`]).toEqual(config);
    const setConfig = platformHeader.setConfig.calls.first().args[0];
    expect(omit(setConfig, 'closeItem')).toEqual({
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: true,
      mainItem: null,
      isShowMainItem: false,
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
    expect(setConfig.closeItem.title).toEqual('Close');
    expect(dialogRef.close).not.toHaveBeenCalled();

    setConfig.closeItem.onClick();
    expect(dialogRef.close).toHaveBeenCalledWith(null);

  });

  it('should fetch categories', () => {

    const categories: any[] = [
      { id: 'category-001' },
      { id: 'category-002' },
    ];
    const args = {
      filter: [{
        field: 'filter.field',
        value: 'filter.value',
      }],
      order: [{
        field: 'order.field',
        direction: 'order.direction',
      }],
      pagination: {
        offset: 20,
      },
    };

    contextApi.fetchIntegrationAction.and.returnValue(of({ result: categories }));

    /**
     * argument is {} as default
     */
    component[`fetchCategories`]().subscribe(result => expect(result).toEqual(categories));

    expect(contextApi.fetchIntegrationAction).toHaveBeenCalledWith({
      filter: [],
      order: [],
      pagination: {
        offset: 0,
        limit: 100,
      },
      integration: data.integration,
      action: data.action,
    } as any);

    /**
     * argument is set
     */
    component[`fetchCategories`](args as any).subscribe(result => expect(result).toEqual(categories));

    expect(contextApi.fetchIntegrationAction).toHaveBeenCalledWith({
      ...args,
      pagination: {
        offset: 20,
        limit: 100,
      },
      integration: data.integration,
      action: data.action,
    } as any);

  });

  it('should do nothing on search changed', () => {

    component.onSearchChanged(null);

    expect().nothing();

  });

  it('should handle selected item changes', () => {

    const setSpy = spyOnProperty(component, 'selected', 'set');

    component.onSelectedItemsChanged(['test']);

    expect(setSpy).toHaveBeenCalledWith(['test']);

  });

  it('should handle close', () => {

    spyOnProperty(component, 'selected').and.returnValue(['test']);

    /**
     * argument save is FALSE
     */
    component.onClose(false);

    expect(dialogRef.close).toHaveBeenCalledWith(null);

    /**
     * argument save is TRUE
     */
    component.onClose(true);

    expect(dialogRef.close).toHaveBeenCalledWith(['test']);

  });

});
