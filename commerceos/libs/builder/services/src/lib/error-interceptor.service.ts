import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { PebEditorSnackbarErrorComponent } from './snackbar-error/snackbar-error.component';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {

  constructor(
    private snackBar: MatSnackBar,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((error: HttpErrorResponse) => {
        this.snackBar.openFromComponent(PebEditorSnackbarErrorComponent, {
          verticalPosition: 'top',
          panelClass: ['mat-snackbar-error-container'],
          data: {
            retryAction: () => req.clone(),
            text: 'Something went wrong',
          },
        });

        return throwError(error);
      }),
    );
  }
}
