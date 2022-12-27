import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebCheckboxComponent } from './checkbox';

export const CHECKBOX_CONTROL_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebCheckboxDirective),
  multi: true,
};

@Directive({
  selector: 'peb-checkbox[formControlName], peb-checkbox[formControl], peb-checkbox[ngModel]',
  host: { '(changed)': 'onChange($event.checked)', '(blur)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [CHECKBOX_CONTROL_VALUE_ACCESSOR],
})
export class PebCheckboxDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebCheckboxComponent) {}

  writeValue(value: any): void {
    this.host.checked = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = (value) => {
      fn(value);
    };
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.host.disabled = isDisabled;
    this.host.hostAttrDisabled = isDisabled;
    this.host.hostClassDisabled = isDisabled;
  }
}
