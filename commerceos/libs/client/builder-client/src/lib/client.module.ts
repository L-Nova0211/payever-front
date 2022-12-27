import { CommonModule } from '@angular/common';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { RouterModule } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { NgxsStoragePluginModule } from '@ngxs/storage-plugin';
import { NgxsModule } from '@ngxs/store';

import { PEB_EDITOR_API_PATH } from '@pe/builder-api';
import { PebContextApi, PebContextService } from '@pe/builder-context';
import { getBuilderApiPath } from '@pe/builder-client-helpers';
import { CONTEXT_SERVICES, PebEditorState, PebEnvService } from '@pe/builder-core';
import {
  PebDocumentMakerElement,
  PebGridMakerElement,
  PebSectionMakerElement,
  PebShapeMakerElement,
  PebTextMakerElement,
} from '@pe/builder-elements';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebEditorOptionsState, PebRendererModule, ELEMENT_FACTORIES } from '@pe/builder-renderer';
import { PebBaseEditorState, PebEditorAccessorService, PebEditorStore } from '@pe/builder-services';
import { PebTextActivationService } from '@pe/builder-text-editor';
import { APP_TYPE, AppType, EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { DEFAULT_LOCALE, TranslationLoaderService } from '@pe/i18n-core';
import { SnackbarModule } from '@pe/snackbar';

import { PebClientComponent } from './client.component';
import {
  PebClientNotFoundComponent,
  PebClientPageComponent,
  PebClientPageOverlayComponent,
  PebClientPasswordComponent,
} from './components';
import { LOCALE } from './config';
import { PebClientAuthInterceptor } from './interceptors/auth.interceptor';
import { PebClientCheckoutModule, PebClientProductDetailsModule } from './modules';
import {
  CompanyService,
  PebClientApiService,
  PebClientAuthService,
  PebClientCachedService,
  PebClientContextBuilderService,
  PebClientSeoService,
  PebClientStateService,
  ProductsService,
} from './services';

export const routerModule = RouterModule.forChild([{
  path: '',
  component: PebClientComponent,
  children: [{
    path: '**',
    component: PebClientPageComponent,
  }],
}]);

export function localeFactory() {
  return 'en';
}

export const pebElementSelectionState = NgxsModule.forFeature([PebEditorOptionsState]);

@NgModule({
  declarations: [
    PebClientComponent,
    PebClientNotFoundComponent,
    PebClientPageComponent,
    PebClientPageOverlayComponent,
    PebClientPasswordComponent,
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatDialogModule,
    MatMenuModule,
    MatSnackBarModule,
    ReactiveFormsModule,
    routerModule,

    pebElementSelectionState,
    PebRendererModule,
    PebClientCheckoutModule,
    PebClientProductDetailsModule,
    SnackbarModule,
  ],
  providers: [
    PebClientApiService,
    PebClientAuthService,
    PebClientCachedService,
    PebClientContextBuilderService,
    PebClientSeoService,
    PebClientStateService,
    {
      provide: CONTEXT_SERVICES.company,
      useClass: CompanyService,
    },
    {
      provide: CONTEXT_SERVICES.products,
      useClass: ProductsService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: PebClientAuthInterceptor,
    },
    {
      provide: LOCALE,
      useFactory: localeFactory,
    },
    {
      provide: 'APP_NAME',
      useValue: '',
    },
    {
      provide: 'ContextServices.Integrations',
      useExisting: PebContextService,
    },
    {
      provide: ELEMENT_FACTORIES,
      useValue: {
        document: PebDocumentMakerElement,
        grid: PebGridMakerElement,
        section: PebSectionMakerElement,
        shape: PebShapeMakerElement,
        text: PebTextMakerElement,
      },
    },
    {
      provide: PebEditorState,
      useClass: PebBaseEditorState,
    },
    {
      provide: PebEditorRenderer,
      useFactory: (editorAccessorService: PebEditorAccessorService, apmService: ApmService) => {
        return new PebEditorRenderer(editorAccessorService.renderer, apmService);
      },
      deps: [
        PebEditorAccessorService, ApmService,
      ],
    },
    {
      provide: PebEditorStore,
      useValue: {},
    },
    {
      provide: PebContextApi,
      useClass: PebContextService,
    },
    {
      deps: [APP_TYPE, PE_ENV],
      provide: PEB_EDITOR_API_PATH,
      useFactory: (appType: AppType, env: EnvironmentConfigInterface) => getBuilderApiPath(appType, env),
    },
    {
      provide: PebEnvService,
      useValue: {},
    },
    {
      provide: PebTextActivationService,
      useValue: {},
    },
  ],
})
export class PebClientModule {
  constructor(
    translationLoaderService: TranslationLoaderService,
  ) {
    translationLoaderService.loadTranslations('builder-client', DEFAULT_LOCALE);
  }
}
