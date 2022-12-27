import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { I18nModule } from '@pe/i18n';

import { PeSharedModule } from '../shared';

import { PeMessageProductsRootComponent } from './message-products-root.component';

export const routes: Routes = [
  {
    path: '',
    component: PeMessageProductsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/apps/products').then(m => m.ProductsModule),
        data: {
          i18nDomains: ['commerceos-products-list-app', 'commerceos-products-editor-app', 'data-grid-app'],
          isFromDashboard: true,
        },
      },
    ],
  },
];

export const PeContactsRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    PeMessageProductsRootComponent,
  ],
  imports: [
    CommonModule,
    I18nModule,
    PeSharedModule,

    PeContactsRouterModuleForChild,
  ],
  exports: [],
  providers: [
    PeAuthService,
  ],
})
export class PeMessageProductsModule {}
