import { HttpBackend, HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, Provider } from '@angular/core';

import { PE_ENV } from '@pe/common';

export const PeEnvProvider: Provider = {
  provide: PE_ENV,
  useValue: {},
};

/** Use HttpBackend as it doesn't wakeup Interceptors */
export const PeEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpBackend, PE_ENV],
  multi: true,
  useFactory: function initEnv(httpBackend, env) {
    const client = new HttpClient(httpBackend);

    return () =>
      client
        .get('/env.json')
        .toPromise()
        .then(result => Object.assign(env, result))
        .catch(err => console.warn('env.json is missing in src/sandbox/src'));
  },
};
