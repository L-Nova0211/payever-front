import { Directive, forwardRef, HostListener } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

import { PeHelpfulService } from '@pe/common';

import { PebProductPickerComponent } from './product-picker';

export const PRODUCT_VALUE_ACCESSOR: any = {
  provide: NG_VALUE_ACCESSOR,
  useExisting: forwardRef(() => PebProductPickerDirective),
  multi: true,
};

@Directive({
  selector: 'peb-product-picker[formControlName], peb-product-picker[formControl], peb-product-picker[ngModel]',
  providers: [PRODUCT_VALUE_ACCESSOR],
})
export class PebProductPickerDirective implements ControlValueAccessor {
  @HostListener('changed', ['$event'])
  onChange = (_: any) => {};

  @HostListener('touched')
  @HostListener('click')
  onTouched = () => {};

  constructor(
    private host: PebProductPickerComponent,
    private peHelpfulService: PeHelpfulService
  ) {}

  writeValue(value: any): void {
    this.host.addedItems = value || [];
    this.host.addedItems = this.host.addedItems.map(item => {
      if (item.image) {
        this.peHelpfulService.isValidImgUrl(item.image).then((res) => {
          if (res.status !== 200) {
            this.host.cdr.detectChanges();
          }
        });
      }

      return item;
    });

    this.host.cdr.detectChanges();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }
}
