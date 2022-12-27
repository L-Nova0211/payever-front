import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslationGuard } from '@pe/i18n-core';

import { PeAppointmentsEnvGuard } from './guards';
import { CosAppointmentsRootComponent } from './root';

const routes: Routes = [
  {
    path: '',
    component: CosAppointmentsRootComponent,
    canActivate: [
      PeAppointmentsEnvGuard,
      TranslationGuard,
    ],
    children: [
      {
        path: '',
        loadChildren: () => import('./appointments.module').then(m => m.PeAppointmentsModule),
      },
    ],
    data: {
      i18nDomains: ['commerceos-builder-app'],
    },
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [PeAppointmentsEnvGuard],
})
export class CosAppointmentsRoutingModule { }
