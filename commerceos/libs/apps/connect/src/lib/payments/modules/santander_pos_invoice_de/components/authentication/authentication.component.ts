import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthChannelLoginPasswordSenderComponent,
} from '../../../shared/components/base-auth-channel-login-password-sender/base-auth-channel-login-password-sender.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: ['./../../../shared/components/base-auth/base-auth.component.scss'],
})
export class SantanderPosInvoiceDeAuthenticationComponent extends BaseAuthChannelLoginPasswordSenderComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_POS_INVOICE_DE;

  constructor(injector: Injector) {
    super(injector);
  }
}
