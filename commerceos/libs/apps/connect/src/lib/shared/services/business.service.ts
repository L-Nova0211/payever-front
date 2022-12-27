import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable } from 'rxjs';

import { BusinessState } from '@pe/business';
import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

import { UserBusinessDataInterface, UserBusinessInterface } from '../interfaces';

@Injectable({
  providedIn: 'root',
})
export class BusinessService {
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    private http: HttpClient,
  ) {}

  getUserBusinessesList(): Observable<UserBusinessDataInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.connect}/api/business/${this.businessId}/integration?businessData=true`;

    return this.http.get<UserBusinessDataInterface>(url);
  }

  saveUserBusinesses(businessId: string, data: UserBusinessInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(`${config.users}/api/business/${businessId}`, data);
  }
}
