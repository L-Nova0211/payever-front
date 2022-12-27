import { Component, Injector, ViewEncapsulation } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthAccountNumberEncryptionKeyComponent,
}
from '../../../shared/components/base-auth-accountNumber-encryptionKey/base-auth-accountNumber-encryptionKey.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: ['./../../../shared/components/base-auth/base-auth.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PayexCreditcardAuthenticationComponent extends BaseAuthAccountNumberEncryptionKeyComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.PAYEX_CREDITCARD;

  constructor(injector: Injector) {
    super(injector);
  }
}
