import { ModuleWithProviders, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { MessageAppModule } from './components/message-app/message-app.module';
import { ContactsResolver } from './resolver/contacts.resolver';
import {
  PeContactsLayoutComponent,
  PeContactsListComponent,
} from './routes';

function messageAppModule(): any {
  return MessageAppModule;
}

const routes: Routes = [
  {
    path: '',
    component: PeContactsLayoutComponent,
    children: [
      {
        path: '',
        component: PeContactsListComponent,
      },
      {
        path: 'message',
        loadChildren: messageAppModule,
      },
      {
        path: ':contactId/details',
        component: PeContactsListComponent,
        resolve: {
          contact: ContactsResolver,
        },
        data: {
          isDetailsView: true,
        },
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const ROUTER_MODULE_FOR_CHILD: ModuleWithProviders<RouterModule> = RouterModule.forChild(routes);

@NgModule({
  imports: [ROUTER_MODULE_FOR_CHILD],
  exports: [RouterModule],
})
export class ContactsRoutingModule { }
