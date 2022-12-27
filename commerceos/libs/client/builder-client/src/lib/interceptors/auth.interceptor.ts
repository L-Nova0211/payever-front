import { isPlatformBrowser } from '@angular/common';
import { HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';

import { PeAuthService } from '@pe/auth';
import { AppType, APP_TYPE, PE_ENV } from '@pe/common';

import { PebClientAuthService } from '../services/auth.service';

@Injectable()
export class PebClientAuthInterceptor implements HttpInterceptor {
  constructor(
    private authService: PeAuthService,
    private authToken: PebClientAuthService,
    @Inject(PLATFORM_ID) private platformId: string,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Optional() @Inject(PE_ENV) private env: any,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (isPlatformBrowser(this.platformId)) {
      const token = this.authToken.token;

      if (req.url.startsWith(this.env.backend[this.appType]) && token) {
        return next.handle(req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          },
        }));
      }

      if (req.url.startsWith(this.env.backend.checkout)) {
        return next.handle(req.clone({
          setHeaders: {
            Authorization: `Bearer ${this.authService.token}`,
          },
        }));
      }
    }

    return next.handle(req);
  }
}
