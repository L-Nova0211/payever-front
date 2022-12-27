
import { SimpleChanges, OnChanges, Directive, Inject } from '@angular/core';

@Directive({ selector: 'validatorBase' })
export class DateValidatorDirective implements OnChanges {
  private inputs: string[];

  onChange: () => void;

  constructor(@Inject([]) ...inputs: string[]) {
    this.inputs = inputs;
  }

  registerOnValidatorChange(fn: () => void): void {
    this.onChange = fn;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.inputs.some(input => input in changes) && this.onChange) {
      this.onChange();
    }
  }
}
