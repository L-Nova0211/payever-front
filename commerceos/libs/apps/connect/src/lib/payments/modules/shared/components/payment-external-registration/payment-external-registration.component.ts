import { Component, Input, Injector } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PaymentMethodEnum } from '../../../../../shared';
import { BasePaymentComponent } from '../base-payment.component';

@Component({
  selector: 'payment-external-registration',
  templateUrl: './payment-external-registration.component.html',
  styleUrls: ['./payment-external-registration.component.scss'],
})
export class PaymentExternalRegistrationComponent extends BasePaymentComponent {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex = 0;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  onSubmit(): void {}
}
