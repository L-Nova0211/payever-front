import { HttpClient } from '@angular/common/http';
import { APP_INITIALIZER, InjectionToken, Provider } from '@angular/core';

export const COS_ENV = new InjectionToken<{
  custom: {
    translation: string;
  }
}>('COS_ENV');

export const CosEnvProvider: Provider = {
  provide: COS_ENV,
  useValue: {},
};

export const CosEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpClient, COS_ENV],
  multi: true,
  useFactory: function initEnv(http, env) {
    return () => http.get('/env.json')
      .toPromise()
      .then(result => Object.assign(env, result));
  },
};
