import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

// TODO: this interceptor is to remove tokens when requesting an asset.
// need remove the matIconSvg in filters (pe-data-grid)
@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    if (request.url.split('/')?.includes('assets')) {

      request = request.clone({
        setHeaders: {
          Authorization: ``,
        },
      });
    }

    return next.handle(request);
  }
}
