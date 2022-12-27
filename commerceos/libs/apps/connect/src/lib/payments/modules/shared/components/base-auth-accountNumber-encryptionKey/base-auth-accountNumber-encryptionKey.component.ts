import { Injector, Directive } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormScheme } from '@pe/forms';

import { BaseAuthComponent } from '../base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    accountNumber: string,
    encryptionKey: string
  };
}

@Directive()
export abstract class BaseAuthAccountNumberEncryptionKeyComponent extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'accountNumber',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'encryptionKey',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
            required: true,
          }),
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
        accountNumber: [credentials['accountNumber'] || initialData.credentials.accountNumber, Validators.required],
        encryptionKey: [credentials['encryptionKey'] || initialData.credentials.encryptionKey, Validators.required],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
