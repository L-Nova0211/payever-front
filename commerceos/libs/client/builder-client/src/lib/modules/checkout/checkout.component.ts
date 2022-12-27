import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  HostBinding,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  PLATFORM_ID,
  Renderer2,
  ViewChild,
} from '@angular/core';
import { BehaviorSubject, combineLatest, Subject } from 'rxjs';
import { map, takeUntil, tap } from 'rxjs/operators';

import { AppType, APP_TYPE, EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { PebClientStoreService } from '../../services/store.service';

import { createFlowBody } from './helpers/checkout.helpers';
import { TimestampEvent } from './helpers/timestamp-event';
import { FlowBodyCartInterface } from './interfaces/checkout.interfaces';
import { PebClientCheckoutCartService } from './services/cart.service';

enum CheckoutEvents {
  EventEmitted = 'eventemitted',
  PayeverCheckoutClosed = 'payeverCheckoutClosed',
  PayeverCheckoutCartChanged = 'payeverCheckoutCartChanged',
}

@Component({
  selector: 'peb-client-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebClientCheckoutComponent implements OnInit, AfterViewInit, OnDestroy {
  hidden$ = new BehaviorSubject<boolean>(true);
  params$ = new BehaviorSubject<any>(null);

  // ammount checkout
  amountHidden$ = new BehaviorSubject<boolean>(true);
  amountParams$ = new BehaviorSubject<any>(null);
  showAmountCheckout$ = new BehaviorSubject<boolean>(false);
  destroy$ = new Subject<void>();

  // TODO: add types
  createFlowParams: string;
  amountCreateFlowParams: string;
  recreateFlow: string;
  openOrderStep: string;
  finished = false;
  updateCartItems$: any;

  @ViewChild('checkoutWrapper') checkoutWrapper: ElementRef<any>;
  @ViewChild('amountCheckoutWrapper') amountCheckoutWrapper: ElementRef<any>;

  @Input()
  @HostBinding('style.height')
  hostHeight = '0';

  @HostBinding('style.display') hostDisplay = 'none';

  get app() {
    return this.clientStore.app;
  }

  get defaultConfig() {
    // We enable merchantMode only we are inside COSF as a merchant for sure
    let merchantMode: boolean = this.getUrlHostname(this.env.frontend.commerceos) === window.location.hostname;
    if (window.location.hostname === 'localhost' && document.getElementsByTagName('peb-pos')?.length > 0) {
      // This is small trick for local development
      merchantMode = true;
    }

    return {
      forceShowOrderStep: true,
      forceNoPaddings: true,
      embeddedMode: true,
      generatePaymentCode: true,
      clientMode: true,
      merchantMode,
    };
  }

  constructor(
    @Inject(APP_TYPE) public appType: AppType,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    @Inject(PLATFORM_ID) private platformId: string,
    private clientStore: PebClientStoreService,
    public cartService: PebClientCheckoutCartService,
    private renderer: Renderer2,
    private cdr: ChangeDetectorRef,
  ) {}

  ngOnInit() {
    combineLatest([
      this.amountHidden$,
      this.hidden$,
    ]).pipe(
      map(data => data.every(h => !!h)),
      tap((hidden) => {
        this.hostHeight = hidden ? '0' : '100%';
        this.hostDisplay = hidden ? 'none' : 'block';
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.createFlowParams = JSON.stringify({
      channelSetId: this.app.channelSet?._id ?? this.app.channelSet,
      flowRawData: createFlowBody(this.app.channelSet?._id ?? this.app.channelSet, this.defaultConfig.merchantMode),
    });

    this.amountCreateFlowParams = JSON.stringify({
      channelSetId: this.app.channelSet?._id ?? this.app.channelSet,
      posMerchantMode: this.defaultConfig.merchantMode,
      generatePaymentCode: true,
    });

    this.params$.next(JSON.stringify(this.defaultConfig));

    this.amountParams$.next(JSON.stringify(this.defaultConfig));
  }

  ngAfterViewInit() {
    this.renderer.listen(
      this.checkoutWrapper?.nativeElement,
      CheckoutEvents.EventEmitted,
      this.checkoutWrapperEventHandler,
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initAmountCheckout() {
    this.showAmountCheckout$.next(true);
  }

  private getUrlHostname(url: string): string {
    const elem: HTMLAnchorElement = document.createElement('a');
    elem.href = url;

    return elem.hostname;
  }

  checkoutWrapperEventHandler = e => {
    if (e && (e as any).detail) {
      const event = (e as any).detail.event;
      const value: any = (e as any).detail.value || {};
      if (event === CheckoutEvents.PayeverCheckoutClosed) {
        this.hidden$.next(true);
        if (value.finished) {
          this.cartService.clearItems();
          this.recreateFlow = JSON.stringify(new TimestampEvent());
        } else {
          this.openOrderStep = JSON.stringify(new TimestampEvent());
        }
        this.cdr.detectChanges();
      }
      if (
        event === CheckoutEvents.PayeverCheckoutCartChanged
      ) {
        this.onCheckoutCartChanged(value);
      }
    }
  }

  onCheckoutCartChanged(payload: any) {
    const cart: FlowBodyCartInterface[] = payload.cart || [];
    this.cartService.cartItems.forEach(item => {
      const id = item.variant?.id ?? item.product.id;
      const flowItem = cart.find(flowItemValue => flowItemValue.productId === id);

      if (flowItem?.quantity > 0) {
        this.cartService.updateItemQuantity(item.product.id, item.variant?.id, flowItem.quantity);
      } else {
        this.cartService.removeCartItem(item.product.id, item.variant?.id);
      }
    });
  }

  amountCheckoutWrapperEventHandler = e => {
    if (e?.detail) {
      const event = e.detail.event;
      const value: any = e.detail.value || {};
      if (event === CheckoutEvents.PayeverCheckoutClosed) {
        this.amountHidden$.next(true);
        this.cdr.markForCheck();
        if (value.finished) {
          this.recreateFlow = JSON.stringify(new TimestampEvent());
        } else {
          this.openOrderStep = JSON.stringify(new TimestampEvent());
        }
      }
    }
  };
}
