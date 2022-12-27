import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { SearchBoxContainerComponent } from './components';

const routes: Routes = [
  {
    path: '',
    component: SearchBoxContainerComponent,
    canActivate: [ TranslationGuard],
    data: {
      i18nDomains: ['commerceos-app'],
      useMicroUrlsFromRegistry: true,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchDashboardRoutingModule {}
