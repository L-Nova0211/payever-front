import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { I18nModule } from '@pe/i18n';

import { PeSharedModule } from '../shared';

import { PeMessageConnectRootComponent } from './message-connect-root.component';

export const routes: Routes = [
  {
    path: '',
    component: PeMessageConnectRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/apps/connect').then(m => m.ConnectModule),
      },
    ],
  },
];

export const PeConnectRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    PeMessageConnectRootComponent,
  ],
  imports: [
    CommonModule,
    I18nModule,
    PeSharedModule,

    PeConnectRouterModuleForChild,
  ],
  exports: [],
  providers: [
    PeAuthService,
  ],
})
export class PeMessageConnectModule {}
