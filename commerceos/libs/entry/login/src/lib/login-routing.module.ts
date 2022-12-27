import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { CountryGuard, PartnerResolver } from '@pe/entry/shared';

import { LoginAsUserLayoutComponent } from './login-as-user-layout/login-as-user-layout.component';
import { LoginRefreshLayoutComponent } from './login-refresh-layout/login-refresh-layout.component';
import { PersonalLoginComponent } from './personal-login/personal-login.component';
import { SocialLoginComponent } from './social-login/social-login.component';

const routes: Routes = [
  {
    path: '',
    component: PersonalLoginComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'refresh',
    component: LoginRefreshLayoutComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'social-login',
    component: SocialLoginComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: 'as-user',
    component: LoginAsUserLayoutComponent,
    resolve: { partner: PartnerResolver },
  },
  {
    path: ':industry',
    children: [
      {
        path: 'app/:app',
        component: PersonalLoginComponent,
        resolve: { partner: PartnerResolver },
        data: { type: 'business' },
      },
      {
        path: ':country',
        data: { type: 'business' },
        canActivateChild: [CountryGuard],
        children: [
          {
            path: '',
            component: PersonalLoginComponent,
            resolve: { partner: PartnerResolver },
            data: { type: 'business' },
          },
          {
            path: ':app',
            children: [
              {
                path: '',
                component: PersonalLoginComponent,
                resolve: { partner: PartnerResolver },
                data: { type: 'business' },
              },
              {
                path: ':fragment',
                component: PersonalLoginComponent,
                resolve: { partner: PartnerResolver },
                data: { type: 'business' },
              },
            ],
          },
        ],
      },
      {
        path: '',
        component: PersonalLoginComponent,
        resolve: { partner: PartnerResolver },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class LoginRoutingModule {}
