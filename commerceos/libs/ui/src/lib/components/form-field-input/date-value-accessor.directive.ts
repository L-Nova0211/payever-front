import { Directive, ElementRef, forwardRef, Input, Renderer2 } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import moment from 'moment';

export const DATE_VALUE_ACCESSOR = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => DateValueAccessorDirective),
  multi: true,
};

@Directive({
  selector:
    'input[type="datetime"][formControlName],input[type="datetime"][formControl],input[type="datetime"][ngModel]',
  host: { '(input)': 'onChange($event.target.value)', '(blur)': 'onTouched()' },
  providers: [DATE_VALUE_ACCESSOR],
})
export class DateValueAccessorDirective implements ControlValueAccessor {
  @Input() min = 0;
  @Input() max?: number;
  @Input() format = 'DD.MM.YYYY';

  onChange = (_: any) => {};

  onTouched = () => {};

  constructor(private renderer: Renderer2, private elementRef: ElementRef) {}

  writeValue(value: number): void {
    const normalizedValue = value == null ? '' : value;
    this.renderer.setProperty(this.elementRef.nativeElement, 'value', normalizedValue);
  }

  registerOnChange(fn: (_: number | null) => void): void {
    this.onChange = (value) => {
      fn(value === '' ? null : parseFloat(value));
    };
  }

  onFocusOut() {
    const value = this.elementRef.nativeElement.value;
    if (value) {
      const date = moment(value, this.format);
      if (!date.isValid()) {
        this.elementRef.nativeElement.value = moment.unix(0).format(this.format);
      }
    }
    this.onTouched();
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.renderer.setProperty(this.elementRef.nativeElement, 'disabled', isDisabled);
  }
}
