import { Observable } from 'rxjs';

import {
  ConnectConfigInterface,
  CustomConfigInterface,
  EnvironmentConfigInterface,
  NodeJsBackendConfigInterface,
  NodeJsFrontendConfigInterface,
  PhpConfigInterface,
  PrimaryConfigInterface,
} from '@pe/common';

export interface EnvironmentConfigServiceInterface {
  addConfig(data: {}): void;
  getConfig(): EnvironmentConfigInterface;
  getConfig$(): Observable<EnvironmentConfigInterface>;
  getNodeJsBackendConfig(): NodeJsBackendConfigInterface;
  getBackendConfig(): NodeJsBackendConfigInterface;
  getFrontendConfig(): NodeJsFrontendConfigInterface;
  getCustomConfig(): CustomConfigInterface;
  getConnectConfig(): ConnectConfigInterface;
  getPhpConfig(): PhpConfigInterface;
  getPrimaryConfig(): PrimaryConfigInterface;
}
