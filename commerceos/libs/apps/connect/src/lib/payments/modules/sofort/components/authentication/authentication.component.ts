import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';

import {
  BaseAuthConfigKeyComponent,
} from './../../../shared/components/base-auth-configKey/base-auth-configKey.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: [ './../../../shared/components/base-auth/base-auth.component.scss' ],
})
export class SofortAuthenticationComponent extends BaseAuthConfigKeyComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SOFORT;

  constructor(injector: Injector) {
    super(injector);
  }
}
