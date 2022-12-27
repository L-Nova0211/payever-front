import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { InjectionToken, NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { DragulaModule } from 'ng2-dragula';

import { PebEnvService } from '@pe/builder-core';
import { MessageBus, EnvService, PE_ENV, NavigationService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { TranslationGuard } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebEnvironmentService } from '@pe/shared/env-service';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosProductsRootComponent } from './root/products-root.component';
import { CosMessageBus } from './services/message-bus.service';
import { PeProductsHeaderService } from './services/products-header.service';
import { TokenInterceptor } from './token.interceptor';

const PEB_INVOICE_HOST = new InjectionToken<string>('PEB_INVOICE_HOST');
const PE_CONTACTS_HOST = 'PE_CONTACTS_HOST';

const routes: Route[] = [
  {
    path: '',
    component: CosProductsRootComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: [
        'commerceos-products-list-app',
        'commerceos-products-editor-app',
        'commerceos-products-import-app',
        'commerceos-grid-app',
      ],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./products.module').then(m => m.ProductsModule),
      },
    ],
  },
];
@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PeSimpleStepperModule,
    MediaModule,
    DragulaModule.forRoot(),
  ],
  declarations: [CosProductsRootComponent],
  providers: [
    PeProductsHeaderService,
    NavigationService,
    PeDataGridService,
    PebEnvironmentService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PEB_INVOICE_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.invoiceHost,
    },
    {
      provide: PE_CONTACTS_HOST,
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})
export class CosProductsModule {}
