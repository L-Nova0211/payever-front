import { ChangeDetectorRef, Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PebSelectComponent } from './select';

@Directive({
  selector: 'peb-select[formControlName], peb-select[formControl], peb-select[ngModel]',
  host: { '(changed)': 'onChange($event)', '(blur)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => PebSelectDirective),
      multi: true,
    },
  ],
})
export class PebSelectDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PebSelectComponent, private cdr: ChangeDetectorRef) {}

  writeValue(obj: any): void {
    this.host.selected = obj;
    this.host.selectedChanged$.next(this.host.selected);
    this.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState?(isDisabled: boolean): void {
    this.host.disabled = isDisabled;
  }
}
