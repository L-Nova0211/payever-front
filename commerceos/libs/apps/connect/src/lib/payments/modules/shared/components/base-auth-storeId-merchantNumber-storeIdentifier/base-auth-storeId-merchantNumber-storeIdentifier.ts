import { Injector, Directive } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormScheme } from '@pe/forms';

import { BaseAuthComponent } from '../base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    storeId: string,
    merchantNumber: string,
    useDefaultStoreIdentifier: boolean,
    storeIdentifier: string
  };
}

@Directive()
export abstract class BaseAuthStoreIdMerchantNumberStoreIdentifier extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'storeId',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'merchantNumber',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'useDefaultStoreIdentifier',
          type: 'checkbox',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
          }),
        },
        {
          name: 'storeIdentifier',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
            required: true,
          }),
        },
      ],
    },
  };

  hideDisabled = true;

  constructor(injector: Injector) {
    super(injector);
  }

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        storeId: [credentials['storeId'] || initialData.credentials.storeId, Validators.required],
        merchantNumber: [credentials['merchantNumber'] || initialData.credentials.merchantNumber, Validators.required],
        useDefaultStoreIdentifier: [credentials['useDefaultStoreIdentifier'] ||
        initialData.credentials.useDefaultStoreIdentifier || false],
        storeIdentifier: [credentials['storeIdentifier'] ||
        initialData.credentials.storeIdentifier, Validators.required],
      }),
    });
    this.afterCreateFormDeferred();
  }

  protected onUpdateFormData(formValues: FormInterface): void {
    this.toggleControl('credentials.storeIdentifier',
    formValues.credentials && !formValues.credentials.useDefaultStoreIdentifier);
  }
}
