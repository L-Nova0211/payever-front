import { PortalModule as CdkPortalModule } from '@angular/cdk/portal';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { ApmModule, ApmService } from '@elastic/apm-rum-angular';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';
import { NgxIndexedDBModule } from 'ngx-indexed-db';

import { PeAlertDialogModule } from '@pe/alert-dialog';
import {
  BUILDER_MEDIA_API_PATH,
  MediaService,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PebActualEditorApi,
  PebActualEditorWs,
  PebActualShopsApi,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebShopsApi,
  PebThemesApi,
  PRODUCTS_API_PATH,
  PEB_PRODUCTS_API_PATH,
} from '@pe/builder-api';
import { PebContextApi, PebContextService } from '@pe/builder-context';
import { CompanyContext } from '@pe/builder-context';
import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { APP_TYPE, AppType, EnvService, MessageBus, PE_ENV } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { MEDIA_ENV, MediaService as _MediaService } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';

import { SandboxMockBackend } from '../dev/editor.api-local';
import { PebMockContextApi } from '../dev/editor.context-local';
import { MockEditorDatabaseConfig } from '../dev/editor.idb-config';
import { SandboxMockEditorWs } from '../dev/editor.ws-local';
import { SandboxDBService } from '../dev/sandbox-idb.service';
import { SandboxTranslateService } from '../dev/sandbox-translate.service';
import { environment } from '../environments/environment';

import { PeEnvInitializer, PeEnvProvider } from './env.provider';
import { SandboxAddPageToThemeDialog } from './root/dialogs/add-page-to-theme/add-page-to-theme.dialog';
import { SandboxAddThemeFromThemesDialog } from './root/dialogs/add-theme-from-themes/add-theme-from-themes.dialog';
import { SandboxCloneThemeDialog } from './root/dialogs/clone-theme/clone-theme.dialog';
import { SandboxViewerSelectionDialog } from './root/dialogs/viewer-selection.dialog';
import { SandboxFrontRoute } from './root/front.route';
import { SandboxRootComponent } from './root/root.component';
import { SandboxTokenInterceptor } from './sandbox-token.interceptor';
import { SandboxEnv } from './sandbox.env';
import { SandboxRouting } from './sandbox.routing';
import { PlatformHeaderService } from './shared/services/app-platform-header.service';
import { SandboxMessageBus } from './shared/services/message-bus.service';
import { SandboxSettingsDialog } from './shared/settings/settings.dialog';


@NgModule({
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    HttpClientModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatSnackBarModule,
    CdkPortalModule,
    SandboxRouting,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production }),
    ServiceWorkerModule.register('image-upload.worker.js', { registrationStrategy: 'registerImmediately' }),
    NgxIndexedDBModule.forRoot(MockEditorDatabaseConfig),
    FormsModule,
    ReactiveFormsModule,
    NgxsModule.forRoot([], { developmentMode: !environment.production }),
    NgxsStoragePluginModule.forRoot({
      key: 'editorState',
    }),
    NgxsReduxDevtoolsPluginModule.forRoot(),
    I18nModule.forRoot({ useStorageForLocale: true }),
    PeAlertDialogModule,
    ApmModule,
  ],
  declarations: [
    SandboxRootComponent,
    SandboxFrontRoute,
    SandboxSettingsDialog,
    SandboxViewerSelectionDialog,
    SandboxAddThemeFromThemesDialog,
    SandboxAddPageToThemeDialog,
    SandboxCloneThemeDialog,
  ],
  providers: [
    SnackbarService,
    _MediaService,
    SandboxDBService,
    TranslateService,
    PeOverlayWidgetService,
    {
      provide: APP_TYPE,
      useValue: AppType.Shop,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: MEDIA_ENV,
      deps: [PE_ENV],
      useFactory: env => env,
    },
    {
      provide: PebEnvService,
      useClass: SandboxEnv,
    },
    {
      provide: EnvService,
      useClass: SandboxEnv,
    },
    {
      provide: PebTranslateService,
      useClass: SandboxTranslateService,
    },
    {
      provide: MessageBus,
      useClass: SandboxMessageBus,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },

    /**
     * Builder API: either SandboxMockBackend or PebEditorApi + BUILDER_API_PATH + PebThemesApi
     */
    {
      provide: PebEditorApi,
      useClass: environment.useMockApi ? SandboxMockBackend : PebActualEditorApi,
    },
    // {
    //   provide: PebShopsApi,
    //   useClass: PebActualShopsApi,
    // },
    {
      provide: PEB_EDITOR_API_PATH,
      // useValue: 'http://localhost:4100/',
      // useValue: 'https://builder-shops.payever.org',
      useValue: 'https://builder-shops.test.devpayever.com',
      // useValue: 'http://37.235.231.145:3000',
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      useValue: 'wss://builder-shops.test.devpayever.com/ws',
    },
    {
      provide: PebEditorWs,
      useClass: environment.useMockApi ? SandboxMockEditorWs : PebActualEditorWs,
    },
    {
      provide: PebThemesApi,
      // useClass: PebActualTerminalThemesApi,
      // useClass: PebActualShopThemesApi,
      useClass: SandboxMockBackend,
    },
    {
      provide:PebShopsApi,
      useClass:PebActualShopsApi,
    },

    /**
     * Context API
     */
    {
      provide: PebContextApi,
      useClass: environment.useMockApi ? PebMockContextApi : PebContextService,
    },
    /**
     * Shops API
     */
    {
      provide: PEB_SHOPS_API_PATH,
      // useValue: 'https://shop-backend.test.devpayever.com/api',
      useValue: 'https://shop-backend.test.devpayever.com/api',
    },

    /**
     * Products API
     */
    {
      provide: PEB_PRODUCTS_API_PATH,
      useValue: 'https://products-backend.test.devpayever.com',
      // useValue: 'https://products-backend.staging.devpayever.com',
    },

    /**
     * Builder media API
     */
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      // useValue: 'https://media.test.devpayever.com',
      useValue: 'https://media.test.devpayever.com',
    },

    {
      provide: BUILDER_MEDIA_API_PATH,
      // useValue: 'https://media.test.devpayever.com',
      useValue: 'https://builder-media.test.devpayever.com',
    },

    /**
     * Other APIs. Need to be made more configurable
     */
    {
      provide: PEB_GENERATOR_API_PATH,
      // useValue: 'https://builder-generator.test.devpayever.com',
      useValue: 'https://builder-generator.staging.devpayever.com',
    },
    {
      provide: PEB_STORAGE_PATH,
      useValue: 'https://payevertesting.blob.core.windows.net',
      // useValue: 'https://payeverstaging.blob.core.windows.net',
    },
    {
      provide: PEB_STUDIO_API_PATH,
      useValue: 'https://studio-backend.test.devpayever.com',
    },
    {
      provide: PRODUCTS_API_PATH,
      useValue: 'https://products-frontend.test.devpayever.com',
      // useValue: 'https://products-frontend.staging.devpayever.com',
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      useValue: null,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'shop',
    },
    {
      provide: 'ContextServices.Company',
      useClass: CompanyContext,
    },
    { provide: PebEditorAuthTokenService, useClass: SandboxTokenInterceptor },
    { provide: HTTP_INTERCEPTORS, useClass: SandboxTokenInterceptor, multi: true },
    BackgroundActivityService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [BackgroundActivityService, PEB_EDITOR_API_PATH],
    },
    PeEnvProvider,
    PeEnvInitializer,
  ],
  bootstrap: [SandboxRootComponent],
})
export class SandboxModule {
  constructor(
    apmService: ApmService,
  ) {
    apmService.init({
      logLevel: 'error',
      serviceName: 'builder-editor-sandbox',
      serverUrl: environment.elasticUrl,
    });
    apmService.observe();
  }
}
