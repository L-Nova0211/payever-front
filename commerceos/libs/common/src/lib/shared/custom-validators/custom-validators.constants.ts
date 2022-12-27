import { AbstractControl } from '@angular/forms';

const urlSegmentRegExp = /^[a-zA-Z0-9]([a-zA-Z0-9-]{0,61}[a-zA-Z0-9]){0,1}$/;

// Url segment validator
export const UrlSegment = (minLength = 0, maxLength = 60) => {
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

// Domain name validator
export const DomainName = (subdomains?: boolean) => {
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
export const MinArrayLength = (min: number) => {
  return (control: AbstractControl): { [key: string]: boolean } => {
    const valid = control.value.length >= min;

    return valid
      ? null
      : { minLengthArray: true };
  }
}

// Positive number validator
export const PositiveNumber = (min: number, greater?: boolean) => {
  return (control: AbstractControl): { [key: string]: boolean } => {
    const value = control.value
      ? control.value.toString()
      : control.value;
    const valid = !value
      || !value.includes(' ')
      && value === Number(value).toString()
      && (greater ? Number(value) > min : Number(value) >= min);

    return valid
      ? null
      : { notPositiveNumber: true };
  }
}

// Positive integer validator
export const PositiveInteger = (min: number, greater?: boolean) => {
  return (control: AbstractControl): { [key: string]: boolean } => {
    const value = control.value
      ? control.value.toString()
      : control.value;
    const valid = !value
      || !value.includes(' ')
      && Number.isInteger(Number(value))
      && (greater ? Number(value) > min : Number(value) >= min);

    return valid
      ? null
      : { notPositiveInt: true };
  }
}
