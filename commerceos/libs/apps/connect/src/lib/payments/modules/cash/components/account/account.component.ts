import { Component, Injector, ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import { PaymentMethodEnum } from '../../../../../shared';
import { REQUIRED_FIELDS_CASH } from '../../../../constants';
import {
  BaseAccountSantanderComponent,
} from '../../../shared/components/base-account-santander/base-account-santander.component';

@Component({
  selector: 'account',
  templateUrl: './../../../shared/components/base-account-santander/base-account-santander.component.html',
  styleUrls: ['./../../../shared/components/base-account-santander/base-account-santander.component.scss'],
})
export class CashAccountComponent extends BaseAccountSantanderComponent {

  readonly sendApplicationOnSave: boolean = false;
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.CASH;
  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;
  requiredFields = REQUIRED_FIELDS_CASH;

  constructor(injector: Injector) {
    super(injector);
  }
}
