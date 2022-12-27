import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';


@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private peAuthService: PeAuthService,
  ) { }

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.peAuthService.token || localStorage.getItem('TOKEN');

    if (
      req.url.includes(this.env.backend.appointments)
      || req.url.includes(this.env.backend.builderAppointments)
      || req.url.includes(this.env.backend.contacts)
      || req.url.includes(this.env.backend.products)
    ) {
      return next.handle(req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`,
        },
      }));
    } else {
      return next.handle(req);
    }
  }
}
