import { NO_ERRORS_SCHEMA, PLATFORM_ID, Renderer2 } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PebClientCheckoutComponent } from './checkout.component';
import * as helpers from './helpers/checkout.helpers';
import { PebClientCheckoutCartService } from './services/cart.service';

describe('CheckoutComponent', () => {

  let fixture: ComponentFixture<PebClientCheckoutComponent>;
  let component: PebClientCheckoutComponent;
  let shop: any;
  let cartService: jasmine.SpyObj<PebClientCheckoutCartService>;
  let renderer: jasmine.SpyObj<Renderer2>;

  beforeEach(waitForAsync(() => {

    shop = {
      channelSet: undefined,
    };

    const cartServiceSpy = jasmine.createSpyObj<PebClientCheckoutCartService>('CartService', [
      'updateItemQuantity',
      'removeCartItem',
      'clearItems',
    ]);

    const rendererSpy = jasmine.createSpyObj<Renderer2>('Renderer2', ['listen']);

    TestBed.configureTestingModule({
      declarations: [
        PebClientCheckoutComponent,
      ],
      providers: [
        { provide: 'APP', useValue: shop },
        { provide: 'THEME', useValue: {} },
        { provide: PLATFORM_ID, useValue: 'browser' },
        { provide: PebClientCheckoutCartService, useValue: cartServiceSpy },
        { provide: Renderer2, useValue: rendererSpy },
      ],
      schemas: [
        NO_ERRORS_SCHEMA,
      ],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebClientCheckoutComponent);
      component = fixture.componentInstance;

      cartService = TestBed.inject(PebClientCheckoutCartService) as jasmine.SpyObj<PebClientCheckoutCartService>;
      renderer = TestBed.inject(Renderer2) as jasmine.SpyObj<Renderer2>;

      component[`renderer`] = renderer;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get style display', () => {

    // hidden = TRUE
    expect(component.hostHeight).toEqual('0');

    // hidden = FALSE
    component.hidden$.next(false);
    expect(component.hostHeight).toEqual('100%');

  });

  it('should crate flow params and set params on init', () => {

    Object.defineProperty(helpers, 'createFlowBody', {
      value: helpers.createFlowBody,
      writable: true,
    });
    const flowSpy = spyOn(helpers, 'createFlowBody').and.returnValue({ test: true } as any);

    // w/o channelSet
    // merchantMode = FALSE
    component.ngOnInit();

    expect(component.createFlowParams).toEqual(JSON.stringify({
      channelSetId: undefined,
      flowRawData: { test: true },
    }));
    expect(component.params$.value).toEqual(JSON.stringify({
      forceShowOrderStep: true,
      forceUseCard: true,
      forceNoPaddings: true,
      embeddedMode: true,
      merchantMode: false,
    }));
    expect(flowSpy).toHaveBeenCalledWith(undefined);

    // w/ channelSet
    // merchantMode = TRUE
    localStorage.setItem('enableMerchantMode', 'true');
    shop.channelSet = {
      id: 'cls-001',
    };

    component.ngOnInit();

    expect(component.createFlowParams).toEqual(JSON.stringify({
      channelSetId: 'cls-001',
      flowRawData: { test: true },
    }));
    expect(component.params$.value).toEqual(JSON.stringify({
      forceShowOrderStep: true,
      forceUseCard: true,
      forceNoPaddings: true,
      embeddedMode: true,
      merchantMode: true,
    }));
    expect(flowSpy).toHaveBeenCalledWith('cls-001');

  });

  it('should listen to renderer after view init', () => {

    component.ngAfterViewInit();

    expect(renderer.listen).toHaveBeenCalledWith(
      undefined,
      'eventemitted',
      component.checkoutWrapperEventHandler,
    );

  });

  it('should handle checkout wrapper event', () => {

    component.hidden$.next(false);

    const nextSpy = spyOn(component.hidden$, 'next');
    const changeSpy = spyOn(component, 'onCheckoutCartChanged');
    const event = {
      detail: {
        event: undefined,
        value: undefined,
      },
    };

    // w/o detail
    component.checkoutWrapperEventHandler({});

    expect(nextSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();

    // w/o detail.event & detail.value
    component.checkoutWrapperEventHandler(event);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(changeSpy).not.toHaveBeenCalled();

    // detail.event = PayeverCheckoutCartChanged
    // w/ detail.value
    event.detail = {
      event: 'payeverCheckoutCartChanged',
      value: { test: true },
    };

    component.checkoutWrapperEventHandler(event);

    expect(nextSpy).not.toHaveBeenCalled();
    expect(changeSpy).toHaveBeenCalledWith(event.detail.value);

    // detail.event = PayeverCheckoutClosed
    // value.finished = FALSE
    event.detail = {
      event: 'payeverCheckoutClosed',
      value: {
        finished: false,
      },
    };

    component.checkoutWrapperEventHandler(event);

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(cartService.clearItems).not.toHaveBeenCalled();
    expect(component.openOrderStep).toBeDefined();
    expect(component.recreateFlow).toBeUndefined();

    // value.finished = TRUE
    nextSpy.calls.reset();
    event.detail.value.finished = true;

    component.checkoutWrapperEventHandler(event);

    expect(nextSpy).toHaveBeenCalledWith(true);
    expect(cartService.clearItems).toHaveBeenCalled();
    expect(component.recreateFlow).toBeDefined();

  });

  it('should handle checkout cart change', () => {

    const cartItems = [
      {
        product: {
          id: 'prod-001',
        },
      },
      {
        product: {
          id: 'prod-002',
        },
      },
    ];
    const payload = {
      cart: undefined,
    };

    cartService[`cartItems` as any] = cartItems;

    // w/o payload.cart
    component.onCheckoutCartChanged(payload);

    cartItems.forEach(item => expect(cartService.removeCartItem).toHaveBeenCalledWith(item.product.id, undefined));

    // w/ payload.cart
    payload.cart = [
      {
        uuid: 'prod-001',
        quantity: 10,
      },
    ];

    component.onCheckoutCartChanged(payload);

    expect(cartService.updateItemQuantity).toHaveBeenCalledWith('prod-001', undefined, 10);
    expect(cartService.removeCartItem).toHaveBeenCalledWith('prod-002', undefined);

  });

  afterAll(() => {

    localStorage.clear();

  });

});
