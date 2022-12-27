import { TestBed } from '@angular/core/testing';

import { PebElementContextState, PebFilterParam, PebOrderParams, PebScreen } from '@pe/builder-core';

import { PebClientState, PebClientStateService } from './state.service';

describe('PebClientStateService', () => {

  let service: PebClientStateService;
  let initialState: PebClientState;

  beforeEach(() => {

    initialState = {
      '@cart': {
        state: PebElementContextState.Empty,
        data: null,
      },
      '@search': '',
      '@category': {
        data: {
          sortBy: 'asc',
          shownFilters: true,
          title: '',
          image: '',
          variants: [],
          categories: [],
          activatedFilters: [],
          disabledFilters: [],
          products: [],
        },
        state: PebElementContextState.Ready,
      },
      '@product-filters': {
        state: PebElementContextState.Ready,
        data: [],
      },
      '@product-sort': {
        state: PebElementContextState.Ready,
        data: [],
      },
      '@product-details': {
        state: PebElementContextState.Empty,
        data: null,
      },
      '@mobile-menu': {
        state: PebElementContextState.Ready,
        data: {
          opened: false,
        },
      },
      '@logo': {
        state: PebElementContextState.Empty,
        data: null,
      },
    };

    TestBed.configureTestingModule({
      providers: [
        PebClientStateService,
        { provide: 'USER_AGENT_SCREEN', useValue: PebScreen.Desktop },
        { provide: 'APP', useValue: null },
      ],
    });

    service = TestBed.inject(PebClientStateService);
    service[`stateSubject$`].next(initialState);

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  // it('should patch category data and just patch on construct', () => {
  //
  //   const shop = { picture: 'pic.jpg' };
  //
  //   service = new RootStateService(PebScreen.Mobile, shop);
  //
  //   expect(service.state['@logo']).toEqual({
  //     state: PebElementContextState.Ready,
  //     data: shop.picture,
  //   });
  //   expect(service.state['@category'].data.shownFilters).toBe(false);
  //
  // });

  it('should get state$', () => {

    service.state$.subscribe(state => expect(state).toEqual(initialState));

  });

  it('should set product filters', () => {

    const value: PebFilterParam[] = [
      {
        field: 'id',
        fieldCondition: 'in',
        value: ['1', '2'],
      },
    ];
    const nextSpy = spyOn(service[`stateSubject$`], 'next').and.callThrough();

    service.setProductFilters(value);

    expect(nextSpy).toHaveBeenCalled();
    expect(service.state['@product-filters'].data).toEqual(value);

  });

  it('should set product sort', () => {

    const value: PebOrderParams = [
      {
        field: 'id',
        direction: 'asc',
      },
    ];
    const nextSpy = spyOn(service[`stateSubject$`], 'next').and.callThrough();

    service.setProductSort(value);

    expect(nextSpy).toHaveBeenCalled();
    expect(service.state['@product-sort'].data).toEqual(value);

  });

  it('should patch category', () => {

    const value = {
      data: { title: 'Category 1' },
    };
    const nextSpy = spyOn(service[`stateSubject$`], 'next').and.callThrough();

    service.patchCategory(value as any);

    expect(nextSpy).toHaveBeenCalled();
    expect(service.state['@category']).toEqual({
      ...initialState['@category'],
      ...value,
    } as any);

  });

  it('should patch category data', () => {

    const value = { title: 'Category 1' };
    const nextSpy = spyOn(service[`stateSubject$`], 'next').and.callThrough();

    service.patchCategoryData(value);

    expect(nextSpy).toHaveBeenCalled();
    expect(service.state['@category'].data.title).toEqual(value.title);

  });

  it('should update product state', () => {

    const productId = 'prod-001';
    const state = PebElementContextState.Ready;
    const products = [
      {
        state: PebElementContextState.Error,
        data: {
          id: 'prod-001',
        },
      },
      {
        state: PebElementContextState.Error,
        data: {
          id: 'prod-002',
        },
      },
    ];
    const patchSpy = spyOn(service, 'patchCategoryData');

    // w/o category
    service.state['@category'] = undefined;

    service.updateProductState(productId, state);

    expect(patchSpy).toHaveBeenCalledWith({ products: undefined });

    // w/o category.data
    service.state[`@category`] = {} as any;

    service.updateProductState(productId, state);

    expect(patchSpy).toHaveBeenCalledWith({ products: undefined });

    // w/ products
    service.state['@category'].data = {
      products,
    } as any;

    service.updateProductState(productId, state);

    expect(patchSpy).toHaveBeenCalledWith({
      products: products.map(p => p.data.id === 'prod-001' ? { ...p, state } : p),
    });

  });

});
