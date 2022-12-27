import { Component, Injector } from '@angular/core';

import { PaymentMethodEnum } from '../../../../../shared';
import {
  BaseAuthVendorIdsComponent,
} from '../../../shared/components/base-auth-vendorIds/base-auth-vendorIds.component';

@Component({
  selector: 'authentication',
  templateUrl: './../../../shared/components/base-auth-vendorIds/base-auth-vendorIds.component.html',
  styleUrls: ['./../../../shared/components/base-auth-vendorIds/base-auth-vendorIds.component.scss'],
})
export class SantanderInvoiceNoAuthenticationComponent extends BaseAuthVendorIdsComponent {

  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_INVOICE_NO;

  constructor(injector: Injector) {
    super(injector);
  }
}
