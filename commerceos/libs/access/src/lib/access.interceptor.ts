import { HttpErrorResponse, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';

import { catchError } from 'rxjs/operators';
import { PebEditorAuthTokenService } from '@pe/builder-api';

@Injectable()
export class PeAccessInterceptor implements HttpInterceptor {
  constructor(
    private pebEditorAuthTokenService: PebEditorAuthTokenService,
    private router: Router,
  ) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req.clone({
      // setHeaders: { access: this.pebEditorAuthTokenService.access },
      setParams: { access: this.pebEditorAuthTokenService.access },
    })).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 403) {
          this.router.navigate(['/']);
        }

        return throwError(err);
      }),
    );
  }
}
