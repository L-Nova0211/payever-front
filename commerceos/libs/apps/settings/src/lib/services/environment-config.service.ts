import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import {
  ConfigConfigInterface,
  ConnectConfigInterface,
  CustomConfigInterface,
  EnvironmentConfigInterface,
  NodeJsBackendConfigInterface,
  NodeJsFrontendConfigInterface,
  PhpConfigInterface,
  PrimaryConfigInterface,
} from '@pe/common';

import { EnvironmentConfigServiceInterface } from '../misc/interfaces/environment-config.service.interface';

@Injectable()
export class EnvironmentConfigService implements EnvironmentConfigServiceInterface {

  private V4IP = /^(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])(?:\.(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])){3}$/;
  private config$: BehaviorSubject<EnvironmentConfigInterface> = new BehaviorSubject<EnvironmentConfigInterface>(null);
  constructor(
  ) { }

  addConfig(data: {}): void {
    this.config$.next(data as EnvironmentConfigInterface);
  }

  getConfig(): EnvironmentConfigInterface {
    return this.config$.value;
  }

  getConfig$(): Observable<EnvironmentConfigInterface> {
    return this.config$.asObservable();
  }

  /**
   * @deprecated
   */
  getNodeJsBackendConfig(): NodeJsBackendConfigInterface {
    return this.value().backend;
  }

  getBackendConfig(): NodeJsBackendConfigInterface {
    return this.value().backend;
  }

  getFrontendConfig(): NodeJsFrontendConfigInterface {
    return this.value().frontend;
  }

  getCustomConfig(): CustomConfigInterface {
    return this.value().custom;
  }

  getConfigConfig(): ConfigConfigInterface {
    return this.value().config;
  }

  getConnectConfig(): ConnectConfigInterface {
    return this.value().connect;
  }

  getPhpConfig(): PhpConfigInterface {
    return this.value().php;
  }

  getPrimaryConfig(): PrimaryConfigInterface {
    return this.value().primary;
  }

  isDev(): boolean {
    return location.hostname === 'localhost' || this.V4IP.test(location.hostname);
  }

  private value(): EnvironmentConfigInterface {
    if (this.config$.value === null) {
      console.error('Environment is not configured yet!');
      console.trace();
    }

    return this.config$.value;
  }

}
