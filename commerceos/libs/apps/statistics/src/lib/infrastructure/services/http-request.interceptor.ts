import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';

@Injectable()
export class HttpRequestInterceptor implements HttpInterceptor {
  constructor(private authTokenService: PeAuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const clonedRequest: HttpRequest<any> = req.clone({
      setHeaders: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
        Authorization: `Bearer ${this.authTokenService.token}`,
      },
    });

    return next.handle(clonedRequest);
  }
}
