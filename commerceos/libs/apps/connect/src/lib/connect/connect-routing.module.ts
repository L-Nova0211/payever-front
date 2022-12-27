import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import { i18nDomains } from '../shared';

import {
  ListLayoutComponent,
  ListCommonComponent,
  MainLayoutComponent,
} from './components';
import { ClosePopupTpmComponent } from './components/close-popup-tpm/close-popup-tpm.component';
import { IntegrationRedirectGuard } from './guards';
import { OAuthRedirectGuard } from './guards/oauth-redirect.guard';


const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: i18nDomains,
    },
    children: [
      {
        path: '',
        component: ListLayoutComponent,
        children: [
          {
            path: '',
            component: ListCommonComponent,
          },
          {
            path: 'welcome',
            canActivate: [IntegrationRedirectGuard],
          },
        ],
      },
      {
        path: 'close-popup-tpm',
        component: ClosePopupTpmComponent,
      },
      {
        path: ':category/integrations/:name/install',
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/integrations/:name/done',
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/integrations/:name/fullpage',
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/integrations/:name/reviews',
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/integrations/:name/write-review',
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/integrations/:name/version-history',
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/configure/:name',
        component: ListCommonComponent,
        canActivate: [IntegrationRedirectGuard],
      },
      {
        path: ':category/configure/:name/default',
        component: ListCommonComponent,
        canActivate: [IntegrationRedirectGuard],
      },
    ],
  },
];

export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
  providers: [OAuthRedirectGuard],
})
export class ConnectRoutingModule { }
