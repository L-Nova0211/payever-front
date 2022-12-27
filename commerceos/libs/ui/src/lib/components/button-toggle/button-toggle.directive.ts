import { ChangeDetectorRef, Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebButtonToggleComponent } from './button-toggle';

export const BUTTONTOGGLE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebButtonToggleDirective),
  multi: true,
};

@Directive({
  selector: 'peb-button-toggle[formControlName], peb-button-toggle[formControl], peb-button-toggle[ngModel]',
  host: { '(changed)': 'onChange($event)', '(blur)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [BUTTONTOGGLE_VALUE_ACCESSOR],
})
export class PebButtonToggleDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebButtonToggleComponent, private cdr: ChangeDetectorRef) {}
  writeValue(obj: any): void {
    this.host.checked = obj;
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
