import { isPlatformBrowser } from '@angular/common';
import { HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Inject, Injectable, Optional, PLATFORM_ID } from '@angular/core';

import { APP_TYPE, AppType, PE_ENV, EnvironmentConfigInterface } from '@pe/common';

@Injectable()
export class CustomerTokenInterceptor implements HttpInterceptor {

  constructor(
    @Inject(PLATFORM_ID) private platformId: string,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Optional() @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (isPlatformBrowser(this.platformId)) {
      const token = localStorage.getItem(`${this.appType}_auth_token`);

      if (req.url.startsWith(this.env.backend[this.appType]) && token) {
        return next.handle(req.clone({
          setHeaders: {
            Authorization: `Bearer ${token}`,
          }
        }));
      }
    }

    return next.handle(req);
  }
}
