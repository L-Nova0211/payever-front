import { Input, Directive } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { cloneDeep, forEach, isEqual, isArray, isObject } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';

import { FieldSettingsInterface, InputSettingsInterface } from '@pe/forms';

import { BasePaymentFormComponent } from '../base-payment-form.component';

interface FieldInpitSettingsInterface {
  fieldSettings: Observable<FieldSettingsInterface>;
  inputSettings: Observable<InputSettingsInterface>;
}

@Directive()
export abstract class BaseAuthComponent<T> extends BasePaymentFormComponent<T> {

  @Input() paymentIndex = 0;

  startValue: T;
  hideDisabled = false;

  get paymentMethodValue() {
    return this.paymentMethod;
  }

  formStorageKey = 'payment-auth-' + this.paymentMethodValue;

  afterCreateFormDeferred() {
    this.startValue = cloneDeep(this.form.value);
  }

  isStartValueChanged(): boolean {
    return !isEqual(this.removeNulls(cloneDeep(this.startValue)),
    this.removeNulls(cloneDeep(this.form ? this.form.value : {})));
  }

  isDoReset(): boolean {
    return this.isVariantStatusConnected(this.paymentIndex) && !this.isStartValueChanged();
  }

  onSubmit(): void {
    super.onSubmit();
  }

  onSuccess() {}

  protected makeFieldInputSettings$(fieldSettings: FieldSettingsInterface, inputSettings: InputSettingsInterface = {}): FieldInpitSettingsInterface {
    const fieldSettings$: BehaviorSubject<FieldSettingsInterface> = new BehaviorSubject<FieldSettingsInterface>({
      ...fieldSettings,
      readonly: true, // Need to force make work autocomplete="off" in Chrome
    });
    const inputSettings$: BehaviorSubject<InputSettingsInterface> = new BehaviorSubject<InputSettingsInterface>({
      ...inputSettings,
      autocompleteAttribute: 'off', // Doesn't work in chrome but we add anyway
      onFocus: () => {
        fieldSettings$.next({
          ...fieldSettings$.getValue(),
          readonly: false,
        });
      },
    });

    return {
      fieldSettings: fieldSettings$.asObservable(),
      inputSettings: inputSettings$.asObservable(),
    };
  }

  protected onClearCredentials(): void {
    forEach(this.form.controls, (control: any, key: string) => {
      forEach((this.form.get(key) as FormGroup).controls, (innerControl) => {
        innerControl.setValue(null);
      });
    });
    this.startValue = cloneDeep(this.form.value);
    this.setStorageData(null);
    this.isSubmitted = false; // To not highlight as error
  }

  private removeNulls(obj: any): any {
    for (const k in obj) {
      if (obj[k] === null) {
        isArray(obj) ? obj.splice(Number(k), 1) : delete obj[k];
      } else if (isObject(obj[k])) {
        this.removeNulls(obj[k]);
      }
    }

    return obj;
  }
}
