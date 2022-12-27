import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';

import { BackgroundActivityService } from './background-activity.service';

@Injectable()
export class UploadInterceptorService implements HttpInterceptor {

  constructor(private backgroundActivityService: BackgroundActivityService,
              @Inject(PEB_EDITOR_API_PATH) private editorApiPath: string) {
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const isApiRequest = request.method !== 'GET' && request.url.indexOf(this.editorApiPath) !== -1;
    if (isApiRequest || request.body instanceof FormData) {
      this.backgroundActivityService.addTask();

      return next.handle(request).pipe(
        finalize(() => {
          this.backgroundActivityService.removeTask();
        }));
    }

    return next.handle(request);
  }
}
