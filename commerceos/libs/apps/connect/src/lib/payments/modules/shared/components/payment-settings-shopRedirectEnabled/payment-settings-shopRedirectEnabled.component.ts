import { Component, Injector } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { VariantListItemInterface } from '../../../../../shared';
import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  business_payment_option: { // TODO Does it work?
    shop_redirect_enabled: boolean
  };
}

@Component({
  selector: 'payment-settings-shopRedirectEnabled',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsShopRedirectEnabledComponent extends BaseSettingsComponent<FormInterface> {

  fieldsetsKey = 'business_payment_option';
  isSaveAsFormOptions = true;

  formScheme: FormScheme = {
    fieldsets: {
      business_payment_option: [
        {
          name: 'shop_redirect_enabled',
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
    const extended: VariantListItemInterface = this.payment.variants[this.paymentIndex] || ({} as any);
    this.form = this.formBuilder.group({
      business_payment_option: this.formBuilder.group({
        shop_redirect_enabled: [extended.shop_redirect_enabled || false],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
