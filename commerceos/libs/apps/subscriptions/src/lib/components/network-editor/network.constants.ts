import { PeListSectionIntegrationInterface } from '@pe/ui';

import { PeSubscriptionsNetworkEditorComponent } from './network-editor.component';

export const PE_SUBSCRIPTION_NETWORKS_SETTINGS_LIST: PeListSectionIntegrationInterface[] = [
  {
    component: PeSubscriptionsNetworkEditorComponent,
    icon: 'business',
    title: 'subscriptions-app.network_editor.title',
  },
];
