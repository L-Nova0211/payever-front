import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { ApiModule } from './modules/api/api.module';
import { DandomainModule } from './modules/dandomain/dandomain.module';
import { DefaultPluginModule } from './modules/default-plugin/default-plugin.module';
import { ShopifyModule } from './modules/shopify/shopify.module';

// https://github.com/ng-packagr/ng-packagr/issues/1285#issuecomment-527196671
export function GetApiModule() {
  return ApiModule;
}
export function GetShopifyModule() {
  return ShopifyModule;
}
export function GetDandomainModule() {
  return DandomainModule;
}
export function GetDefaultPluginModule() {
  return DefaultPluginModule;
}

const routes: Routes = [
  {
    path: 'api',
    loadChildren: GetApiModule,
  },
  {
    path: 'shopify',
    loadChildren: GetShopifyModule,
  },
  {
    path: 'dandomain',
    loadChildren: GetDandomainModule,
  },

  {
    path: 'magento',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'presta',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'shopware',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'jtl',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'oxid',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'xt_commerce',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'plentymarkets',
    loadChildren: GetDefaultPluginModule,
  },
  {
    path: 'woo_commerce',
    loadChildren: GetDefaultPluginModule,
  },
  // Now we use TPM instead
  // {
  //   path: ':name',
  //   loadChildren: GetDefaultPluginModule
  // }
];

export const ShopsystemsRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [ShopsystemsRouterModuleForChild],
  exports: [RouterModule],
})
export class ShopsystemsRoutingModule {}
