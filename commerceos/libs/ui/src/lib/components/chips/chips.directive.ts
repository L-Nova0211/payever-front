import { ChangeDetectorRef, Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebChipsComponent } from './chips';

export const CHIPS_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebChipsDirective),
  multi: true,
};

@Directive({
  selector: 'peb-chips-list[formControlName], peb-chips-list[formControl], peb-chips-list[ngModel]',
  host: { '(changed)': 'onChange($event)', '(blured)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [CHIPS_VALUE_ACCESSOR],
})
export class PebChipsDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebChipsComponent, private cdr: ChangeDetectorRef) {}
  writeValue(value: any): void {
    if (value !== null) {
      if (Array.isArray(value) && !this.host.value.find(val => val === value[0])) {
        this.host.value = [...this.host.value, ...value];
      } else if (!Array.isArray(value)) {
        this.host.value = [...this.host.value, value];
      }
    }
    this.cdr.markForCheck();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.host.disabled = isDisabled;
    this.cdr.markForCheck();
  }
}
