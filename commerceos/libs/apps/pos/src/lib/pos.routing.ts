import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebPosGuard } from './guards/pos.guard';
import { PosThemeGuard } from './guards/theme.guard';
import { PebPosComponent } from './routes/_root/pos-root.component';
import { ConnectAppEditComponent } from './routes/connect/connect-app-edit/connect-app-edit.component';
import { PebTerminalConnectComponent } from './routes/connect/pos-connect.component';
import { PebPosDashboardComponent } from './routes/dashboard/pos-dashboard.component';
import { PebPosSettingsComponent } from './routes/settings/pos-settings.component';

const routes: Routes = [
  {
    path: '',
    component: PebPosComponent,
    canActivate: [PebPosGuard],
    children: [
      {
        path: ':posId',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebPosDashboardComponent,
            canActivate:[PosThemeGuard],
            children: [
              {
                path: '',
                loadChildren: () => import('@pe/builder-client').then(m => m.PebClientModule),
              },
            ],
          },
          {
            path: 'connect',
            component: PebTerminalConnectComponent,
          },
          {
            path: 'connect-app-edit/:category/:integrationName',
            component: ConnectAppEditComponent,
          },
          {
            path: 'settings',
            component: PebPosSettingsComponent,

          },
        ],
      },
    ],
  },
];

// // HACK: fix --prod build
// // https://github.com/angular/angular/issues/23609
export const routerModuleForChild = RouterModule.forChild(routes);

// @dynamic
@NgModule({
  imports: [routerModuleForChild],
  exports: [RouterModule],
  providers: [
    PosThemeGuard,
  ],
})
export class PebPosRouteModule { }
