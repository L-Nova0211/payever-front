import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { AddressService, FormSchemeField } from '@pe/forms';

export interface TaxesFormFieldsInterface {
  companyRegisterNumber: string;
  taxId: string;
  taxNumber: string;
  turnoverTaxAct: boolean;
}

export interface TaxesFormInterface {
  taxes: TaxesFormFieldsInterface;
}

@Injectable()
export class TaxesHelperService {

  constructor(private addressService: AddressService, private formBuilder: FormBuilder) {
  }

  createForm(initialData: TaxesFormFieldsInterface,
    requiredFields: string[]): { form: FormGroup, formSchemeFields: FormSchemeField[] } {
    const req = [ Validators.required ];
    const form: FormGroup = this.formBuilder.group({
      companyRegisterNumber: [initialData.companyRegisterNumber || '',
      requiredFields.indexOf('taxes.companyRegisterNumber') >= 0 ? req : []],
      taxId: [initialData.taxId || '', requiredFields.indexOf('taxes.taxId') >= 0 ? req : []],
      taxNumber: [initialData.taxNumber || '', requiredFields.indexOf('taxes.taxNumber') >= 0 ? req : []],
      turnoverTaxAct: [initialData.turnoverTaxAct || false,
        requiredFields.indexOf('taxes.turnoverTaxAct') >= 0 ? req : []],
    });
    const formSchemeFields: FormSchemeField[] = [
      {
        name: 'companyRegisterNumber',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-12 opacity-03 form-fieldset-field-padding-24 no-border-radius',
          required: requiredFields.indexOf('taxes.companyRegisterNumber') >= 0,
        },
      },
      {
        name: 'taxId',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('taxes.taxId') >= 0,
        },
      },
      {
        name: 'taxNumber',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('taxes.taxNumber') >= 0,
        },
      },
      {
        name: 'turnoverTaxAct',
        type: 'checkbox',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-12 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('taxes.turnoverTaxAct') >= 0,
        },
      },
    ];

    return { form: form, formSchemeFields: formSchemeFields };
  }
}
