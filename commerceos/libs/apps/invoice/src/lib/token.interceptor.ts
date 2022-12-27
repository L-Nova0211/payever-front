import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(private authService: PeAuthService) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.token || localStorage.getItem('TOKEN');

    return next.handle(
      req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }),
    );
  }
}