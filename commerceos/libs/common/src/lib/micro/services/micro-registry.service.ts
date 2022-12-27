import { Injectable, Injector } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, share, take, tap } from 'rxjs/operators';

import { NodeJsBackendConfigInterface } from '../../environment-config';
import { MicroAppInterface } from '../types';

import { BaseMicroService } from './base-micro.service';

/* @deprecated */
@Injectable()
export class MicroRegistryService extends BaseMicroService {

  private buildObservables: { [key: string]: Observable<boolean> } = {};

  constructor(injector: Injector) {
    super(injector);
  }

  getRegisteredMicros(uuid: string): Observable<MicroAppInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.commerceos}/api/apps/business/${uuid}`;

    return this.httpClient.get<MicroAppInterface[]>(url).pipe(
      tap((microApps: MicroAppInterface[]) => {
        this.registry.registered = microApps;
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
  }

  getPersonalRegisteredMicros(): Observable<MicroAppInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.commerceos}/api/apps/user`;

    return this.httpClient.get<MicroAppInterface[]>(url).pipe(
      tap((microApps: MicroAppInterface[]) => {
        this.registry.registered = microApps;
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
  }

  getAdminRegisteredMicros(): Observable<MicroAppInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.commerceos}/api/apps/admin`;

    return this.httpClient.get<MicroAppInterface[]>(url).pipe(
      tap((microApps: MicroAppInterface[]) => {
        this.registry.registered = microApps;
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
  }

  getPartnerRegisteredMicros(): Observable<MicroAppInterface[]> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const url = `${config.commerceos}/api/apps/partner`;

    return this.httpClient.get<MicroAppInterface[]>(url).pipe(
      tap((microApps: MicroAppInterface[]) => {
        this.registry.registered = microApps;
      }),
      catchError((error: any) => {
        return throwError(error);
      })
    );
  }

  getMicroConfig(microCode?: string): MicroAppInterface | MicroAppInterface[] {
    if (!this.registry.registered) {
      this.apmService.apm.captureError('Can not obtain registered apps from local registry');
    }

    const registeredApps: MicroAppInterface[] = this.registry.registered;

    return microCode
      ? registeredApps.find((app: MicroAppInterface) => app.code === microCode)
      : registeredApps;
  }

  loadBuild(micro: MicroAppInterface, forceReload: boolean = false): Observable<boolean> {
    if (forceReload) {
      this.buildObservables[micro.code] = null;
    }

    if (!this.buildObservables[micro.code]) {
      this.buildObservables[micro.code] = this.createBuildObservable(micro, forceReload)
        .pipe(
          take(1),
          share(),
          tap(() => delete this.buildObservables[micro.code])
        );
    }

    return this.buildObservables[micro.code];
  }

  private createBuildObservable(micro: MicroAppInterface, forceReload: boolean = false): Observable<boolean> {
    const url: string = micro.bootstrapScriptUrl;
    if (forceReload) {
      this.registry.scripts[url] = null;
    }

    return this.loadScript(url, micro.code);
  }
}
