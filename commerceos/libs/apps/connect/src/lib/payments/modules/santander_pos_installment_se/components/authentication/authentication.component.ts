import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthStoreIdMerchantNumberStoreIdentifier,
} from '../../../shared/components/base-auth-storeId-merchantNumber-storeIdentifier/base-auth-storeId-merchantNumber-storeIdentifier';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth/base-auth.component.html',
  styleUrls: ['./../../../shared/components/base-auth/base-auth.component.scss'],
})
export class SantanderPosInstallmentSeAuthenticationComponent extends BaseAuthStoreIdMerchantNumberStoreIdentifier {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT_SE;

  constructor(injector: Injector) {
    super(injector);
  }
}
