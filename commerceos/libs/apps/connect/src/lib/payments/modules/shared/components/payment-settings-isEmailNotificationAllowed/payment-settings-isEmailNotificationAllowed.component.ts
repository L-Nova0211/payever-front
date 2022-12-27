import { Component, Injector } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    isEmailNotificationAllowedComponent: boolean
  };
}

@Component({
  selector: 'payment-settings-isEmailNotificationAllowedComponent',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsIsEmailNotificationAllowedComponent extends BaseSettingsComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'isEmailNotificationAllowedComponent',
          type: 'checkbox',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24 form-fieldset-field-no-padding-mobile',
          },
        },
      ],
    },
  };

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        isEmailNotificationAllowedComponent: [credentials['isEmailNotificationAllowedComponent'] || false],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
