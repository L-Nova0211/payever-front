import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { PeAuthService } from '@pe/auth';
import { CosMessageBus } from '@pe/base';
import {
  PebActualEditorWs,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
} from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService } from '@pe/builder-core';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { AppType, APP_TYPE, EnvService, MessageBus, PebTranslateService, PE_ENV } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeCommonHeaderService } from '@pe/header';
import { TranslateService, TranslationGuard } from '@pe/i18n';
import { PE_MEDIA_CONTAINER } from '@pe/media';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';

import {
  BUILDER_MEDIA_API_PATH,
  PEB_INVOICE_API_COMMON_PATH,
  PEB_INVOICE_API_PATH,
  PEB_INVOICE_BUILDER_API_PATH,
  PEB_INVOICE_HOST,
  PE_CONTACTS_HOST,
  PE_INVOICE_CONTAINER,
} from './constants';
import { PeInvoiceHeaderService } from './invoice-header.service';
import { CosInvoiceRootComponent } from './root/cos-invoice-root.component';
import { PeInvoiceApi } from './services/abstract.invoice.api';
import { PeActualInvoiceEditor } from './services/actual.invoice-editor.api';
import { ActualPebInvoiceThemesApi } from './services/actual.invoice-themes.api';
import { ActualPeInvoiceApi } from './services/actual.invoice.api';
import { BusinessResolver } from './shared/resolvers/business.resolver';

const routes: Route[] = [
  {
    path: '',
    component: CosInvoiceRootComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: [
        'commerceos-grid-app',
        'commerceos-themes-app',
        'commerceos-products-list-app',
        'commerceos-products-editor-app',
        'commerceos-products-import-app',
        'commerceos-invoice-app',
      ],
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./invoice.module').then(m => m.PeInvoiceModule),
      },
    ],
  },
];

@NgModule({
  imports: [CommonModule, PePlatformHeaderModule, RouterModule.forChild(routes), PeSimpleStepperModule],
  declarations: [CosInvoiceRootComponent],
  providers: [
    PeInvoiceHeaderService,
    PeCommonHeaderService,
    BackgroundActivityService,
    PeDataGridService,
    PeActualInvoiceEditor,
    ActualPeInvoiceApi,
    BusinessResolver,
    PeAlertDialogService,
    ThemesApi,
    PebContextService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: PebThemesApi,
      useClass: ActualPebInvoiceThemesApi,
    },
    {
      provide: PebEditorApi,
      useClass: PeActualInvoiceEditor,
    },
    {
      provide: PE_OVERLAY_DATA,
      useValue: { },
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMedia,
    },
    {
      provide: PeInvoiceApi,
      useClass: ActualPeInvoiceApi,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebTranslateService,
      useExisting: TranslateService,
    },
    {
      provide: PebEditorWs,
      deps: [
        [new Optional(), new SkipSelf(), PebEditorWs],
        PEB_EDITOR_WS_PATH,
        PebEditorAuthTokenService,
        PebEnvService,
      ],
      useFactory: (editorWs, path, tokenService, envService) => {
        if (!editorWs) {
          return new PebActualEditorWs(path, tokenService, envService);
        }

        return editorWs;
      },
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: PE_INVOICE_CONTAINER,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PEB_INVOICE_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.invoice + '/api',
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.invoice + '/api',
    },
    {
      provide: PEB_INVOICE_BUILDER_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PEB_INVOICE_API_COMMON_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.common,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoiceWs,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderInvoice,
    },
    {
      provide: PE_CONTACTS_HOST,
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: PEB_INVOICE_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.invoiceHost,
    },
    {
      provide: 'PE_CONTACTS_HOST',
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [PE_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'invoice',
    },
    {
      provide: 'PE_ACCESS_TOKEN',
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => authService.token,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [
        BackgroundActivityService,
        PEB_EDITOR_API_PATH,
      ],
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Invoice,
    },
  ],
})
export class CosNextInvoiceModule { }
