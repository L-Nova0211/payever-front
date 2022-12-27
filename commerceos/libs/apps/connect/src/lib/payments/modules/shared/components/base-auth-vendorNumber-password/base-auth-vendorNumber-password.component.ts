import { Injector, Directive } from '@angular/core';
import { Validators } from '@angular/forms';


import {
  InputType,
  FormScheme,
} from '@pe/forms';

import { BaseAuthComponent } from '../base-auth/base-auth.component';

interface FormInterface {
  credentials: {
    vendorNumber: string,
    password: string
  };
}

@Directive()
export abstract class BaseAuthVendorNumberPasswordComponent extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        {
          name: 'vendorNumber',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 no-border-radius form-fieldset-field-padding-24',
            required: true,
          }),
        },
        {
          name: 'password',
          type: 'input',
          ...this.makeFieldInputSettings$({
            classList: 'col-xs-12 form-fieldset-field-padding-24',
            required: true,
          }, {
            type: InputType.Password,
          }),
        },
      ],
    },
  };

  constructor(injector: Injector) {
    super(injector);
  }

  abstract getVendorNumberValidator(): any;

  createFormDeferred(initialData: FormInterface) {
    initialData.credentials = initialData.credentials || {} as any;
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        vendorNumber: [
          credentials['vendorNumber'] || initialData.credentials.vendorNumber,
          [
            Validators.required,
            this.getVendorNumberValidator(),
          ],
        ],
        password: credentials['password'] || [initialData.credentials.password, Validators.required],
      }),
    });
    this.afterCreateFormDeferred();
  }
}
