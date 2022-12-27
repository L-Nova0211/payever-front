import { PeListSectionIntegrationInterface } from '@pe/ui';

import { PeAffiliatesNetworkEditorComponent } from './network-editor.component';

export const PE_SALES_NETWORKS_SETTINGS_LIST: PeListSectionIntegrationInterface[] = [
  {
    component: PeAffiliatesNetworkEditorComponent,
    icon: 'business',
    title: 'affiliates-app.network_editor.title',
  },
];
