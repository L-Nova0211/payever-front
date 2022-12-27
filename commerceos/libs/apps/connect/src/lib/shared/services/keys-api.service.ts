import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

import { AuthTokenInterface } from '../../shared';

@Injectable()
export class KeysApiService {
  constructor(
    protected http: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvInterface,
  ) {}

  getPluginApiKeys(business: string, name: string): Observable<string[]> {
    let url = `${this.config().plugins}/api/business/${business}/shopsystem/type/${name}/api-key`;
    if (name === 'commercetools' || name === 'ccvshop' || name === 'shopify') {
      url = `${this.envConfig.thirdParty['plugins']}/api/business/${business}/shopsystem/type/${name}/api-key`;
    }

    return this.http.get<string[]>(url);
  }

  addPluginApiKey(business: string, name: string, keyId: string): Observable<AuthTokenInterface> {
    const data = {
      id: keyId,
    };
    let url = `${this.config().plugins}/api/business/${business}/shopsystem/type/${name}/api-key`;
    if (name === 'commercetools' || name === 'ccvshop' || name === 'shopify') {
      url = `${this.envConfig.thirdParty['plugins']}/api/business/${business}/shopsystem/type/${name}/api-key`;
    }

    return this.http.post<AuthTokenInterface>(url, data);
  }

  removeOAuthKey(business: string, id: string): Observable<void> {
    // We don't need to remove from plugins will delete by rabbit message
    return this.http.delete<void>(`${this.config().auth}/oauth/${business}/clients/${id}`);
  }

  getOAuthKeyDetails(business: string, keys: string[]): Observable<AuthTokenInterface[]> {
    return this.http.get<AuthTokenInterface[]>(`${this.config().auth}/oauth/${business}/clients`, {
      params: {
        'clients[]': keys,
      },
    });
  }

  createOAuthKey(business: string, keyName: string): Observable<AuthTokenInterface> {
    return this.http.post<AuthTokenInterface>(`${this.config().auth}/oauth/${business}/clients`, {
      name: keyName,
      redirectUri: '',
    });
  }

  private config(): NodeJsBackendConfigInterface {
    return this.envConfig.backend;
  }
}
