import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebColorPickerFormComponent } from './color-picker';

export const COLOR_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebColorPickerFormDirective),
  multi: true,
};

@Directive({
  selector:
    'peb-color-picker-form[formControlName], peb-color-picker-form[formControl], peb-color-picker-form[ngModel]',
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [COLOR_VALUE_ACCESSOR],
})
export class PebColorPickerFormDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebColorPickerFormComponent) {}
  writeValue(value: any): void {
    this.host.color = value;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
