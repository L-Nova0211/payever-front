import { Injectable } from '@angular/core';
import { AbstractControl, ValidatorFn } from '@angular/forms';
import { isPossiblePhoneNumber, validatePhoneNumberLength } from 'libphonenumber-js';

import { DynamicFormService } from './dynamic-form.service';

@Injectable()
export class CustomValidatorsService {

  constructor(
    private dynamicFormService: DynamicFormService
  ) {}

  get countryCode(): string {
    return this.dynamicFormService.countryPhoneCode$.value;
  }

  phone(): ValidatorFn {
    return (control: AbstractControl) => {
      let value = control.value || '';

      if (this.countryCode && !this.phoneHasCountryCode(value)) {
        value = `${this.countryCode}${value}`
      }

      if (control.value && !isPossiblePhoneNumber(value)) {
        const startString = this.countryCode || '+';
        const isStart = value.startsWith(startString);

        const reason = !isStart ? 'INVALID_START' : validatePhoneNumberLength(value || '');

        return { [reason]: !isStart ? { prefix: startString } : true };
      }

      return null;
    }
  }

  private phoneHasCountryCode(value: string): boolean {
    return value.startsWith(this.countryCode);
  }
}
