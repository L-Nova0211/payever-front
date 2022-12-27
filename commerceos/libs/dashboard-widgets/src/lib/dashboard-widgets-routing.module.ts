import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { WidgetsLayoutComponent } from './widgets';


const routes: Routes = [
  {
    path: '',
    component: WidgetsLayoutComponent,
    canActivate: [ TranslationGuard ],
    data: {
      i18nDomains: ['commerceos-app', 'commerceos-widgets-app'],
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class DashboardWidgetsRoutingModule { }
