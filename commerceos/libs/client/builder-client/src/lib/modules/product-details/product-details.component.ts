import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
} from '@angular/core';

import { PebClientStoreService } from '../../services/store.service';
import { PebClientCheckoutCartService } from '../checkout/services/cart.service';

import { ProductDetailsAnimations } from './product-details.animations';
import { PRODUCT_DETAILS_DATA } from './product-details.injector';

@Component({
  selector: 'peb-client-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: ProductDetailsAnimations,
})
export class PebClientProductDetailsComponent implements AfterViewInit {
  state = 'default';

  readonly app$ = this.clientStore.app$;

  constructor(
    @Inject(PRODUCT_DETAILS_DATA) public data: any,
    private cdr: ChangeDetectorRef,
    private cartService: PebClientCheckoutCartService,
    private clientStore: PebClientStoreService,
  ) {}

  close(): void {
    this.state = 'default';
    this.cdr.detectChanges();
    setTimeout(_ => this.data?.overlay.dispose(), 400);
  }

  ngAfterViewInit() {
    this.state = 'open';
    this.cdr.detectChanges();
  }

  onInteraction(payload) {
    if (payload.type === 'product.add-to-cart') {
      this.cartService.addCartItem(payload.payload);
      this.close();
    }
  }
}
