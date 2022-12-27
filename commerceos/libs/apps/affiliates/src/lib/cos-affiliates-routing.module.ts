import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslationGuard } from '@pe/i18n-core';

import { PeAffiliatesEnvGuard } from './guards';
import { CosAffiliatesRootComponent } from './root';

const routes: Routes = [
  {
    path: '',
    component: CosAffiliatesRootComponent,
    canActivate: [
      PeAffiliatesEnvGuard,
      TranslationGuard,
    ],
    children: [
      {
        path: '',
        loadChildren: () => import('./affiliates.module').then(m => m.PeAffiliatesModule),
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
  providers: [PeAffiliatesEnvGuard],
})
export class CosAffiliatesRoutingModule { }
