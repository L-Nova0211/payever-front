import { Directive, HostListener } from '@angular/core';
import { NgControl } from '@angular/forms';

@Directive({
  selector: '[pePhoneInputFilter]',
})
export class PhoneInputFilterDirective {

  private patternInputReplace = /[^\+0-9\(\)\-]/g;
  private duplicatedSymbolsReplace = /\+(?=\++)|\-(?=\-+)|\((?=\(+)|\)(?=\)+)/g;

  constructor(
    private ngControl: NgControl
  ) {
  }

  @HostListener('input', ['$event']) onInput(): void {
    this.mutateValue(this.ngControl.value);
  }

  private mutateValue(value: string = ''): void {
    const filtered: string = this.filterValue(value);
    this.ngControl.control.setValue(filtered, {
      onlySelf: true,
    });
  }

  private filterValue(value: string): string {
    return String(value || '')
      .replace(this.patternInputReplace, '')
      .replace(this.duplicatedSymbolsReplace, '')
      .trim();
  }
}
