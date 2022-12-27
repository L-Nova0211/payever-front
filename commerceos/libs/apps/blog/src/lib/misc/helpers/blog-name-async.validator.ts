import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';


export function blogNameAsyncValidator(
  api: PebBlogsApi,
): AsyncValidatorFn {
  return (control: AbstractControl): Observable<ValidationErrors> => {
    if (!control.dirty) {
      return null;
    }

    return api.validateBlogName(control.value).pipe(
      map((result: boolean) => result ? null : { unique: true }),
    );
  };
}


// export function shopNameAsyncValidator(
//   api: PebShopsApi,
//   cdr: ChangeDetectorRef,
//   currentName?: string,
// ): AsyncValidatorFn {
//   return (control: FormControl) => {
//     return of(control.value).pipe(
//       switchMap((name) => {
//         if (name === currentName) {
//           return of(null);
//         }
//         return api.validateShopName(name).pipe(
//           map(({ result }) => {
//             cdr.markForCheck();
//             return result ? null : { unique: true };
//           }),
//         );
//       }),
//     );
//   };
// }
