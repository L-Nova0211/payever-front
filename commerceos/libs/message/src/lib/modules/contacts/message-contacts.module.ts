import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { APP_TYPE, AppType } from '@pe/common';
import { I18nModule } from '@pe/i18n';

import { PeSharedModule } from '../shared';

import { PeMessageContactsRootComponent } from './message-contacts-root.component';

export const routes: Routes = [
  {
    path: '',
    component: PeMessageContactsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/apps/contacts').then(m => m.ContactsModule),
      },
    ],
  },
  {
    path: ':mode',
    component: PeMessageContactsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/apps/contacts').then(m => m.ContactsModule),
      },
    ],
  },
];

export const PeContactsRouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  declarations: [
    PeMessageContactsRootComponent,
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
    {
      provide: APP_TYPE,
      useValue: AppType.Contacts,
    },
  ],
})
export class PeMessageContactsModule {}
