import { Component, OnInit } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  options: {
    channel: string
  };
}

@Component({
  selector: 'payment-readonly-channel',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentReadonlyChannelComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'options';

  formScheme: FormScheme = {
    fieldsets: {
      options: [
        {
          name: 'channel',
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
        channel: [
          credentials['channel'],
        ],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
