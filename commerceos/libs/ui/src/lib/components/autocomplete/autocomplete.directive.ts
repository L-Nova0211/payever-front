import { Directive, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PeAutocompleteComponent } from './autocomplete';

export const AUTOCOMPLETE_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PeAutocompleteDirective),
  multi: true,
};

@Directive({
  selector: 'pe-autocomplete[formControlName], pe-autocomplete[formControl], pe-autocomplete[ngModel]',
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [AUTOCOMPLETE_VALUE_ACCESSOR],
})
export class PeAutocompleteDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: PeAutocompleteComponent) {}
  writeValue(value: any): void {
    // this.host.pickedItems = value || [];
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
