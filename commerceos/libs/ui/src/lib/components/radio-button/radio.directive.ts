import { ChangeDetectorRef, Directive, forwardRef, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { RadioButtonComponent } from './radio';

export const RADIO_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => RadioButtonDirective),
  multi: true,
};

@Directive({
  selector: 'peb-radio[formControlName], peb-radio[formControl], peb-radio[ngModel]',
  host: { '(changed)': 'onChange($event)', '(touched)': 'onTouched()', '(click)': 'onTouched()' },
  providers: [RADIO_VALUE_ACCESSOR],
})
export class RadioButtonDirective implements ControlValueAccessor {
  onChange = (_: any) => {};
  onTouched = () => {};

  constructor(private host: RadioButtonComponent, private renderer: Renderer2, private cdr: ChangeDetectorRef) {}
  writeValue(value: any): void {
    this.host.checked = value === this.host.value;

    if (this.host.inputViewChild && this.host.inputViewChild.nativeElement) {
      this.renderer.setProperty(this.host.inputViewChild, 'checked', this.host.checked);
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
