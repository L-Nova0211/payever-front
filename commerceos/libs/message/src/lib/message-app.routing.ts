import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import {
  PeMessageConnectRootComponent,
  PeMessageChannelRootComponent,
  PeMessageInviteRootComponent,
  PeMessagePermissionsRootComponent,
} from './components';
import { PeMessageGroupRootComponent } from './components/group';
import { PeMessageGuardRoles } from './enums';
import { RolesGuard } from './guards/roles.guard';
import { PeMessageAppComponent } from './message-app.component';
import { PeMessageContactsModule } from './modules';
import { PeMessageConnectModule } from './modules/connect';
import { PeMessageProductsModule } from './modules/products';

function loadEditorModule() {
  return import('./modules/editor/message-editor.module').then(m => m.PeMessageEditorModule);
}

function loadIntegrationModule() {
  return import('./modules/integration/integration.module').then(m => m.PeIntegrationModule);
}

function loadContactsModule() {
  return PeMessageContactsModule;
}

function loadConnectModule() {
  return PeMessageConnectModule;
}

function loadProductsModule() {
  return PeMessageProductsModule;
}

const data = {
  allowedRoles: [PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin],
};

const routes: Routes = [
  {
    path: '',
    component: PeMessageAppComponent,
    canActivateChild: [RolesGuard],
    children: [
      {
        path: 'integration',
        loadChildren: loadIntegrationModule,
        data,
      },
      {
        path: 'connect',
        component: PeMessageConnectRootComponent,
        data,
      },
      {
        path: 'channel',
        component: PeMessageChannelRootComponent,
        data,
      },
      {
        path: 'invite',
        component: PeMessageInviteRootComponent,
        data,
      },
      {
        path: ':chatId/permissions',
        component: PeMessagePermissionsRootComponent,
        data,
      },
      {
        path: 'group',
        component: PeMessageGroupRootComponent,
        data,
      },
      {
        path: 'editor',
        loadChildren: loadEditorModule,
        data,
      },
      {
        path: 'contacts',
        loadChildren: loadContactsModule,
        data,
      },
      {
        path: 'products',
        loadChildren: loadProductsModule,
        data,
      },
      {
        path: 'connect-app',
        loadChildren: loadConnectModule,
        data,
      },
    ],
  },
  {
    path: ':chatId',
    component: PeMessageAppComponent,
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class PeMessageAppRouteModule { }
