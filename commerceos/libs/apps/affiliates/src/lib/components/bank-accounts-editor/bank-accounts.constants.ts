import { PeListSectionIntegrationInterface } from '@pe/ui';

import { PeAffiliatesBankAccountsEditorComponent } from './bank-accounts-editor.component';

export const PE_BANKS_SETTINGS_LIST: PeListSectionIntegrationInterface[] = [
  {
    component: PeAffiliatesBankAccountsEditorComponent,
    icon: 'bank',
    title: 'affiliates-app.settings.bank_accounts',
  },
];
