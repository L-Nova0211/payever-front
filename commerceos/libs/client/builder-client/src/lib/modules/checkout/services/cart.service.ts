import { isPlatformBrowser } from '@angular/common';
import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { debounceTime, map, tap, withLatestFrom } from 'rxjs/operators';

import { PebElementContext } from '@pe/builder-core';

import { PebClientStateService, Product } from '../../../services/state.service';
import { ContextCart } from '../interfaces/cart.interfaces';
import { FlowBodyCartInterface } from '../interfaces/checkout.interfaces';

@Injectable()
export class PebClientCheckoutCartService {
  cartItems$: Observable<ContextCart[]> = this.rootStateService.state$.pipe(
    map(value => value['@cart'].data),
    tap(data => data && this.saveData(data)),
    map(data => data || []),
  );

  private updateCartCheckoutStream$ = new BehaviorSubject<void>(null);
  updateCartCheckout$ = this.updateCartCheckoutStream$
    .asObservable()
    .pipe(withLatestFrom(this.cartItems$));

  isPlatformBrowser$ = new BehaviorSubject<boolean>(false);
  updateCartItems$: Observable<string>;

  get cartItems(): ContextCart[] {
    return this.rootStateService?.state['@cart'].data || [];
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    private rootStateService: PebClientStateService,
  ) {
    this.isPlatformBrowser$.next(isPlatformBrowser(this.platformId));
    this.updateCartItems$ = this.updateCartCheckout$.pipe(
      debounceTime(300),
      map(([_, cartItems]) =>
        JSON.stringify(
          cartItems.reduce(
            (acc: FlowBodyCartInterface[], { count = 0, product = null, variant = null }: ContextCart) => {
              if (product && count > 0) {
                acc.push({
                  name: product.title,
                  productId: variant?.id ?? product.id,
                  identifier: variant?.id ?? product.id,
                  id: variant?.id ?? product.id,
                  quantity: count,
                  price: variant?.price ?? product.price,
                });
              }

              return acc;
            },
            [],
          ),
        ),
      ),
    );
  }

  addCartItem(product: Product) {
    if (product) {
      const variantId = this.rootStateService.state['@products-detail-variants']?.data;
      const variant = variantId ? this.rootStateService.state['@products-detail']?.data?.variants?.find(
        v => v?.id === variantId,
      ) : null;
      const stateCart: PebElementContext<ContextCart[]> = this.rootStateService.state['@cart'];
      const cartItem: ContextCart = stateCart.data.find(
        item => item.product?.id === product.id && item.variant?.id === variant?.id,
      );

      if (cartItem) {
        this.updateItemQuantity(cartItem.product?.id, cartItem.variant?.id, cartItem.count + 1);
        this.updateCartCheckoutStream$.next();

        return;
      }

      const newItem: ContextCart = { product, variant, count: 1 };
      const cart: PebElementContext<ContextCart[]> = {
        ...stateCart,
        data: [...(stateCart.data || []), newItem],
      };

      this.rootStateService.patch({
        '@cart': cart,
      });

      this.updateCartCheckoutStream$.next();
    }
  }

  updateItemQuantity(productId: string, variantId: string, quantity: number) {
    const stateCart: PebElementContext<ContextCart[]> = this.rootStateService
      .state['@cart'];
    const cart: PebElementContext<ContextCart[]> = {
      ...stateCart,
      data: stateCart.data.map(cartItem =>
        cartItem.product.id === productId && cartItem.variant?.id === variantId
          ? { ...cartItem, count: quantity }
          : cartItem,
      ),
    };

    this.rootStateService.patch({
      '@cart': cart,
    });
  }

  removeCartItem(productId: string, variantId: string) {
    const stateCart: PebElementContext<ContextCart[]> = this.rootStateService
      .state['@cart'];
    const cart: PebElementContext<ContextCart[]> = {
      ...stateCart,
      data: stateCart.data.filter(
        cartItem => cartItem.product.id !== productId &&
          (variantId ? cartItem.variant?.id !== variantId : !cartItem.variant),
      ),
    };

    this.rootStateService.patch({
      '@cart': cart,
    });
  }

  clearItems() {
    const stateCart: PebElementContext<ContextCart[]> = this.rootStateService
      .state['@cart'];
    this.rootStateService.patch({
      '@cart': { ...stateCart, data: [] },
    });
    this.updateCartCheckoutStream$.next();
  }

  saveData(data: ContextCart[]) {
    if (this.isPlatformBrowser$?.value) {
      localStorage.setItem('payever-cart', JSON.stringify(data));
    }
  }

  loadData() {
    if (this.isPlatformBrowser$?.value) {
      const stateCart: PebElementContext<ContextCart[]> = this.rootStateService.state['@cart'];
      try {
        const cartData = localStorage.getItem('payever-cart');
        const parsedCartData = cartData ? JSON.parse(cartData) : [];
        this.rootStateService.patch({
          '@cart': { ...stateCart, data: parsedCartData },
        });
        this.updateCartCheckoutStream$.next();
      } catch (err) {
        alert(`Please enable cookies in your browser in order for the site to fully function.`);
        console.error(err);
      }
    }
  }
}
