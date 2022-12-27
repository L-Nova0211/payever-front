import { PeListSectionIntegrationInterface } from '@pe/ui';

import {
  PeDomainsConnectExistingDomainComponent,
  PeDomainsPayeverDomainComponent,
  PeDomainsPersonalDomainComponent,
} from './components';

export const PE_DOMAINS_SETTINGS_LIST: PeListSectionIntegrationInterface[] = [
  {
    component: PeDomainsPayeverDomainComponent,
    icon: 'settings-owndomain',
    title: 'domains-lib.payever_domain.title',
  },
  {
    component: PeDomainsPersonalDomainComponent,
    icon: 'settings-owndomain',
    title: 'domains-lib.personal_domain.title',
  },
  {
    component: PeDomainsConnectExistingDomainComponent,
    icon: 'settings-owndomain',
    title: 'domains-lib.existing_domain.title',
  },
];
