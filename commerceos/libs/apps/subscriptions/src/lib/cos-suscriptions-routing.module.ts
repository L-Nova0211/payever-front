import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslationGuard } from '@pe/i18n-core';

import { PeSubscriptionsEnvGuard } from './guards';
import { CosSubscriptionsRootComponent } from './root';

const routes: Routes = [
  {
    path: '',
    component: CosSubscriptionsRootComponent,
    canActivate: [
      PeSubscriptionsEnvGuard,
      TranslationGuard,
    ],
    children: [
      {
        path: '',
        loadChildren: () => import('./subscriptions.module').then(m => m.PeSubscriptionsModule),
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
  providers: [PeSubscriptionsEnvGuard],
})
export class CosSubscriptionsRoutingModule { }
