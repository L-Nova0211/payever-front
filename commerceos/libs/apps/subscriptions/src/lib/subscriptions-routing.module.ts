import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeBuilderEditorRoutingPathsEnum } from '@pe/common';
import { TranslationGuard } from '@pe/i18n-core';

import {
  PeSubscriptionsConnectComponent,
  PeSubscriptionsProgramsComponent,
  PeSubscriptionsSettingsComponent,
} from './components';
import { PeSubscriptionsRoutingPathsEnum } from './enums';
import { PeSubscriptionsNetworkGuard, PeSubscriptionsThemesGuard } from './guards';
import { PeSubscriptionsPlanResolver } from './resolvers';
import { PeSubscriptionsComponent } from './subscriptions.component';

const builderEditorModule = () => import('@pe/editor').then(m => m.PeBuilderEditorModule);

const routes: Routes = [
  {
    path: '',
    component: PeSubscriptionsComponent,
    canActivate: [PeSubscriptionsNetworkGuard, TranslationGuard],
    data: {
      i18nDomains: ['commerceos-subscriptions-app'],
    },
    children: [
      {
        path: PeSubscriptionsRoutingPathsEnum.Application,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: PeBuilderEditorRoutingPathsEnum.Dashboard,
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.BuilderEditor,
            loadChildren: builderEditorModule,
            canActivate: [PeSubscriptionsThemesGuard],
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.BuilderTheme,
            loadChildren: builderEditorModule,
            canActivate: [PeSubscriptionsThemesGuard],
          },
          {
            path: PeSubscriptionsRoutingPathsEnum.Connect,
            component: PeSubscriptionsConnectComponent,
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.Dashboard,
            loadChildren: () => import('@pe/dashboard').then(m => m.PeBuilderDashboardModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: ['commerceos-domains-lib'],
            },
          },
          {
            path: PeSubscriptionsRoutingPathsEnum.Plan,
            component: PeSubscriptionsProgramsComponent,
            resolve: {
              plan: PeSubscriptionsPlanResolver,
            },
            data: {
              isDetailsView: true,
            },
          },
          {
            path: PeSubscriptionsRoutingPathsEnum.Programs,
            loadChildren: () => import('./components/programs/programs.module')
              .then(m => m.PeSubscriptionsProgramsModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-folders-app',
                'commerceos-grid-app',
                'commerceos-media-app',
              ],
            },
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.Settings,
            component: PeSubscriptionsSettingsComponent,
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: ['commerceos-domains-lib'],
            },
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.Themes,
            loadChildren: () => import('@pe/themes').then(m => m.PebThemesModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-folders-app',
                'commerceos-grid-app',
                'commerceos-media-app',
                'commerceos-themes-app',
              ],
            },
          },
        ],
      },
    ],
  },
];

@NgModule({
  exports: [RouterModule],
  imports: [RouterModule.forChild(routes)],
  providers: [
    PeSubscriptionsNetworkGuard,
    PeSubscriptionsThemesGuard,
  ],
})
export class PeSubscriptionsRoutingModule { }
