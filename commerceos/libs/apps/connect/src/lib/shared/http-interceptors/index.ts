import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Provider } from '@angular/core';

import { CatchErrorInterceptor } from './catch-error-interceptor';
export { ResponseErrorsInterface } from './catch-error-interceptor';

/** Http interceptor providers in outside-in order */
export const httpInterceptorProviders: Provider[] = [
  {
    provide: HTTP_INTERCEPTORS,
    useClass: CatchErrorInterceptor,
    multi: true,
  },
];
