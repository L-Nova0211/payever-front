import { Directive } from '@angular/core';
import { AbstractControl, Validators } from '@angular/forms';
import { merge, cloneDeep } from 'lodash-es';

import {
  AddonType,
  AddonInterface,
  InputType,
  FormScheme,
  FormSchemeField,
  FieldSettingsInterface,
  InputSettingsInterface,
} from '@pe/forms';

import { BaseAuthComponent } from '../../../shared/components/base-auth/base-auth.component';

interface FormInterface {
  credentials: {
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
    required: true,
  },
  inputSettings: {
    type: InputType.Text,
    placeholder: 'Vendor name',
  },
  addonAppend: {
    addonType: AddonType.IconButton,
    iconId: 'icon-close-12',
    iconSize: 12,
    onClick: () => {
    },
  },
};

const COUNT = 4;

@Directive()
export abstract class BaseAuthVendorIdsComponent extends BaseAuthComponent<FormInterface> {

  formScheme: FormScheme = {
    fieldsets: {
      credentials: [
        this.prepareFieldset('vendorId0', null,
        { classList: 'col-xs-12 form-fieldset-field-padding-24 no-border-radius' }),
        this.prepareFieldset('vendorId1', { onClick: () => this.onRemove(1) } as any),
        this.prepareFieldset('vendorId2', { onClick: () => this.onRemove(2) } as any),
        this.prepareFieldset('vendorId3', { onClick: () => this.onRemove(3) } as any),
      ],
    },
  };

  private prepareFieldset(name: string, addonAppend: AddonInterface,
    fieldSettings: FieldSettingsInterface = null): FormSchemeField {
    const result: FormSchemeField = merge(cloneDeep(basic), {
      name: name,
      addonAppend: addonAppend || {},
      fieldSettings: fieldSettings || {},
    });
    (result.fieldSettings as FieldSettingsInterface).label =
    this.translateService.translate('categories.payments.form.vendor.label');
    (result.inputSettings as InputSettingsInterface).placeholder =
    this.translateService.translate('categories.payments.form.vendor.placeholder');

    return result;
  }

  createFormDeferred(initialData: FormInterface) {
    const credentials = this.payment.variants[this.paymentIndex].credentials || {};
    const vendorIds = credentials.vendorIds || [];
    this.form = this.formBuilder.group({
      credentials: this.formBuilder.group({
        vendorId0: [vendorIds[0], Validators.required],
        vendorId1: [vendorIds[1], Validators.required],
        vendorId2: [vendorIds[2], Validators.required],
        vendorId3: [vendorIds[3], Validators.required],
      }),
    });

    this.afterCreateFormDeferred();

    setTimeout(() => {
      for (let i = COUNT - 1; i >= 1; i--) {
        if (!this.form.get('credentials').get(this.getName(i)).value) {
          this.toggleControl('credentials.' + this.getName(i), false);
        } else {
          break;
        }
      }
    });
  }

  onSuccess() {}

  getFinalValues(): string[] {
    const result: string[] = [];
    for (let i = 0; i < COUNT; i++) {
      if (this.getControlByName(i).enabled && this.getControlByName(i).value) {
        result.push(this.getControlByName(i).value);
      }
    }

    return result;
  }

  getName(index: number): string {
    return this.formScheme.fieldsets['credentials'][index].name;
  }

  getControlByName(index: number): AbstractControl {
    return this.form.get('credentials').get(this.getName(index));
  }

  onRemove(index: number): void {
    let lastIndex = index;
    for (let i = index + 1; i < COUNT; i++) {
      if (this.getControlByName(i).enabled) {
        this.getControlByName(i - 1).setValue(
          this.getControlByName(i).value
        );
        lastIndex = i;
      }
    }
    this.getControlByName(lastIndex).setValue('');
    this.toggleControl('credentials.' + this.getName(lastIndex), false);
  }

  addOne(): void {
    for (let i = 0; i < COUNT; i++) {
      if (this.form.get('credentials').get(this.getName(i)).disabled) {
        this.toggleControl('credentials.' + this.getName(i), true);
        break;
      }
    }
  }

  isShowAdd(): boolean {
    return this.form.get('credentials').get(this.getName(COUNT - 1)).disabled;
  }
}
