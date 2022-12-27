import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebSiteGuard } from './guards/site.guard';
import { PebSiteComponent } from './routes/_root/site.component';
import { PebSiteDashboardComponent } from './routes/dashboard/site-dashboard.component';
import { PebSiteEditorRouteModule } from './routes/editor/site-editor.module';
import { PebSiteSettingsComponent } from './routes/settings/site-settings.component';

export function siteEditorRoute() {
  return PebSiteEditorRouteModule;
}

const routes: Routes = [
  {
    path: '',
    component: PebSiteComponent,
    canActivate: [PebSiteGuard],
    children: [
      {
        path: ':siteId',
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebSiteDashboardComponent,
          },
          {
            path: 'edit',
            loadChildren: siteEditorRoute,
          },
          {
            path: 'settings',
            component: PebSiteSettingsComponent,

          },
          {
            path: 'themes',
            loadChildren: () => import('./routes/theme-grid/theme-grid.module').then(m => m.PebThemeGridModule),
          },
          {
            path: 'builder/:themeId/edit',
            loadChildren: siteEditorRoute,
          },
        ],
      },
    ],
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

// @dynamic
@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PebSiteRouteModule {
}
