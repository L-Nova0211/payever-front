import { Component, Injector } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { ConstantsService } from '../../services';
import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  options: {
    paymentAction: string
  };
}

@Component({
  selector: 'payment-settings-paymentAction',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsPaymentActionComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'options';

  constantsService: ConstantsService = this.injector.get(ConstantsService);
  formScheme: FormScheme = {
    fieldsets: {
      options: [
        {
          name: 'paymentAction',
          type: 'select',
          fieldSettings: {
            classList: 'col-xs-12 true-height no-border-radius select-with-tooltip form-fieldset-field-padding-24',
          },
          selectSettings: {
            panelClass: 'mat-select-dark',
            options: this.constantsService.getPaymentActionList(this.paymentMethod),
          },
          // TODO Must be added later
          // tooltipIcon: {
          //   tooltipMessage: 'If you choose to separate the authorization and capture action you will need to capture the amount on your customers PayPal account manually. Please note that an authorization is only valid for 29 days.'
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
    const options = extended.options || {};
    this.form = this.formBuilder.group({
      options: this.formBuilder.group({
        paymentAction: [options.paymentAction],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
