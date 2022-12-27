import { TestBed } from '@angular/core/testing';
import { BehaviorSubject } from 'rxjs';
import { RootState, RootStateService } from 'src/app/root/root.state';

import { PebElementContextState } from '@pe/builder-core';

import { CartService } from './cart.service';


describe('CartService', () => {

  let service: CartService;
  let stateSubject: BehaviorSubject<RootState>;
  let rootStateService: jasmine.SpyObj<RootStateService>;
  let initialState: any;

  function updateState(rootState: RootStateService, cartData: any[] = []) {
    stateSubject.next({
      '@cart': {
        state: PebElementContextState.Ready,
        data: cartData,
      },
    });
    rootState[`state` as any] = stateSubject.value;
  }

  beforeEach(() => {

    initialState = {
      '@cart': {
        data: null,
      },
    };

    stateSubject = new BehaviorSubject<RootState>(initialState);
    const rootStateServiceSpy = jasmine.createSpyObj<RootStateService>('RootStateService', ['patch']);
    rootStateServiceSpy[`state$` as any] = stateSubject.asObservable();
    rootStateServiceSpy[`state` as any] = stateSubject.value;

    TestBed.configureTestingModule({
      providers: [
        CartService,
        { provide: RootStateService, useValue: rootStateServiceSpy },
      ],
    });

    service = TestBed.inject(CartService);
    rootStateService = TestBed.inject(RootStateService) as jasmine.SpyObj<RootStateService>;

  });

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should get cart items observable', () => {

    const saveSpy = spyOn(service, 'saveData');
    const cartData = [
      {
        product: { id: 'prod-001' },
        count: 10,
      },
    ];

    // w/o data
    service.cartItems$.subscribe();

    expect(saveSpy).not.toHaveBeenCalled();

    // w/ data
    updateState(rootStateService, cartData);

    expect(saveSpy).toHaveBeenCalledWith(cartData);

  });

  it('should get cart items', () => {

    const cartData = [
      {
        product: { id: 'prod-001' },
        count: 10,
      },
    ];

    // w/o data
    expect(service.cartItems).toEqual([]);

    // w/ data
    updateState(rootStateService, cartData);

    expect(service.cartItems).toEqual(cartData);

    // w/o rootStateService
    service[`rootStateService`] = null;

    expect(service.cartItems).toEqual([]);

  });

  it('should add cart item', () => {

    const product = { id: 'prod-001' };
    const nextSpy = spyOn(service[`updateCartCheckoutStream$`], 'next');
    const updateSpy = spyOn(service, 'updateItemQuantity');
    const cartItem = {
      product: { id: 'prod-001' },
      count: 2,
    };

    updateState(rootStateService);

    // w/o cartItem
    service.addCartItem(product);

    expect(updateSpy).not.toHaveBeenCalled();
    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: [
          {
            product: { id: 'prod-001' },
            count: 1,
          },
        ],
      },
    });
    expect(nextSpy).toHaveBeenCalled();

    // w/ cartItem
    updateState(rootStateService, [cartItem]);

    service.addCartItem(product);

    expect(updateSpy).toHaveBeenCalledWith('prod-001', undefined, 3);
    expect(nextSpy).toHaveBeenCalledTimes(2);

  });

  it('should update item quantity', () => {

    const productId = 'prod-001';
    const quantity = 3;
    const cartData = [
      {
        product: { id: 'prod-001' },
        count: 2,
      },
      {
        product: { id: 'prod-002' },
        count: 10,
      },
    ];

    // w/o cartItem
    updateState(rootStateService);

    service.updateItemQuantity(productId, null, quantity);

    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: [],
      },
    });

    updateState(rootStateService, [
      {
        product: { id: 'prod-002' },
        count: 10,
      },
    ]);

    service.updateItemQuantity('prod-001', null, 3);

    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: [
          {
            product: { id: 'prod-002' },
            count: 10,
          },
        ],
      },
    });

    // w/ cartItem
    updateState(rootStateService, cartData);
    cartData[0].count = 3;

    service.updateItemQuantity('prod-001', null, 3);

    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: cartData,
      },
    });

  });

  it('should remove cart item', () => {

    const cartItem = {
      product: { id: 'prod-001' },
      count: 5,
    };

    updateState(rootStateService, [cartItem]);

    service.removeCartItem('prod-001', null);

    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: [],
      },
    });

  });

  it('should clear items', () => {

    const cartItem = {
      product: { id: 'prod-001' },
      count: 5,
    };

    updateState(rootStateService, [cartItem]);

    service.clearItems();

    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: [],
      },
    });

  });

  it('should save data', () => {

    const cartData = [
      {
        product: { id: 'prod-001' },
        count: 5,
      },
    ];
    const setSpy = spyOn(localStorage, 'setItem');

    // isPlatformBrowser$.value = TRUE
    service.saveData(cartData);

    expect(setSpy).toHaveBeenCalledWith('payever-cart', JSON.stringify(cartData));

    // w/o isPlatformBrowser$
    setSpy.calls.reset();

    service.isPlatformBrowser$ = null;
    service.saveData(cartData);

    expect(setSpy).not.toHaveBeenCalled();

  });

  it('should load data', () => {

    localStorage.clear();

    const cartData = [
      {
        product: { id: 'prod-001' },
        count: 5,
      },
    ];
    const nextSpy = spyOn(service[`updateCartCheckoutStream$`], 'next');

    updateState(rootStateService);

    // isPlatformBrowser$.value = TRUE
    // w/o cartData
    service.loadData();

    expect(nextSpy).toHaveBeenCalled();
    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: [],
      },
    });

    // w/ cartData
    localStorage.setItem('payever-cart', JSON.stringify(cartData));

    service.loadData();

    expect(rootStateService.patch).toHaveBeenCalledWith({
      '@cart': {
        state: PebElementContextState.Ready,
        data: cartData,
      },
    });

    // w/o isPlatformBrowser$
    nextSpy.calls.reset();
    rootStateService.patch.calls.reset();

    service.isPlatformBrowser$ = null;
    service.loadData();

    expect(nextSpy).not.toHaveBeenCalled();
    expect(rootStateService.patch).not.toHaveBeenCalled();

    // clear localStorage
    localStorage.clear();

  });

});
