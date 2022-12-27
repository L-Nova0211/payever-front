import { Injector, Directive } from '@angular/core';
import { Validators } from '@angular/forms';

import { FormScheme } from '@pe/forms';

import { BaseAuthComponent } from '../base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    channel: string,
    login: string,
    password: string,
    sender: string,
  };
}

@Directive()
export abstract class BaseAuthChannelLoginPasswordSenderComponent extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'channel',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'login',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'password',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'sender',
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
        channel: [ credentials['channel'] || initialData.credentials.channel, Validators.required ],
        login: [ credentials['login'] || initialData.credentials.login, Validators.required ],
        password: [ credentials['password'] || initialData.credentials.password, Validators.required ],
        sender: [ credentials['sender'] || initialData.credentials.sender, Validators.required ],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
