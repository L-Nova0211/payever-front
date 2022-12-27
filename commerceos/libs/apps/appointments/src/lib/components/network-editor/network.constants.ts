import { PeListSectionIntegrationInterface } from '@pe/ui';

import { PeAppointmentsNetworkEditorComponent } from './network-editor.component';

export const PE_APPOINTMENTS_NETWORKS_SETTINGS_LIST: PeListSectionIntegrationInterface[] = [
  {
    component: PeAppointmentsNetworkEditorComponent,
    icon: 'business',
    title: 'appointments-app.network_editor.title',
  },
];
