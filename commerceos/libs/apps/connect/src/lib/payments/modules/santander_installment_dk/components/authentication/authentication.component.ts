import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  SantanderDkCredentialsStoreProductData,
} from '../../../shared/components/base-auth-dkProductIds/base-auth-dkProductIds.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth-dkProductIds/base-auth-dkProductIds.component.html',
  styleUrls: [
    './../../../shared/components/base-auth-dkProductIds/base-auth-dkProductIds.component.scss',
  ],
})
export class SantanderInstallmentDkAuthenticationComponent extends SantanderDkCredentialsStoreProductData {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INSTALLMENT_DK;

  constructor(injector: Injector) {
    super(injector);
  }
}
