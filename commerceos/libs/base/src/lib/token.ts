import { InjectionToken } from '@angular/core';

import { PeAuthService } from '@pe/auth';

export const PE_AUTH_TOKEN = new InjectionToken<string>('TEMPORARY TOKEN');

// eslint-disable-next-line import/namespace
export const authTokenFactory = (authService: PeAuthService) => {
  return authService.token;
  // localStorage.getItem('pe_auth_token');
}
