import { AbstractControl, ValidatorFn } from '@angular/forms';
import moment from 'moment';

export function afterFromDateValidator(dateFrom): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const isBefore = moment(control.value, 'DD.MM.YYYY').isBefore(moment(dateFrom, 'DD.MM.YYYY'));

    return isBefore ? { afterFromDate: !isBefore } : null;
  };
}
