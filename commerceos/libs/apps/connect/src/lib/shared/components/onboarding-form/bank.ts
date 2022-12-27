import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  AddressService, AddressInterface, CountryArrayInterface, FormSchemeField,
} from '@pe/forms';

import { SEPA_COUNTRIES } from './sepa-countries';

export interface BankFormFieldsInterface {
  owner: string;
  bankName: string;
  country: string;
  city: string;
  bic: string;
  iban: string;
  bankCode: string;
  routingNumber: string;
  accountNumber: string;
  // TODO Research do we need following fields:
  // swift: string;
}

export interface BankFormInterface {
  bankAccount: BankFormFieldsInterface;
}

@Injectable()
export class BankHelperService {

  address: AddressInterface = {};

  constructor(private addressService: AddressService, private formBuilder: FormBuilder) {
  }

  createForm(initialData: BankFormFieldsInterface,
    requiredFields: string[]): { form: FormGroup, formSchemeFields: FormSchemeField[] } {
    const req = [ Validators.required ];
    const form: FormGroup = this.formBuilder.group({
      owner: [initialData.owner || '', requiredFields.indexOf('bankAccount.owner') >= 0 ? req : []],
      bankName: [initialData.bankName || '', requiredFields.indexOf('bankAccount.bankName') >= 0 ? req : []],
      country: [initialData.country || '', requiredFields.indexOf('bankAccount.country') >= 0 ? req : []],
      city: [initialData.city || '', requiredFields.indexOf('bankAccount.city') >= 0 ? req : []],
      bic: [initialData.bic || '', requiredFields.indexOf('bankAccount.bic') >= 0 ? req : []],
      iban: [initialData.iban || '', requiredFields.indexOf('bankAccount.iban') >= 0 ? req : []],
      bankCode: [initialData.bankCode || '', requiredFields.indexOf('bankAccount.bankCode') >= 0 ? req : []],
      routingNumber: [initialData.routingNumber || '',
      requiredFields.indexOf('bankAccount.routingNumber') >= 0 ? req : []],
      accountNumber: [initialData.accountNumber || '',
      requiredFields.indexOf('bankAccount.accountNumber') >= 0 ? req : []],
    });
    const formSchemeFields: FormSchemeField[] = [
      {
        name: 'owner',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24 no-border-radius',
          required: requiredFields.indexOf('bankAccount.owner') >= 0,
        },
      },
      {
        name: 'bankName',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.bankName') >= 0,
        },
      },
      {
        name: 'country',
        type: 'select',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.country') >= 0,
        },
        selectSettings: {
          options: this.countryList,
          panelClass: 'mat-select-dark',
        },
      },
      {
        name: 'city',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.city') >= 0,
        },
      },
      {
        name: 'bic',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.bic') >= 0,
        },
      },
      {
        name: 'iban',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.iban') >= 0,
        },
      },
      {
        name: 'bankCode',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-12 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.bankCode') >= 0,
        },
      },
      {
        name: 'routingNumber',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-12 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.routingNumber') >= 0,
        },
      },
      {
        name: 'accountNumber',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-12 opacity-03 form-fieldset-field-padding-24',
          required: requiredFields.indexOf('bankAccount.accountNumber') >= 0,
        },
      },
    ];

    return { form: form, formSchemeFields: formSchemeFields };
  }

  onUpdateFormData(toggleControl: (name: string, enable: boolean) => void, formsValues: BankFormInterface) {
    if (formsValues.bankAccount) {
      const isSepa: boolean = SEPA_COUNTRIES.indexOf(formsValues.bankAccount.country) > -1;
      const isUS: boolean = formsValues.bankAccount.country === 'US';
      toggleControl('bankAccount.bic', isSepa);
      toggleControl('bankAccount.iban', isSepa);
      toggleControl('bankAccount.bankCode', !isSepa && !isUS);
      toggleControl('bankAccount.routingNumber', !isSepa && isUS);
      toggleControl('bankAccount.accountNumber', !isSepa);
    }
  }

  private get countryList(): any {
    return this.addressService.preferredCountriesArray
      .concat(this.addressService.countriesArray)
      .map((value: CountryArrayInterface) => {
        return {
          value: value.code,
          label: value.name,
        };
      });
  }
}
