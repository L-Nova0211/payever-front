import { Injector, Directive } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormScheme } from '@pe/forms';

import { BaseAuthComponent } from '../base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    configKey: string
  };
}

@Directive()
export abstract class BaseAuthConfigKeyComponent extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'configKey',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
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
        configKey: [credentials['configKey'] || initialData.credentials.configKey, Validators.required],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
