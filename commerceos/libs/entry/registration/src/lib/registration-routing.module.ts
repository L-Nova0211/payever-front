import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CountryGuard, PartnerResolver } from '@pe/entry/shared';

import { BusinessRegistrationComponent } from './components';
import { RegistrationComponent } from './registration.component';
import { BusinessRegistrationResolver } from './resolvers';


const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'business',
  },
  {
    path: 'personal',
    component: RegistrationComponent,
    data: { type: 'personal' },
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'business',
    resolve: {
      businessRegistrationData: BusinessRegistrationResolver,
    },
    children: [
      {
        path: '',
        component: RegistrationComponent,
        data: { type: 'business' },
        resolve: { partner: PartnerResolver },
      },
      {
        path: 'app/:app',
        component: RegistrationComponent,
        data: { type: 'business' },
        resolve: { partner: PartnerResolver },
      },
      {
        path: 'social',
        component: BusinessRegistrationComponent,
        resolve: { partner: PartnerResolver },
      },
    ],
  },
  {
    path: ':industry',
    resolve: {
      businessRegistrationData: BusinessRegistrationResolver,
    },
    children: [
      {
        path: 'app/:app',
        component: RegistrationComponent,
        data: { type: 'business' },
        resolve: { partner: PartnerResolver },
      },
      {
        path: ':country',
        data: { type: 'business' },
        canActivateChild: [CountryGuard],
        children: [
          {
            path: '',
            component: RegistrationComponent,
            data: { type: 'business' },
            resolve: { partner: PartnerResolver },
          },
          {
            path: ':app',
            children: [
              {
                path: '',
                component: RegistrationComponent,
                data: { type: 'business' },
                resolve: { partner: PartnerResolver },
              },
              {
                path: ':fragment',
                component: RegistrationComponent,
                data: { type: 'business' },
                resolve: { partner: PartnerResolver },
              },
            ],
          },
        ],
      },
      {
        path: '',
        component: RegistrationComponent,
        data: { type: 'business' },
        resolve: { partner: PartnerResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistrationRoutingModule { }
