import { Component, Input } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PaymentMethodEnum } from '../../../../../shared';
import { SettingsOptionsInterface } from '../base-main.component';
import { BasePaymentComponent } from '../base-payment.component';

@Component({
  selector: 'payment-settings-save-button',
  templateUrl: './payment-settings-save-button.component.html',
  styleUrls: ['./payment-settings-save-button.component.scss'],
})
export class PaymentSettingsSaveButtonComponent extends BasePaymentComponent {

  @Input() paymentMethod: PaymentMethodEnum;
  @Input() paymentIndex = 0;
  @Input() data: SettingsOptionsInterface;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  onSubmit(): void {}
}
