import { Component, Injector, ViewEncapsulation } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import { BaseMainComponent } from '../../../shared/components/base-main.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./../../../shared/components/payment-main-wrap/payment-main-wrap-parent.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class CashMainComponent extends BaseMainComponent {
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.CASH;

  constructor(protected injector: Injector) {
    super(injector);
  }
}
