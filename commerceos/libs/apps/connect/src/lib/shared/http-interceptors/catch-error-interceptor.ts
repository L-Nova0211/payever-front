import { HttpErrorResponse, HttpEvent, HttpInterceptor, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { cloneDeep, isString } from 'lodash-es';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ErrorInterface {
  [propName: string]: string | ErrorInterface;
}

export interface ResponseErrorsInterface {
  code: number;
  errors: ErrorInterface;
  message: string;
  rawError: any;
}

@Injectable()
export class CatchErrorInterceptor implements HttpInterceptor {

  readonly maxMessageLength: number = 128;

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((err: HttpErrorResponse) => {
          return throwError(this.processError(err));
        })
      );
  }

  processError(err: HttpErrorResponse): ResponseErrorsInterface {
    let result: ResponseErrorsInterface = err.error;
    result.rawError = cloneDeep(err.error);
    if (isString(err.error)) {
      result = <ResponseErrorsInterface>({
        message: String(err.error),
      });
    }
    else if (!result) {
      result = <ResponseErrorsInterface>({});
    }

    if (!result.code) {
      result.code = err.status || 400;
    }
    if (!result.message) {
      result.message = err.message || 'Unknown error';
    }
    if (result.message.length > this.maxMessageLength) {
      result.message = `${result.message.substr(0, this.maxMessageLength).trim()}...`;
    }
    if (!result.errors) {
      result.errors = {};
    }
    result.message = this.stripTags(result.message);

    return result;
  }

  stripTags(html: string) {
    const div = document.createElement('div');
    div.innerHTML = html;

    return div.textContent || div.innerText || html;
  }
}
