import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

@Injectable()
export class FullSynchronizationService {
  constructor(
    protected http: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvInterface
  ) {}

  getValue(businessId: string, integrationId: string): Observable<boolean> {
    return this.http.get<boolean>(
      `${this.config().productsSynchronizer}/api/synchronization/business/${businessId}/integration/${integrationId}/settings/status`);
  }

  saveValue(businessId: string, integrationId: string, enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.config().productsSynchronizer}/api/synchronization/business/${businessId}/integration/${integrationId}/settings/${enable ? 'enable' : 'disable'}`, {});
  }

  private config(): NodeJsBackendConfigInterface {
    return this.envConfig.backend;
  }
}
