import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PePickerComponent } from './picker';

export const PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PePickerDirective),
  multi: true,
};

@Directive({
  selector: 'pe-picker[formControlName], pe-picker[formControl], pe-picker[ngModel]',
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [PICKER_VALUE_ACCESSOR],
})
export class PePickerDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PePickerComponent) {}
  writeValue(value: any): void {
    this.host.pickedItems = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
