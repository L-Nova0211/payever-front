import { HttpHandler, HttpInterceptor, HttpRequest, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { of } from 'rxjs';
import { tap } from 'rxjs/operators';

import { PebCacheMapService } from './cache.service';

@Injectable()
export class PebCacheInterceptor implements HttpInterceptor {
  constructor(private cache: PebCacheMapService) { }

  intercept(req: HttpRequest<any>, next: HttpHandler) {
    if (!this.isRequestCachable(req)) {
      return next.handle(req);
    }
    const cachedResponse = this.cache.get(req);
    if (cachedResponse !== null) {
      return of(cachedResponse);
    }

    return next.handle(req).pipe(
      tap((event) => {
        if (event instanceof HttpResponse) {
          this.cache.put(req, event);
        }
      }),
    );
  }

  private isRequestCachable(req: HttpRequest<any>) {
    return (req.method === 'GET');
  }
}
