import { Overlay, OverlayConfig, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal, PortalInjector } from '@angular/cdk/portal';
import { ComponentRef, Injectable, Injector } from '@angular/core';

import { PebClientProductDetailsComponent } from './product-details.component';
import { PRODUCT_DETAILS_DATA } from './product-details.injector';

@Injectable()
export class PebClientProductDetailsService {
  productDetailsRef: ComponentRef<PebClientProductDetailsComponent>;

  constructor(private injector: Injector, private overlay: Overlay) {}

  showProductDetails(payload: any): void {
    this.productDetailsRef = this.createProductDetailsOverlay(payload);
  }

  private createProductDetailsOverlay(
    payload: any,
  ): ComponentRef<PebClientProductDetailsComponent> {
    const strategy = this.overlay
      .position()
      .global()
      .centerVertically()
      .top()
      .height('100%')
      .width('100%');

    const config = new OverlayConfig({
      positionStrategy: strategy,
      hasBackdrop: true,
      backdropClass: 'product-details-overlay',
      scrollStrategy: this.overlay.scrollStrategies.block(),
    });

    const productDetailsOverlay = this.overlay.create(config);

    return productDetailsOverlay.attach(
      new ComponentPortal(
        PebClientProductDetailsComponent,
        null,
        this.createProductDetailsInjector(payload, productDetailsOverlay),
      ),
    );
  }

  private createProductDetailsInjector(
    snap: any,
    overlay: OverlayRef,
  ): PortalInjector {
    const injectorTokens = new WeakMap();
    injectorTokens.set(PRODUCT_DETAILS_DATA, {
      snap,
      overlay,
    });

    return new PortalInjector(this.injector, injectorTokens);
  }
}
