import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import { BaseMainComponent } from '../../../shared/components/base-main.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./../../../shared/components/payment-main-wrap/payment-main-wrap-parent.component.scss'],
})
export class PaymillDirectdebitMainComponent extends BaseMainComponent {
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.PAYMILL_DIRECTDEBIT;

  constructor(protected injector: Injector) {
    super(injector);
  }
}
