import { Component, Injector } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    delayedPayments: boolean
  };
}

@Component({
  selector: 'payment-settings-delayedPayments',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsDelayedPaymentsComponent extends BaseSettingsComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'delayedPayments',
          type: 'checkbox',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24 form-fieldset-field-no-padding-mobile',
          },
          // TODO Return back later
          // tooltipIcon: {
          //   tooltipMessage:
          //     'If choosing to capture transaction manually, you will have to trigger capture action in transaction details'
          //     'If you choose to separate the authorization and capture action, you will need to capture the amount on your customers credit card manually. Please note that an authorization is valid for 7 days only.'
          // }
        },
      ],
    },
  };

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    const extended = this.payment.variants[this.paymentIndex] || ({} as any);
    const credentials = extended.credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        delayedPayments: [credentials['delayedPayments'] || false],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
