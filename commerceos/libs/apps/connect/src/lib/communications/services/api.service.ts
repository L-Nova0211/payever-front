import { HttpClient } from '@angular/common/http';
import { Injectable, Inject } from '@angular/core';
import { Observable } from 'rxjs';

import {
  PE_ENV, EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface,
} from '@pe/common';

import { SettingsInfoInterface } from '../types';

@Injectable()
export class ApiService {
  constructor(
    protected http: HttpClient,
    @Inject(PE_ENV) private envConfig: EnvInterface
  ) {}

  getSettings(businessId: string, name: string): Observable<SettingsInfoInterface> {
    return this.http.get<SettingsInfoInterface>(`${this.config().devicePayments}/api/v1/${businessId}/settings`);
  }

  saveSettings(businessId: string, name: string, data: SettingsInfoInterface): Observable<void> {
    return this.http.put<void>(`${this.config().devicePayments}/api/v1/${businessId}/settings`, data);
  }

  private config(): NodeJsBackendConfigInterface {
    return this.envConfig.backend;
  }
}
