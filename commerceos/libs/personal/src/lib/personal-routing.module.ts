import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoaderOffGuard } from '@pe/base';
import { DockerGuard } from '@pe/docker';
import { ActivateUserLangGuard, TranslationGuard } from '@pe/i18n';
import { PersonalGuard } from '@pe/shared/personal';
import { PersonalWallpaperGuard } from '@pe/wallpaper';
import { ZendeskGuard } from '@pe/zendesk';

import { PersonalDashboardLayoutComponent, PersonalLayoutComponent } from './components';
import { PersonalAppRegistryGuard } from './guards';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'info/overview',
  },
  {
    path: 'info/overview',
    component: PersonalDashboardLayoutComponent,
    canActivate: [
      PersonalWallpaperGuard,
      PersonalAppRegistryGuard,
      ActivateUserLangGuard,
      ZendeskGuard,
      LoaderOffGuard,
      PersonalGuard,
      DockerGuard,
    ],
    canDeactivate: [ZendeskGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/dashboard-widgets').then(m => m.DashboardWidgetsModule),
      },
    ],
  },
  {
    path: '',
    component: PersonalLayoutComponent,
    canActivate: [
      PersonalWallpaperGuard,
      PersonalAppRegistryGuard,
      ActivateUserLangGuard,
      LoaderOffGuard,
      PersonalGuard,
    ],
    children: [
      {
        path: 'info/edit',
        loadChildren: () => import('@pe/search-dashboard').then(m => m.SearchDashboardModule),
      },
    ],
  },

  {
    path: 'transactions',
    loadChildren: () => import('@pe/apps/transactions').then(m => m.AppsTransactionsModule),
    canActivate: [PersonalWallpaperGuard, PersonalAppRegistryGuard, LoaderOffGuard, PersonalGuard, TranslationGuard],
    data: {
      i18nDomains: [
        'commerceos-transactions-integration',
        'commerceos-transactions-app',
        'commerceos-transactions-values-app',
        'commerceos-rules-app',
        'commerceos-folders-app',
      ],
      app: {
        name: 'Transactions',
        icon: '#icon-apps-orders',
      },
    },
  },
  {
    path: 'settings',
    loadChildren: () => import('@pe/apps/settings').then((m) => {
      return m.CosNextSettingsModule;
    }),
    canActivate: [PersonalWallpaperGuard, PersonalAppRegistryGuard, LoaderOffGuard, PersonalGuard, TranslationGuard],
    data: {
      app: {
        name: 'Settings',
        icon: '#icon-apps-settings',
      },
    },
  },
  {
    path: 'message',
    loadChildren: () => import('@pe/apps/message').then(m => m.CosMessageModule),
    data: {
      i18nDomains: [
        'commerceos-welcome-app',
        'commerceos-rules-app',
        'commerceos-themes-app',
        'commerceos-message-personal-app',
        'commerceos-grid-app',
        'commerceos-ui-feature',
      ],
    },
    canActivate: [TranslationGuard, DockerGuard],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PEPersonalRoutingModule { }
