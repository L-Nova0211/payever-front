import {
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { Inject, Injectable, Optional } from '@angular/core';
import { Observable } from 'rxjs';

import { PE_ENV } from '@pe/common';

@Injectable()
export class SandboxTokenInterceptor implements HttpInterceptor {

  get token() {
    return localStorage.getItem('TOKEN')?.trim();
  }

  constructor(@Optional() @Inject(PE_ENV) private env) {
  }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const TOKEN = this.token;
    if (TOKEN && req.url.indexOf(this.env.custom.cdn) === -1) {
      return next.handle(req.clone({
        setHeaders: {
          Authorization: `Bearer ${TOKEN}`,
        },
      }));
    }

    return next.handle(req);
  }
}
