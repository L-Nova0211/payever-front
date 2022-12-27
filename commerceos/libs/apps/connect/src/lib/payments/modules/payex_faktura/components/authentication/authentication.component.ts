import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthAccountNumberEncryptionKeyComponent,
}
from '../../../shared/components/base-auth-accountNumber-encryptionKey/base-auth-accountNumber-encryptionKey.component';


@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: ['./../../../shared/components/base-auth/base-auth.component.scss'],
})
export class PayexFakturaAuthenticationComponent extends BaseAuthAccountNumberEncryptionKeyComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.PAYEX_FAKTURA;

  constructor(injector: Injector) {
    super(injector);
  }
}
