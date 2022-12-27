import { AbstractControl } from '@angular/forms';

const urlSegmentRegExp = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9]){0,1}$/;
const leadingZerosRegExp = (value: string) => value.length > 1 ? /^0+/.test(value) : false;

export class PeCustomValidators {
  // Domain name validator
  static DomainName = (subdomains?: boolean) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const regExp = subdomains
        ? /^(?!.* .*)(?:[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]$/
        : urlSegmentRegExp;

      return !control.value || (control.value.length < 3 && regExp.test(control.value))
        ? { minLengthDomainName: true }
        : !regExp.test(control.value)
          ? { incorrectDomainName: true }
          : null;
    }
  }

  // Array length validator
  static MinArrayLength = (min: number) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const valid = control.value.length >= min;

      return valid
        ? null
        : { minLengthArray: true };
    }
  }

  // Positive number validator
  static PositiveNumber = (min: number, greater?: boolean) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const value = control.value
        ? control.value.toString()
        : control.value;
      const valid = !value
        || !value.includes(' ')
        && !leadingZerosRegExp(value)
        && value === Number(value).toString()
        && (greater ? Number(value) > min : Number(value) >= min);

      return valid
        ? null
        : { notPositiveNumber: true };
    }
  }

  // Positive integer validator
  static PositiveInteger = (min: number, greater?: boolean) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const value = control.value
        ? control.value.toString()
        : control.value;
      const valid = !value
        || !value.includes(' ')
        && !leadingZerosRegExp(value)
        && Number.isInteger(Number(value))
        && (greater ? Number(value) > min : Number(value) >= min);

      return valid
        ? null
        : { notPositiveInt: true };
    }
  }

  // Url segment validator
  static SegmentOfUrl = (minLength = 0, maxLength = 60) => {
    return (control: AbstractControl): { [key: string]: boolean } => {
      const value = control.value ?? '';

      return value.length < minLength && urlSegmentRegExp.test(value)
        ? { minSegmentLength: true }
        : value.length > 0 && !urlSegmentRegExp.test(value)
          ? { incorrectSegmentName: true }
          : value.length > maxLength
            ? { maxSegmentLength: true }
            : null;
    }
  }
}
