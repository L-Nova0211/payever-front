import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PosApi } from '../../services/pos/abstract.pos.api';


export function terminalNameAsyncValidator(
  api: PosApi,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors> => {
    if (!control.dirty) {
      return null;
    }

    return api.validatePosName(control.value).pipe(
      map((result: boolean) => result ? null : { unique: true }),
    );
  };
}
