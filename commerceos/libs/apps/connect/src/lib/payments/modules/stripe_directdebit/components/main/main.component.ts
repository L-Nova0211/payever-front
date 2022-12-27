import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import { BaseMainComponent } from '../../../shared/components/base-main.component';

@Component({
  selector: 'main',
  templateUrl: './main.component.html',
  styleUrls: ['./../../../shared/components/payment-main-wrap/payment-main-wrap-parent.component.scss'],
})
export class StripeDirectDebitMainComponent extends BaseMainComponent {
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.STRIPE_DIRECTDEBIT;

  constructor(protected injector: Injector) {
    super(injector);
  }
}
