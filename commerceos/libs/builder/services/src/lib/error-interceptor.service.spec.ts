import { MatSnackBar } from '@angular/material/snack-bar';
import { of, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { ErrorInterceptor } from './error-interceptor.service';

describe('ErrorInterceptor', () => {

  const snackBarSpy = jasmine.createSpyObj<MatSnackBar>('MatSnackBar', ['openFromComponent']);
  const service = new ErrorInterceptor(snackBarSpy);

  it('should be defined', () => {

    expect(service).toBeDefined();

  });

  it('should intercept', () => {

    const reqMock = {
      clone: jasmine.createSpy('clone'),
    };
    const nextMock = {
      handle: jasmine.createSpy('handle'),
    };

    nextMock.handle.and.returnValue(throwError('test error'));

    snackBarSpy.openFromComponent.and.callFake((cmp, data) => {
      snackBarSpy[`data`] = data;

      return null;
    });

    service.intercept(reqMock as any, nextMock).pipe(
      catchError(() => of({})),
    ).subscribe();

    snackBarSpy[`data`].data.retryAction();

    expect(snackBarSpy.openFromComponent).toHaveBeenCalled();
    expect(reqMock.clone).toHaveBeenCalled();

  });

});
