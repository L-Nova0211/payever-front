import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PeAuthCodeComponent } from './auth-code';

export const AUTHDIGITS_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PeAuthCodeDirective),
  multi: true,
};

@Directive({
  selector: 'pe-auth-code[formControlName], pe-auth-code[formControl], pe-auth-code[ngModel]',
  host: { '(changed)': 'onChange($event)', '(blur)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [AUTHDIGITS_VALUE_ACCESSOR],
})
export class PeAuthCodeDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PeAuthCodeComponent) {}
  writeValue(obj: any): void {
    if (obj) {
      for (let i = 0; i < obj.length; i += 1) {
        if (obj.charAt(i)) {
          this.host.digitFormArray.controls[i].patchValue(obj.charAt(i));
        }
      }
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
