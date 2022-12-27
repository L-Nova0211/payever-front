import { Component } from '@angular/core';

import { FormScheme } from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  credentials: {
    payExCaptureEnabled: boolean
  };
}

@Component({
  selector: 'payment-settings-payExCaptureEnabled',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentSettingsPayExCaptureEnabledComponent extends BaseSettingsComponent<FormInterface> {

  canChangePayExCaptureEnabled = false;

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'payExCaptureEnabled',
          type: 'checkbox',
          fieldSettings: {
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24 form-fieldset-field-no-padding-mobile',
          },
        },
      ],
    },
  };

  private isReady = false;

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        payExCaptureEnabled: [credentials['payExCaptureEnabled'] || false],
      }),
    });
    this.afterCreateFormDeferred();
    this.isReady = true;
  }

  protected onUpdateFormData(formValues: FormInterface): void {
    if (formValues && formValues.credentials && formValues.credentials.payExCaptureEnabled &&
      !this.canChangePayExCaptureEnabled) {
      this.form.get('credentials').get('payExCaptureEnabled').setValue(false);
      if (this.isReady) {
        this.showStepError(this.translateService.translate(
        'categories.payments.settings.payex_capture_enabled.disabled_feature_warning'));
      }
    } else {
      super.onUpdateFormData(formValues);
    }
  }
}
