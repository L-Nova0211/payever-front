import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { PeStatisticsComponent } from './routes/_root/statistics-root.component';
import { PeStatisticsGridComponent } from './routes/grid/statistics-grid.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [TranslationGuard],
    component: PeStatisticsComponent,
    data: {
      i18nDomains: ['commerceos-statistics-app'],
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'list',
      },
      {
        path: 'list',
        component: PeStatisticsGridComponent,
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild: any = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [],
})
export class PeStatisticsRouteModule {}
