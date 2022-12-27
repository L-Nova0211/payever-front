import { Component, Injector } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { VariantListItemInterface } from '../../../../../shared';
import { ConstantsService } from '../../services';
import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  business_payment_option: {
    accept_fee: boolean
  };
}

@Component({
  selector: 'payment-settings-acceptFee',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsAcceptFeeComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'business_payment_option';
  isSaveAsFormOptions = true;

  constantsService: ConstantsService = this.injector.get(ConstantsService);

  formScheme: FormScheme = {
    fieldsets: {
      business_payment_option: [
        {
          name: 'accept_fee',
          type: 'select',
          fieldSettings: {
            classList: 'col-xs-12 true-height no-border-radius form-fieldset-field-padding-24',
          },
          selectSettings: {
            panelClass: 'mat-select-dark',
            options: this.constantsService.getAcceptFeeList(this.paymentMethod),
          },
        },
      ],
    },
  };

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    const extended: VariantListItemInterface = this.payment.variants[this.paymentIndex] || ({} as any);
    this.form = this.formBuilder.group({
      business_payment_option: this.formBuilder.group({
        accept_fee: [Boolean(extended.accept_fee)],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
