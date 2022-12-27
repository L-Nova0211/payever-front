import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeBuilderEditorRoutingPathsEnum } from '@pe/common';
import { TranslationGuard } from '@pe/i18n-core';

import { PeAppointmentsComponent } from './appointments.component';
import { PeAppointmentsRoutingPathsEnum } from './enums';
import { PeAppointmentsNetworkGuard, PeAppointmentsThemesGuard } from './guards';

const builderEditorModule = () => import('@pe/editor').then(m => m.PeBuilderEditorModule);

const routes: Routes = [
  {
    path: '',
    component: PeAppointmentsComponent,
    canActivate: [PeAppointmentsNetworkGuard, TranslationGuard],
    data: {
      i18nDomains: ['commerceos-appointments-app'],
    },
    children: [
      {
        path: PeAppointmentsRoutingPathsEnum.Application,
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: PeBuilderEditorRoutingPathsEnum.Dashboard,
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
            path: PeBuilderEditorRoutingPathsEnum.BuilderEditor,
            loadChildren: builderEditorModule,
            canActivate: [PeAppointmentsThemesGuard],
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.BuilderTheme,
            loadChildren: builderEditorModule,
            canActivate: [PeAppointmentsThemesGuard],
          },
          {
            path: PeAppointmentsRoutingPathsEnum.Calendar,
            loadChildren: () => import('./components/calendar/calendar.module')
              .then(m => m.PeAppointmentsCalendarModule),
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
            path: PeAppointmentsRoutingPathsEnum.Availability,
            loadChildren: () => import('./components/availability/availability.module')
              .then(m => m.PeAppointmentsAvailabilityModule),
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
            path: PeAppointmentsRoutingPathsEnum.Types,
            loadChildren: () => import('./components/types/types.module')
              .then(m => m.PeAppointmentsTypesModule),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: [
                'commerceos-folders-app',
                'commerceos-grid-app',
              ],
            },
          },
          {
            path: PeBuilderEditorRoutingPathsEnum.Settings,
            loadChildren: () => import('./components/settings/settings.module')
              .then(m => m.PeAppointmentsSettingsModule),
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
      PeAppointmentsNetworkGuard,
      PeAppointmentsThemesGuard,
    ],
})
export class PeAppointmentsRoutingModule { }
