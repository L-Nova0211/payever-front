import { Component, Injector } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    statementDescriptor: string
  };
}

@Component({
  selector: 'payment-settings-statementDescriptor',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsStatementDescriptorComponent extends BaseSettingsComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'statementDescriptor',
          type: 'input',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
          },
          // TODO Must be added later
          // tooltipIcon: {
          //   tooltipMessage: 'An arbitrary string to be displayed on your customer's credit card statement. This may be up to 22 characters.'
          // }
        },
      ],
    },
  };

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    const extended = this.payment.variants[this.paymentIndex] || {} as any;
    const credentials = extended.credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        statementDescriptor: [credentials['statementDescriptor']],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
