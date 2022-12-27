import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthPublicKeyPrivateKeyComponent,
} from '../../../shared/components/base-auth-publicKey-privateKey/base-auth-publicKey-privateKey.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: ['./../../../shared/components/base-auth/base-auth.component.scss'],
})
export class PaymillDirectdebitAuthenticationComponent extends BaseAuthPublicKeyPrivateKeyComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.PAYMILL_DIRECTDEBIT;

  constructor(injector: Injector) {
    super(injector);
  }
}
