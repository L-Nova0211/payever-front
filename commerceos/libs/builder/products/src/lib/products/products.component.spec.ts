import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { omit } from 'lodash';
import { EMPTY, of, throwError } from 'rxjs';
import { count, skip, take } from 'rxjs/operators';

import { PebContextApi } from '@pe/builder-context';
import { PebFilterConditionType } from '@pe/builder-core';
import { PE_ENV } from '@pe/common';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PebProductsComponent } from './products.component';

describe('PebProductsComponent', () => {

  let fixture: ComponentFixture<PebProductsComponent>;
  let component: PebProductsComponent;
  let platformHeader: jasmine.SpyObj<PePlatformHeaderService>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<any>>;
  let contextApi: jasmine.SpyObj<PebContextApi>;

  const data = {
    productsIntegration: { id: 'i-001' },
    productsIntegrationAction: { url: 'prod/integration/action' },
    productsCollectionIntegrationAction: { url: 'prod/collection/integration/action' },
  };

  beforeEach(waitForAsync(() => {

    const dialogRefSpy = jasmine.createSpyObj<MatDialogRef<any>>('MatDialogRef', ['close']);

    const platformHeaderSpy = jasmine.createSpyObj<PePlatformHeaderService>('PePlatformHeaderService', [
      'setConfig',
    ]);

    const contextApiSpy = jasmine.createSpyObj<PebContextApi>('PebContextApi', {
      fetchIntegrationAction: EMPTY,
    });

    TestBed.configureTestingModule({
      declarations: [PebProductsComponent],
      providers: [
        FormBuilder,
        { provide: MAT_DIALOG_DATA, useValue: data },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: PePlatformHeaderService, useValue: platformHeaderSpy },
        { provide: PebContextApi, useValue: contextApiSpy },
        { provide: PE_ENV, useValue: null },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebProductsComponent);
      component = fixture.componentInstance;

      platformHeader = TestBed.inject(PePlatformHeaderService) as jasmine.SpyObj<PePlatformHeaderService>;
      dialogRef = TestBed.inject(MatDialogRef) as jasmine.SpyObj<MatDialogRef<any>>;
      contextApi = TestBed.inject(PebContextApi) as jasmine.SpyObj<PebContextApi>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

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

  it('should handle callbacks of sort by actions', () => {

    const logSpy = spyOn(console, 'log');

    // sort by name
    const sortByName = component.sortByActions
      .find(action => action.label === 'Name').callback;

    sortByName();

    expect(logSpy).toHaveBeenCalledWith('sort by name');

    // sort by price: asc
    const sortByPriceAsc = component.sortByActions
      .find(action => action.label === 'Price: Ascending').callback;

    sortByPriceAsc();

    expect(logSpy).toHaveBeenCalledWith('sort by price: asc');

    // sort by price: desc
    const sortByPriceDesc = component.sortByActions
      .find(action => action.label === 'Price: Descending').callback;

    sortByPriceDesc();

    expect(logSpy).toHaveBeenCalledWith('sort by price des');

    // sort by date
    const sortByDate = component.sortByActions
      .find(action => action.label === 'Date').callback;

    sortByDate();

    expect(logSpy).toHaveBeenCalledWith('sort by date');

  });

  it('should handle callback of single selected action', () => {

    component.singleSelectedAction.callback('test');

    expect(dialogRef.close).toHaveBeenCalledWith(['test']);

  });

  it('should handle callback of all products action', () => {

    component.allProductsAction.callback();

    expect(dialogRef.close).toHaveBeenCalledWith([]);

  });

  it('should handle callback of open collection action', () => {

    const nextSpy = spyOn(component.collectionRefresh$, 'next');
    const item = { id: 'test', name: 'Test' };

    /**
     * component.collectionsTreeDataArraySubject.value is []
     */
    component.openCollectionAction.callback('test');

    expect(component.formGroup.value.collectionsTree).toEqual([]);
    expect(nextSpy).toHaveBeenCalledWith(true);

    /**
     * component.collectionsTreeDataArraySubject.value is set
     */
    component[`collectionsTreeDataArraySubject`].next([item]);
    component.openCollectionAction.callback('test');

    expect(component.formGroup.value.collectionsTree).toEqual([item]);

  });

  it('should get filtered collections grid items', () => {

    const gridItems = [
      {
        id: 'gi-001',
        selected: false,
        data: {
          parent: 'cln-001',
        },
      },
      {
        id: 'gi-002',
        selected: false,
        data: {
          parent: null,
        },
      },
    ];

    component.collectionsGridItems$.pipe(skip(1)).subscribe(items => expect(items).toEqual(gridItems));
    component.filteredCollectionsGridItems$.pipe(
      take(5),
      count((value, index) => {
        switch (index) {
          case 0:
            expect(value).toEqual([]);
            break;
          case 1:
          case 2:
          case 3:
            expect(value).toEqual([gridItems[1]]);
            break;
          case 4:
            expect(value).toEqual([gridItems[0]]);
            break;
        }

        return true;
      }),
    ).subscribe(calls => expect(calls).toBe(5));

    /**
     * emit component.collectionsGridItemsSubject with mocked grid items
     */
    component[`collectionsGridItemsSubject`].next(gridItems);

    /**
     * component.formGroup.value.collectionsTree is null
     */
    component.formGroup.patchValue({
      collectionsTree: null,
    });

    /**
     * component.formGroup.value.collectionsTree is [null]
     */
    component.formGroup.patchValue({
      collectionsTree: [null],
    });

    /**
     * component.formGroup.value.collectionsTree is mocked
     */
    component.formGroup.patchValue({
      collectionsTree: [{ id: 'cln-001' }],
    });

  });

  it('should get collections tree data', () => {

    const tree = [{ id: 'test', name: 'Test' }];

    component.collectionsTreeData$.pipe(skip(1)).subscribe(data => expect(data).toEqual(tree));
    expect(component.collectionsTreeData).toEqual([]);

    component[`collectionsTreeDataSubject`].next(tree);
    expect(component.collectionsTreeData).toEqual(tree);

  });

  it('should handle click on sidebar footer data menu items', () => {

    expect(component.sidebarFooterData.headItem.title).toEqual('Folder Name');

    // rename
    let menuItem = component.sidebarFooterData.menuItems.find(i => i.title === 'Rename');
    menuItem.onClick();

    expect().nothing();

    // move
    menuItem = component.sidebarFooterData.menuItems.find(i => i.title === 'Move');
    menuItem.onClick();

    expect().nothing();

    // settings
    menuItem = component.sidebarFooterData.menuItems.find(i => i.title === 'Settings');
    menuItem.onClick();

    expect().nothing();

    // add new album
    menuItem = component.sidebarFooterData.menuItems.find(i => i.title === 'Add New Album');
    menuItem.onClick();

    expect().nothing();

    // delete
    menuItem = component.sidebarFooterData.menuItems.find(i => i.title === 'Delete');
    menuItem.onClick();

    expect().nothing();

  });

  it('should handle ng init', () => {

    const createHeaderSpy = spyOn<any>(component, 'createHeader');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    const fetchProductsSpy = spyOn(component, 'fetchProducts');
    const fetchCollectionsSpy = spyOn(component, 'fetchCollections');
    const nextSpies = {
      products: spyOn(component[`productsSubject$`], 'next').and.callThrough(),
      collections: spyOn(component[`collectionsSubject`], 'next').and.callThrough(),
      collectionsTreeDataArray: spyOn(component[`collectionsTreeDataArraySubject`], 'next'),
      collectionsTreeData: spyOn(component[`collectionsTreeDataSubject`], 'next'),
      collectionsGridItems: spyOn(component[`collectionsGridItemsSubject`], 'next'),
      gridItems: spyOn(component[`dataGridItemsSubject$`], 'next'),
    };
    const products = [
      {
        id: 'prod-001',
        title: 'Product 1',
        imagesUrl: null,
        currency: 'EUR',
        price: 1099,
      },
      {
        id: 'prod-002',
        title: 'Product 2',
        imagesUrl: ['prod-002.jpg'],
        currency: 'USD',
        price: 300,
      },
    ];
    const collections = [
      {
        id: 'col-001',
        name: 'Collection 1',
        parent: null,
        image: null,
      },
      {
        id: 'col-002',
        name: 'Collection 2',
        parent: 'col-001',
        image: ['col-002.jpg'],
      },
    ];

    spyOnProperty(component, 'selected').and.returnValue(['prod-001']);

    /**
     * component.formGroup.value.collectionsTree is null
     * component.fetchProducts & fetchCollections throw error
     * component.env is null
     */
    fetchProductsSpy.and.returnValue(throwError('test error'));
    fetchCollectionsSpy.and.returnValue(throwError('test error'));

    component.formGroup.patchValue({
      collectionsTree: null,
    });
    component.ngOnInit();

    expect(createHeaderSpy).toHaveBeenCalled();
    expect(detectSpy).toHaveBeenCalled();
    expect(nextSpies.products.calls.allArgs()).toEqual(Array(2).fill([[]]));
    expect(fetchProductsSpy).toHaveBeenCalledWith({ filter: [] });
    expect(fetchCollectionsSpy).toHaveBeenCalled();
    expect(nextSpies.collections).toHaveBeenCalledWith([]);
    expect(nextSpies.collectionsTreeDataArray).not.toHaveBeenCalled();
    expect(nextSpies.collectionsTreeData).not.toHaveBeenCalled();
    expect(nextSpies.collectionsGridItems).not.toHaveBeenCalled();
    expect(nextSpies.gridItems).toHaveBeenCalledOnceWith([]);

    /**
     * component.formGroup.value.collectionsTree is set
     * component.fetchProducts & fetchCollections return mocked data
     */
    fetchProductsSpy.calls.reset();
    fetchProductsSpy.and.returnValue(of(products) as any)
    fetchCollectionsSpy.and.returnValue(of(collections) as any);
    Object.values(nextSpies).forEach(spy => spy.calls.reset());

    component.formGroup.patchValue({
      collectionsTree: collections,
    });
    component.ngOnInit();

    expect(nextSpies.products).toHaveBeenCalledWith([]);
    expect(fetchProductsSpy).toHaveBeenCalledWith({
      filter: [{
        field: 'collections',
        fieldCondition: PebFilterConditionType.In,
        value: collections.map(c => c.id),
      }],
    });
    expect(nextSpies.products).toHaveBeenCalledWith(products as any);
    expect(nextSpies.collections).toHaveBeenCalledWith(collections as any);
    expect(nextSpies.collectionsTreeDataArray).toHaveBeenCalledWith(collections.map(collection => ({
      id: collection.id,
      name: collection.name,
      parentId: collection.parent,
      image: collection.image ? `undefined/products/${collection.image}` : '/assets/shapes/album.svg',
      data: collection,
      children: collection.id === 'col-001'
        ? [nextSpies.collectionsTreeDataArray.calls.mostRecent().args[0][1]] // second mapped collection
        : [],
    })));
    expect(nextSpies.collectionsTreeData)
      .toHaveBeenCalledWith([nextSpies.collectionsTreeDataArray.calls.mostRecent().args[0][0]]);
    expect(nextSpies.collectionsGridItems).toHaveBeenCalledWith(collections.map(collection => ({
      id: collection.id,
      title: collection.name,
      data: collection,
      image: collection.image ? `undefined/products/${collection.image}` : null,
      actions: [component.openCollectionAction],
    })));
    expect(nextSpies.gridItems).toHaveBeenCalledWith(products.map(product => ({
      id: product.id,
      title: product.title,
      image: product.imagesUrl?.length ? product.imagesUrl[0] : '',
      subtitle: `${product.currency} ${product.price}`,
      description: 'In Stock',
      data: product,
      selected: product.id === 'prod-001' ? true : false,
      actions: [component.singleSelectedAction],
    })));

    /**
     * component.env.custom is null
     */
    component[`env`] = { custom: null } as any;
    component.ngOnInit();

    expect(nextSpies.collectionsTreeDataArray.calls.mostRecent().args[0][1].image)
      .toEqual(`undefined/products/${collections[1].image}`);
    expect(nextSpies.collectionsGridItems.calls.mostRecent().args[0][1].image)
      .toEqual(`undefined/products/${collections[1].image}`);

    /**
     * component.env.custom.storage is set
     */
    component[`env`].custom = { storage: 'c-storage' } as any;
    component.ngOnInit();

    expect(nextSpies.collectionsTreeDataArray.calls.mostRecent().args[0][1].image)
      .toEqual(`c-storage/products/${collections[1].image}`);
    expect(nextSpies.collectionsGridItems.calls.mostRecent().args[0][1].image)
      .toEqual(`c-storage/products/${collections[1].image}`);

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

  it('should fetch products', () => {

    const products: any[] = [
      { id: 'prod-001' },
      { id: 'prod-002' },
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

    contextApi.fetchIntegrationAction.and.returnValue(of({ result: products }));

    /**
     * argument is {} as default
     */
    component.fetchProducts().subscribe(result => expect(result).toEqual(products));

    expect(contextApi.fetchIntegrationAction).toHaveBeenCalledWith({
      filter: [],
      order: [],
      pagination: {
        offset: 0,
        limit: 100,
      },
      integration: data.productsIntegration,
      action: data.productsIntegrationAction,
    } as any);

    /**
     * argument is set
     */
    component.fetchProducts(args as any).subscribe(result => expect(result).toEqual(products));

    expect(contextApi.fetchIntegrationAction).toHaveBeenCalledWith({
      ...args,
      pagination: {
        offset: 20,
        limit: 100,
      },
      integration: data.productsIntegration,
      action: data.productsIntegrationAction,
    } as any);

  });

  it('should fetch collections', () => {

    const products: any[] = [
      { id: 'prod-001' },
      { id: 'prod-002' },
    ];

    contextApi.fetchIntegrationAction.and.returnValue(of({ result: products }));

    component.fetchCollections().subscribe(result => expect(result).toEqual(products));

    expect(contextApi.fetchIntegrationAction).toHaveBeenCalledWith({
      filter: [],
      order: [],
      pagination: {},
      integration: data.productsIntegration,
      action: data.productsCollectionIntegrationAction,
    } as any);

  });

  it('should reset collections tree', () => {

    const setSpy = spyOn(component.formGroup.get('collectionsTree'), 'setValue');

    component.resetCollectionsTree();

    expect(setSpy).toHaveBeenCalledWith([]);

  });

  it('should handle selected item changes', () => {

    const setSpy = spyOnProperty(component, 'selected', 'set');

    component.onSelectedItemsChanged(['test']);

    expect(setSpy).toHaveBeenCalledWith(['test']);

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

  it('should do nothing on search changed', () => {

    component.onSearchChanged(null);

    expect().nothing();

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
