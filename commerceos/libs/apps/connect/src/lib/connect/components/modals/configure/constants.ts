import { CommunicationsModule, DevicePaymentsMainComponent } from '../../../../communications';
import { PaymentsModule } from '../../../../payments';
import { PayexCreditcardMainComponent } from '../../../../payments/modules/payex_creditcard';
import { PayexFakturaMainComponent } from '../../../../payments/modules/payex_faktura';
import { SantanderCcpInstallmentMainComponent } from '../../../../payments/modules/santander_ccp_installment';
import { ShopsystemsModule } from '../../../../shopsystems';
import { ApiMainComponent } from '../../../../shopsystems/modules/api/components';
import { DandomainMainComponent } from '../../../../shopsystems/modules/dandomain/components';
import { DefaultPluginMainComponent } from '../../../../shopsystems/modules/default-plugin/components';

import { ConfigureThirdPartyComponent } from './third-party/third-party.component';

export const modalComponents = {
  communications: {
    'device-payments': DevicePaymentsMainComponent,
    twilio: ConfigureThirdPartyComponent,
    qr: ConfigureThirdPartyComponent,
    default: ConfigureThirdPartyComponent,
  },

  payments: {
    santander_ccp_installment: SantanderCcpInstallmentMainComponent,
    payex_creditcard: PayexCreditcardMainComponent,
    payex_faktura: PayexFakturaMainComponent,
    default: ConfigureThirdPartyComponent,
  },

  shopsystems: {
    api: ApiMainComponent,
    dandomain: DandomainMainComponent,

    magento: DefaultPluginMainComponent,
    presta: DefaultPluginMainComponent,
    shopware: DefaultPluginMainComponent,
    jtl: DefaultPluginMainComponent,
    oxid: DefaultPluginMainComponent,
    xt_commerce: DefaultPluginMainComponent,
    plentymarkets: DefaultPluginMainComponent,
    woo_commerce: DefaultPluginMainComponent,

    default: ConfigureThirdPartyComponent,
  },

  default: ConfigureThirdPartyComponent,
};

export const modalModules = {
  payments: PaymentsModule,
  shopsystems: ShopsystemsModule,
  communications: CommunicationsModule,
  default: CommunicationsModule,
};
