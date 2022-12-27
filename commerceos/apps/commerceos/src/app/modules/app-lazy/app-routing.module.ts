import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { AuthGuard } from '@pe/auth';
import { LoaderOffGuard } from '@pe/base';
import { TranslationGuard } from '@pe/i18n';
import { BusinessGuard, BusinessListGuard, DefaultBusinessGuard } from '@pe/shared/business';
import { PersonalGuard } from '@pe/shared/personal';
import { UserGuard } from '@pe/shared/user';
import { BusinessWallpaperGuard } from '@pe/wallpaper';

import { LanguageGuard } from '../../guards/language.guard';

import { AppLazyComponent } from './app-lazy.component';

const routes: Routes = [
  {
    path: '',
    component: AppLazyComponent,
    canActivate: [LanguageGuard],
    children: [
      {
        path: 'login',
        canActivate: [LoaderOffGuard, TranslationGuard, BusinessWallpaperGuard],
        data: {
          i18nDomains: ['commerceos-app'],
          noBackgroundBlur: true,
        },
        loadChildren: () => import('@pe/entry/login').then(m => m.LoginModule),
      },
      {
        path: 'access',
        canActivate: [LoaderOffGuard, TranslationGuard, BusinessWallpaperGuard],
        data: {
          i18nDomains: ['commerceos-app'],
          noBackgroundBlur: true,
        },
        loadChildren: () => import('@pe/access').then(m => m.PeAccessModule),
      },
      {
        path: 'password',
        canActivate: [LoaderOffGuard, TranslationGuard],
        data: {
          i18nDomains: ['commerceos-app'],
        },
        loadChildren: () => import('@pe/entry/reset-password').then(m => m.ResetPasswordModule),
      },
      {
        path: 'registration',
        canActivate: [LoaderOffGuard, TranslationGuard],
        data: {
          i18nDomains: ['commerceos-app'],
          noBackgroundBlur: true,
        },
        loadChildren: () => import('@pe/entry/registration').then(m => m.RegistrationModule),
      },
      {
        path: 'second-factor-code',
        canActivate: [LoaderOffGuard, TranslationGuard],
        data: {
          noBackgroundBlur: true,
          i18nDomains: ['commerceos-app'],
        },
        loadChildren: () => import('@pe/second-factor-code').then(m => m.SecondFactorCodeModule),
      },
      {
        path: 'switcher',
        canActivate: [LoaderOffGuard, DefaultBusinessGuard, TranslationGuard, BusinessListGuard, UserGuard],
        loadChildren: () => import('@pe/profile-switcher').then(m => m.ProfileSwitcherModule),
        data: {
          i18nDomains: ['commerceos-app'],
        },

      },
      {
        path: 'business/:slug',
        canActivate: [AuthGuard, LoaderOffGuard, TranslationGuard, UserGuard, BusinessGuard],
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app'],
        },
        loadChildren: () => import('../dashboard/dashboard.module').then(m => m.DashboardModule),
      },
      {
        path: 'personal/:slug',
        loadChildren: () => import('@pe/personal').then(m => m.PEPersonalModule),
        canActivate: [AuthGuard, TranslationGuard, UserGuard, PersonalGuard],
        data: {
          i18nDomains: ['commerceos-app', 'commerceos-widgets-app'],
        },
      },
      {
        path: 'confirmation',
        loadChildren: () => import('@pe/entry/confirmation').then(m => m.EntryConfirmationModule),
      },
      {
        path: 'verification',
        loadChildren: () => import('@pe/entry/verification').then(m => m.EntryVerificationModule),
        canActivate: [TranslationGuard, LoaderOffGuard],
        data: {
          i18nDomains: ['commerceos-app'],
        },
      },
      {
        path: 'message',
        loadChildren: () => import('@pe/invitation').then(m => m.PeMessageInvitationModule),
        canActivate: [TranslationGuard, LoaderOffGuard],
        data: {
          i18nDomains: ['commerceos-app'],
        },
      },
      {
        path: '',
        redirectTo: 'login/refresh',
        pathMatch: 'full',
      },
      {
        path: 'entry/login',
        redirectTo: 'login',
        pathMatch: 'full',
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
