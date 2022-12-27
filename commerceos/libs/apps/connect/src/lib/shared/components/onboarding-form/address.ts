import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import {
  AddonType, AddressService, AddressInterface, CountryArrayInterface, FormSchemeField,
  GooglePlacesAutocompleteChangeEvent,
} from '@pe/forms';

export interface AddressFormFieldsInterface {
  googleAutocomplete: string;
  country: string;
  city: string;
  street: string;
  zipCode: string;
}

export interface AddressFormInterface {
  companyAddress: AddressFormFieldsInterface;
}

@Injectable()
export class AddressHelperService {

  address: AddressInterface = {};

  constructor(private addressService: AddressService, private formBuilder: FormBuilder) {
  }

  createForm(initialData: AddressFormFieldsInterface,
    requiredFields: string[]): { form: FormGroup, formSchemeFields: FormSchemeField[] } {
    const companyAddress = initialData; // this.currentBusiness.companyAddress || {}; // TODO Fill
    const fullAddressDefault = companyAddress.street ?
      `${companyAddress.street}, ${companyAddress.zipCode}, ${companyAddress.country}, ${companyAddress.city}` : '';

    const req = [ Validators.required ];
    const form: FormGroup = this.formBuilder.group({
      googleAutocomplete: [companyAddress.googleAutocomplete ||
        fullAddressDefault || '', requiredFields.indexOf('companyAddress.googleAutocomplete') >= 0 ? req : []],
      country: [companyAddress.country || '', req],
      city: [companyAddress.city || '', req],
      street: [companyAddress.street || '', req],
      zipCode: [companyAddress.zipCode || '', req],
    });
    const formSchemeFields: FormSchemeField[] = [
      {
        name: 'googleAutocomplete',
        type: 'autocomplete-google-places',
        fieldSettings: {
          classList: 'col-xs-12 opacity-03 form-fieldset-field-padding-24 no-border-radius',
          required: requiredFields.indexOf('companyAddress.googleAutocomplete') >= 0,
        },
        addonPrepend: {
          addonType: AddonType.Icon,
          iconId: 'icon-geocoder-24',
        },
        autocompleteGooglePlacesSettings: {
          placeholder: 'Google Autocomplete',
          onValueChange: (event: GooglePlacesAutocompleteChangeEvent) => {
            this.address = event.address;
            form.get('city').setValue(event.address.city, { emitEvent: false });
            form.get('country').setValue(event.address.country, { emitEvent: false });
            form.get('street').setValue(event.address.street, { emitEvent: false });
            form.get('zipCode').setValue(event.address.zip_code, { emitEvent: false });
          },
        },
      },
      {
        name: 'country',
        type: 'select',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: true,
        },
        selectSettings: {
          options: this.countryList,
          panelClass: 'mat-select-dark',
        },
        linkedControls: [
          {
            control: form.controls['googleAutocomplete'],
            transform: (data: any): string => {
              this.addressService.mutateAddress(this.address, 'country', data);

              return this.addressService.getAddressString(this.address);
            },
          },
        ],
      },
      {
        name: 'city',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: true,
        },
        linkedControls: [
          {
            control: form.controls['googleAutocomplete'],
            transform: (data: any): string => {
              this.addressService.mutateAddress(this.address, 'city', data);

              return this.addressService.getAddressString(this.address);
            },
          },
        ],
      },
      {
        name: 'street',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: true,
        },
        linkedControls: [
          {
            control: form.controls['googleAutocomplete'],
            transform: (data: any): string => {
              this.addressService.mutateAddress(this.address, 'street', data);

              return this.addressService.getAddressString(this.address);
            },
          },
        ],
      },
      {
        name: 'zipCode',
        type: 'input',
        fieldSettings: {
          classList: 'col-xs-12 col-sm-6 opacity-03 form-fieldset-field-padding-24',
          required: true,
        },
        linkedControls: [
          {
            control: form.controls['googleAutocomplete'],
            transform: (data: any): string => {
              this.addressService.mutateAddress(this.address, 'zip_code', data);

              return this.addressService.getAddressString(this.address);
            },
          },
        ],
      },
    ];

    return { form: form, formSchemeFields: formSchemeFields };
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
