import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeBuilderEditorRoutingPathsEnum } from '@pe/common';
import { TranslationGuard } from '@pe/i18n-core';

import { PeAffiliatesComponent } from './affiliates.component';
import {
  PeAffiliatesConnectComponent,
  PeAffiliatesProgramsComponent,
  PeAffiliatesSettingsComponent,
} from './components';
import { PeAffiliatesRoutingPathsEnum } from './enums';
import { PeAffiliatesNetworkGuard, PeAffiliatesThemesGuard } from './guards';
import { PeAffiliatesProgramResolver } from './resolvers';

const builderEditorModule = () => import('@pe/editor').then(m => m.PeBuilderEditorModule);

const routes: Routes = [
  {
    path: '',
    component: PeAffiliatesComponent,
    canActivate: [PeAffiliatesNetworkGuard, TranslationGuard],
    data: {
      i18nDomains: ['commerceos-affiliates-app'],
    },
    children: [
      {
        path: PeAffiliatesRoutingPathsEnum.Application,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: PeBuilderEditorRoutingPathsEnum.Dashboard,
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.BuilderEditor,
            loadChildren: builderEditorModule,
            canActivate: [PeAffiliatesThemesGuard],
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.BuilderTheme,
            loadChildren: builderEditorModule,
            canActivate: [PeAffiliatesThemesGuard],
          },
          {
            path: PeAffiliatesRoutingPathsEnum.Connect,
            component: PeAffiliatesConnectComponent,
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
            path: PeAffiliatesRoutingPathsEnum.Program,
            component: PeAffiliatesProgramsComponent,
            resolve: {
              program: PeAffiliatesProgramResolver,
            },
            data: {
              isDetailsView: true,
            },
          },
          {
            path: PeAffiliatesRoutingPathsEnum.Programs,
            loadChildren: () => import('./components/programs/programs.module').then(m => m.PeAffiliatesProgramsModule),
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
            component: PeAffiliatesSettingsComponent,
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
    PeAffiliatesNetworkGuard,
    PeAffiliatesThemesGuard,
  ],
})
export class PeAffiliatesRoutingModule { }
