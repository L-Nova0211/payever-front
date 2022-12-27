import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PebShopGuard } from './guards/shop.guard';
import { ShopThemeGuard } from './guards/theme.guard';
import { PebShopComponent } from './routes/_root/shop-root.component';
import { PebShopDashboardComponent } from './routes/dashboard/shop-dashboard.component';
import { PebShopEditorRouteModule } from './routes/editor/shop-editor.module';
import { PebShopSettingsComponent } from './routes/settings/shop-settings.component';

export function shopEditorRoute() {
  return PebShopEditorRouteModule;
}

const routes: Routes = [
  {
    path: '',
    component: PebShopComponent,
    canActivate: [PebShopGuard],
    children: [
      {
        path: ':shopId',
        canActivate:[ShopThemeGuard],
        children: [
          {
            path: '',
            pathMatch: 'full',
            redirectTo: 'dashboard',
          },
          {
            path: 'dashboard',
            component: PebShopDashboardComponent,
          },
          {
            path: 'edit',
            loadChildren: shopEditorRoute,
          },
          {
            path: 'settings',
            component: PebShopSettingsComponent,

          },
          {
            path: 'themes',
            loadChildren: () => import('./routes/themes/shop-themes.module').then(m => m.PebShopThemesModule),
          },
          {
            path: 'builder/:themeId/edit',
            loadChildren: shopEditorRoute,
          },
        ],
      },
    ],
  },
];

// // HACK: fix --prod build
// // https://github.com/angular/angular/issues/23609
export const routerModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [routerModuleForChild],
  exports: [RouterModule],
  providers: [
    ShopThemeGuard,
  ],
})
export class PebShopRouteModule { }
