import { Component, Injector, ViewChildren, QueryList } from '@angular/core';
import { MatExpansionPanel } from '@angular/material/expansion';

import { PaymentMethodEnum } from '../../../../../shared';
import { REQUIRED_FIELDS_SANTANDER_DE } from '../../../../constants';
import {
  BaseAccountSantanderComponent,
} from '../../../shared/components/base-account-santander/base-account-santander.component';

@Component({
  selector: 'account',
  templateUrl: './../../../shared/components/base-account-santander/base-account-santander.component.html',
  styleUrls: ['./../../../shared/components/base-account-santander/base-account-santander.component.scss'],
})
export class SantanderPosInstallmentAccountComponent extends BaseAccountSantanderComponent {

  readonly sendApplicationOnSave: boolean = false;
  readonly submitButtonText = 'actions.save';
  readonly paymentMethod: PaymentMethodEnum = PaymentMethodEnum.SANTANDER_POS_INSTALLMENT;
  @ViewChildren('panel') panels: QueryList<MatExpansionPanel>;
  requiredFields = REQUIRED_FIELDS_SANTANDER_DE;

  constructor(injector: Injector) {
    super(injector);
  }
}
