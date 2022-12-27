import { Directive, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PePickerDataInterface } from '../picker';

import { PeInputPickerComponent } from './input-picker';

export const INPUT_PICKER_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PeInputPickerDirective),
  multi: true,
};

@Directive({
  selector: 'pe-input-picker[formControlName], pe-input-picker[formControl], pe-input-picker[ngModel]',
  providers: [INPUT_PICKER_VALUE_ACCESSOR],
})
export class PeInputPickerDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  @HostListener('changed', ['$event']) onChanged(e: Event) {
    this.onChange(e);
  }

  @HostListener('touched') onTouch() {
    this.onTouched();
  }

  @HostListener('click') onClick(e: Event) {
    this.onTouched();
  }

  constructor(private host: PeInputPickerComponent) {}
  writeValue(value: PePickerDataInterface): void {
    this.host.pickedItem = value || null;
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
