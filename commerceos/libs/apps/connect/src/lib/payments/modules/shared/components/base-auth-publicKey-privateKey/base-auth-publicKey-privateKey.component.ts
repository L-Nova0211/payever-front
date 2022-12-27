import { Injector } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormScheme } from '@pe/forms';

import { BaseAuthComponent } from '../base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    publicKey: string,
    privateKey: string
  };
}

export abstract class BaseAuthPublicKeyPrivateKeyComponent extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'publicKey',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'privateKey',
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
        publicKey: [credentials['publicKey'] || initialData.credentials.publicKey, Validators.required],
        privateKey: [credentials['privateKey'] || initialData.credentials.privateKey, Validators.required],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
