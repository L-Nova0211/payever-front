import { ConfigConfigInterface } from './config-config.interface';
import { ConnectConfigInterface } from './connect-config.interface';
import { CustomConfigInterface } from './custom-backend-config.interface';
import { NodeJsBackendConfigInterface } from './node-js-backend-config.interface';
import { NodeJsFrontendConfigInterface } from './node-js-frontend-config.interface';
import { NodeJsPaymentsConfigInterface } from './node-js-payments-config.interface';
import { NodeJsThirdPartyConfigInterface } from './node-js-third-party-config.interface';
import { PhpConfigInterface } from './php-config.interface';
import { PrimaryConfigInterface } from './primary-config.interface';

export interface EnvironmentConfigInterface {
  custom: CustomConfigInterface;
  config: ConfigConfigInterface;
  primary: PrimaryConfigInterface;
  php: PhpConfigInterface;
  connect: ConnectConfigInterface;
  backend: NodeJsBackendConfigInterface;
  frontend: NodeJsFrontendConfigInterface;
  thirdParty: NodeJsThirdPartyConfigInterface;
  payments: NodeJsPaymentsConfigInterface;
}
