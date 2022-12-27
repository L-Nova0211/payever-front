import { Component } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  options: {
    vendorNumber: string
  };
}

@Component({
  selector: 'payment-readonly-vendorNumber',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentReadonlyVendorNumberComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'options';

  formScheme: FormScheme = {
    fieldsets: {
      options: [
        {
          name: 'vendorNumber',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            readonly: true,
          },
        },
      ],
    },
  };

  createFormDeferred(initialData: FormInterface) {
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      options: this.formBuilder.group({
        vendorNumber: [
          credentials['vendorNumber'],
        ],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
