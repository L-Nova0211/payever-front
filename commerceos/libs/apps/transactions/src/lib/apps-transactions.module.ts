import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { AppType, APP_TYPE, NavigationService, PePreloaderService, PreloaderState } from '@pe/common'
import { TranslationGuard } from '@pe/i18n-core';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebMessagesModule } from '@pe/ui';

import { TransactionsDetailsModule } from './details/details.module';
import { TransactionsNextRootComponent } from './routes/root/next-root.component';
import { ApiService } from './services/api.service';
import { TransactionsListService } from './services/list.service';
import { StatusUpdaterService } from './services/status-updater.service';
import { PeTransactionsHeaderService } from './services/transactions-header.service';
import { TransactionsRuleService } from './services/transactions-rules.service';
import { TokenInterceptor } from './token.interceptor';


export function getTransactionDatailsModule() {
  return TransactionsDetailsModule;
}

const routes: Route[] = [
  {
    path: '',
    redirectTo: 'list',
  },
  {
    path: 'list',
    component: TransactionsNextRootComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: [
        'commerceos-grid-app',
      ],
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./routes/list/list.module').then(m => m.PeListModule),
      },
      {
        path: 'details/:uuid',
        outlet: 'details',
        loadChildren: getTransactionDatailsModule,
      },
    ],
  },
];

export const NgxsFeatureModule = NgxsModule.forFeature([PreloaderState]);

@NgModule({
  imports: [
    CommonModule,
    NgxsFeatureModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PebMessagesModule,
  ],
  declarations: [
    TransactionsNextRootComponent,
  ],
  providers: [
    PeTransactionsHeaderService,
    NavigationService,
    ApiService,
    StatusUpdaterService,
    TransactionsListService,
    TransactionsRuleService,
    PePreloaderService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Transactions,
    },
  ],
})
export class AppsTransactionsModule {}
