import { HttpClient } from '@angular/common/http';
import { Injectable, Injector } from '@angular/core';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigInterface, NodeJsBackendConfigInterface, PE_ENV } from '../../environment-config';
import { AppSetUpStatusEnum, MicroAppInterface } from '../types';

import { MicroRegistryService } from './micro-registry.service';

@Injectable()
export class AppSetUpService {

  protected httpClient: HttpClient = this.injector.get(HttpClient);
  protected envConfig: EnvironmentConfigInterface = this.injector.get(PE_ENV);

  constructor(private injector: Injector) {
  }

  setStatus(businessId: string, appName: string, status: AppSetUpStatusEnum): Observable<void> {
    const backendConfig: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${backendConfig.commerceos}/api/apps/business/${businessId}/toggle-installed/${appName}`;

    return this.httpClient.patch<void>(url, { installed: true, setupStatus: status });
  }

  setStep(businessId: string, appName: string, step: string): Observable<void> {
    const backendConfig: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${backendConfig.commerceos}/api/apps/business/${businessId}/app/${appName}/change-setup-step`;

    return this.httpClient.patch<void>(url, { setupStep: step });
  }

  getStatusAndStep(businessId: string, appName: string, microRegistryService: MicroRegistryService):
   Observable<{status: AppSetUpStatusEnum, step: string}>  {
    const backendConfig: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${backendConfig.commerceos}/api/apps/business/${businessId}`;
    const app: MicroAppInterface = microRegistryService.getMicroConfig(appName) as MicroAppInterface;
    if (app) {
      return of({ status: app.setupStatus, step: app.setupStep });
    }

    return this.httpClient.get(url).pipe(map((apps: MicroAppInterface[]) => {
      const currentApp: MicroAppInterface = apps.find((app: MicroAppInterface) => app.code === appName);

      return currentApp && { status: currentApp.setupStatus, step: currentApp.setupStep };
    }));
  }

  // Added one more the same function, but this function doesn't use cache data from microRegistryService,
  // because this service isn't true global service and we can recieve outdated data
  getStatusAndStepFromBackend(businessId: string, appName: string): Observable<{status: AppSetUpStatusEnum, step: string}>  {
    const backendConfig: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${backendConfig.commerceos}/api/apps/business/${businessId}`;

    return this.httpClient.get(url).pipe(map((apps: MicroAppInterface[]) => {
      const currentApp: MicroAppInterface = apps.find((app: MicroAppInterface) => app.code === appName);

      return currentApp && { status: currentApp.setupStatus, step: currentApp.setupStep };
    }));
  }

  getStatus(businessId: string, appName: string, microRegistryService: MicroRegistryService): Observable<AppSetUpStatusEnum>  {
    return this.getStatusAndStep(businessId, appName, microRegistryService).pipe(map(a => a && a.status));
  }

  getStep(businessId: string, appName: string, microRegistryService: MicroRegistryService): Observable<string>  {
    return this.getStatusAndStep(businessId, appName, microRegistryService).pipe(map(a => a && a.step));
  }
}
