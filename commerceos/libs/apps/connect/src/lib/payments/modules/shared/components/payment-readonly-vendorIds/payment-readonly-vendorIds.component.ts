import { Component } from '@angular/core';
import { cloneDeep, merge } from 'lodash-es';

import {
  FieldSettingsInterface, FormScheme, FormSchemeField, InputSettingsInterface, InputType,
} from '@pe/forms';

import { BaseSettingsComponent } from '../base-settings/base-settings.component';

interface FormInterface {
  options: {
    vendorId0: string;
    vendorId1: string;
    vendorId2: string;
    vendorId3: string;
  };
}

const basic: FormSchemeField = {
  name: 'vendor',
  type: 'input',
  fieldSettings: {
    classList: 'col-xs-12 form-fieldset-field-padding-24',
    label: 'Vendor name',
    readonly: true,
  },
  inputSettings: {
    type: InputType.Text,
    placeholder: 'Vendor name',
  },
};

const COUNT = 4;

@Component({
  selector: 'payment-readonly-vendorIds',
  templateUrl: '../base-settings/base-settings.component.html',
  styleUrls: ['../base-settings/base-settings.component.scss'],
})
export class PaymentReadonlyVendorIdsComponent extends BaseSettingsComponent<FormInterface> {

  hideDisabled = true;
  fieldsetsKey = 'options';

  formScheme: FormScheme = {
    fieldsets: {
      options: [
        this.prepareFieldset('vendorId0', { classList: 'col-xs-12 form-fieldset-field-padding-24 no-border-radius' }),
        this.prepareFieldset('vendorId1'),
        this.prepareFieldset('vendorId2'),
        this.prepareFieldset('vendorId3'),
      ],
    },
  };

  private prepareFieldset(name: string, fieldSettings: FieldSettingsInterface = null): FormSchemeField {
    const result: FormSchemeField = merge(cloneDeep(basic), {
      name: name,
      fieldSettings: fieldSettings || {},
    });
    (result.fieldSettings as FieldSettingsInterface).label = this.translateService.translate('categories.payments.form.vendor.label');
    (result.inputSettings as InputSettingsInterface).placeholder = this.translateService.translate('categories.payments.form.vendor.placeholder');

    return result;
  }

  createFormDeferred(initialData: FormInterface) {
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    const vendorIds = credentials.vendorIds || [];
    this.form = this.formBuilder.group({
      options: this.formBuilder.group({
        vendorId0: [vendorIds[0]],
        vendorId1: [vendorIds[1]],
        vendorId2: [vendorIds[2]],
        vendorId3: [vendorIds[3]],
      }),
    });
    this.afterCreateFormDeferred();
    setTimeout(() => {
      for (let i = COUNT - 1; i >= 1; i--) {
        if (!this.form.get('options').get(this.getName(i)).value) {
          this.toggleControl('options.' + this.getName(i), false);
        } else {
          break;
        }
      }
    });
  }

  getName(index: number): string {
    return this.formScheme.fieldsets['options'][index].name;
  }
}
