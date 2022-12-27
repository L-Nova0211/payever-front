import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddressService, FormSchemeField, SelectOptionInterface } from '@pe/forms';
import { TranslateService } from '@pe/i18n';

export interface ContactFormFieldsInterface {
  salutation: string;
  firstName: string;
  lastName: string;
  phone: string;
  fax: string;
  additionalPhone: string;
}

export interface ContactFormInterface {
  contactDetails: ContactFormFieldsInterface;
}

@Injectable()
export class ContactHelperService {

  salutations: SelectOptionInterface[] = [
    {
      value: 'SALUTATION_MR',
      label: this.translateService.translate('user_business_form.form.contactDetails.salutation.options.SALUTATION_MR'),
    },
    {
      value: 'SALUTATION_MRS',
      label: this.translateService.translate(
      'user_business_form.form.contactDetails.salutation.options.SALUTATION_MRS'),
    },
  ];

  constructor(addressService: AddressService,
    private translateService: TranslateService, private formBuilder: FormBuilder) {
  }

  createForm(initialData: ContactFormFieldsInterface,
    requiredFields: string[]): { form: FormGroup, formSchemeFields: FormSchemeField[] } {
    const req = [ Validators.required ];
    const form: FormGroup = this.formBuilder.group({
      salutation: [initialData.salutation || '', requiredFields.indexOf('contactDetails.salutation') >= 0 ? req : []],
      firstName: [initialData.firstName || '', req],
      lastName: [initialData.lastName || '', req],
      phone: [initialData.phone || '', req],
      fax: [initialData.fax || '', requiredFields.indexOf('contactDetails.fax') >= 0 ? req : []],
      additionalPhone: [initialData.additionalPhone || '',
      requiredFields.indexOf('contactDetails.additionalPhone') >= 0 ? req : []],
    });
    const formSchemeFields: FormSchemeField[] = [
      {
        name: 'salutation',
        type: 'select',
        fieldSettings: {
          classList: 'col-xs-4 opacity-03 form-fieldset-field-padding-24 no-border-radius',
          required: requiredFields.indexOf('contactDetails.salutation') >= 0,
        },
        selectSettings: {
          options: this.salutations,
          panelClass: 'mat-select-dark',
        },
      },
      {
        name: 'firstName',
        type: 'input',
        fieldSettings: {
          required: true,
          classList: 'col-xs-4 opacity-03 form-fieldset-field-padding-24',
        },
      },
      {
        name: 'lastName',
        type: 'input',
        fieldSettings: {
          required: true,
          classList: 'col-xs-4 opacity-03 form-fieldset-field-padding-24',
        },
      },
      {
        name: 'phone',
        type: 'phone-input',
        fieldSettings: {
          required: true,
          classList: 'col-xs-6 opacity-03 form-fieldset-field-padding-24',
        },
      },
      {
        name: 'fax',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('contactDetails.fax') >= 0,
        },
      },
      {
        name: 'additionalPhone',
        type: 'phone-input',
        fieldSettings: {
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('contactDetails.additionalPhone') >= 0,
        },
      },
    ];

    return { form: form, formSchemeFields: formSchemeFields };
  }
}
