import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { TranslationGuard } from '@pe/i18n';

import {
  CheckoutFullModalComponent,
  CheckoutLayoutComponent,
  ConnectAppEditComponent,
  CheckoutWrapperDirectLinkComponent,
  QRIntegrationComponent,
  CheckoutClipboardCopyComponent,
  WelcomeDetailsComponent,
  WelcomePaymentsComponent,
  SectionsModalComponent,
  LayoutComponent,
  ThirdPartyComponent,
  MarketingAppComponent,
  PanelCheckoutComponent,
  PanelPaymentOptionsComponent,
  PanelConnectComponent,
  PanelChannelsComponent,
  PanelSectionsComponent,
  PanelSettingsComponent,
} from './components';
import { CheckoutPanelModalType } from './interfaces';
import {
  CheckoutResolver,
  CurrentCheckoutResolver,
  ResetCacheResolver,
} from './resolvers';

export const routes: Routes = [
  {
    path: '',
    canActivate: [
      TranslationGuard,
    ],
    resolve: {
      resetCache: ResetCacheResolver,
    },
    data: {
      i18nDomains: [
        'commerceos-app',
        'checkout-app',
        'commerceos-checkout-app',
        'finexp-app',
        'connect-integrations',
        'ng-kit-ng-kit',
      ],
    },
    children: [
      {
        path: '',
        component: LayoutComponent, // CheckoutInfoBoxComponent,
        resolve: {
          checkoutData: CheckoutResolver,
        },
        // pathMatch: 'full',
        children: [
          {
            path: '',
            redirectTo: 'current',
            pathMatch: 'full',
          },
          {
            path: ':checkoutUuid',
            canActivate: [CurrentCheckoutResolver],
            component: CheckoutLayoutComponent,
            children: [
              {
                path: '',
                redirectTo: 'panel-checkout',
                pathMatch: 'full',
              },
              {
                path: 'panel-shopsystems',
                redirectTo: 'panel-channels',
                pathMatch: 'full',
              },
              {
                path: 'panel-accountings',
                redirectTo: 'panel-connect',
                pathMatch: 'full',
              },
              {
                path: 'panel-communications',
                redirectTo: 'panel-connect',
                pathMatch: 'full',
              },
              {
                path: 'view', // TODO Why we can get here?
                redirectTo: 'panel-checkout',
                pathMatch: 'full',
              },
              {
                path: 'delete',
                redirectTo: 'panel-settings',
              },
              {
                path: 'settings/:modal',
                component: PanelSettingsComponent,
              },
              {
                path: 'wrapper-direct-link',
                component: CheckoutWrapperDirectLinkComponent,
              },
              {
                path: 'wrapper-direct-link/qr',
                component: QRIntegrationComponent,
              },
              {
                path: 'wrapper-direct-link/clipboard-copy',
                component: CheckoutClipboardCopyComponent,
              },
              {
                path: 'panel-checkout',
                component: PanelCheckoutComponent,
              },
              {
                path: 'panel-checkout/qr',
                component: PanelCheckoutComponent,
                data: {
                  modal: CheckoutPanelModalType.QR,
                },
              },
              {
                path: 'panel-checkout/clipboard-copy',
                component: PanelCheckoutComponent,
                data: {
                  modal: CheckoutPanelModalType.ClipboardCopy,
                },
              },
              {
                path: 'panel-payments',
                component: PanelPaymentOptionsComponent,
              },
              {
                path: 'panel-channels',
                component: PanelChannelsComponent,
              },
              {
                path: 'panel-connect',
                component: PanelConnectComponent,
              },
              {
                path: 'panel-edit',
                component: PanelSectionsComponent,
              },
              {
                path: 'panel-settings',
                component: PanelSettingsComponent,
              },

              {
                path: 'welcome',
                redirectTo: 'welcome/details',
                pathMatch: 'full',
              },
              {
                path: 'welcome/details',
                component: WelcomeDetailsComponent,
              },
              {
                path: 'welcome/payments',
                component: WelcomePaymentsComponent,
              },
              {
                path: 'connect-app-edit/:category/:integrationName',
                component: ConnectAppEditComponent,
              },
              {
                path: ':panel',
                component: CheckoutFullModalComponent,
              },
              {
                path: ':panel/thirdPartyIntegration/:integrationName', // TODO Remove
                component: ThirdPartyComponent,
              },
            ],
          },
          {
            path: ':checkoutUuid/channels',
            children: [
              {
                path: 'shop-app',
                component: PanelChannelsComponent,
              },
              {
                path: 'pos-app',
                component: PanelChannelsComponent,
              },
              {
                path: 'qr-app',
                component: PanelChannelsComponent,
              },
              {
                path: 'marketing-app',
                component: MarketingAppComponent,
              },
            ],
          },
          {
            path: ':checkoutUuid/channels',
            loadChildren: () => import('@pe/finexp-app').then(
              m => m.FinexpModule,
            ),
            canActivate: [TranslationGuard],
            data: {
              i18nDomains: ['finexp-app'],
            },
          },
          // {
          //  path: 'connect',
          //  component: ConnectMicroAppComponent
          // },
          {
            path: ':checkoutUuid/sections/edit',
            component: SectionsModalComponent,
          },
        ],
      },
    ],
  },
];

// HACK: fix --prod build
// https://github.com/angular/angular/issues/23609
export const RouterModuleForChild = RouterModule.forChild(routes);

@NgModule({
  imports: [RouterModuleForChild],
  exports: [RouterModule],
})
export class CheckoutRoutingModule {
}
