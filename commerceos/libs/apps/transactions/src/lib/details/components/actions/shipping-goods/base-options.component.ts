import { Directive } from '@angular/core';

import { BaseShippingComponent } from './base.component';
import { SHIPPING_CARRIER } from './constant';

@Directive()
export class BaseShippingOptionsComponent extends BaseShippingComponent {

  get shippingCarrier(): string[] {
    return SHIPPING_CARRIER;
  }
}
