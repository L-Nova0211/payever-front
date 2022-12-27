import { HttpBackend } from '@angular/common/http';
import { APP_INITIALIZER, Provider } from '@angular/core';

import { PE_ENV } from '@pe/common';

import { environment } from '../environments/environment';

export const CosEnvProvider: Provider = {
  provide: PE_ENV,
  useValue: {},
};

export const CosEnvInitializer: Provider = {
  provide: APP_INITIALIZER,
  deps: [HttpBackend, PE_ENV],
  multi: true,
  useFactory: function initEnv(httpBackend, env) {
    return () => Object.assign(env, environment.apis);
  },
};
