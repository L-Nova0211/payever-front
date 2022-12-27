import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips'
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthModule, PeAuthService } from '@pe/auth';
import {
  PebEditorApi,
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PebEditorWs,
  PEB_EDITOR_WS_PATH,
  PebEditorAuthTokenService, PebActualEditorWs,
} from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService, PebTranslateService } from '@pe/builder-core';
import { PebRendererModule } from '@pe/builder-renderer';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { PeBuilderShareModule } from '@pe/builder-share';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { PebViewerModule } from '@pe/builder-viewer';
import { APP_TYPE, AppType, PE_ENV,MessageBus, EnvService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeHeaderMenuModule } from '@pe/header';
import { TranslateService } from '@pe/i18n';
import { PE_MEDIA_CONTAINER } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';
import { PebMessagesModule } from '@pe/ui';

import { PE_SITE_CONTAINER } from './constants';
import { CosSitesRoutingModule } from './cos-sites-routing.module';
import { SiteEnvGuard } from './env.guard';
import { CosMessageBus } from './services/message-bus.service';
import { PeSiteHeaderService } from './services/site-header.service'
import { CosSitesRootComponent } from './sites-root/sites-root.component';

import {
  AbstractSiteBuilderApi,
  ActualPebSitesEditorApi,
  ActualPebSitesThemesApi,
  PebActualSiteBuilderApi,
  PebActualSitesApi,
  PebSitesApi,
  PEB_SITE_API_BUILDER_PATH,
  PEB_SITE_API_PATH,
  PEB_SITE_HOST,
  SiteEnvService,
} from './';

@NgModule({
  declarations: [
    CosSitesRootComponent,
  ],
  imports: [
    CommonModule,
    CosSitesRoutingModule,
    PebShopEditorModule,
    AuthModule,
    PebViewerModule,
    PePlatformHeaderModule,
    MatChipsModule,
    MatIconModule,
    MatFormFieldModule,
    PebRendererModule,
    MatProgressSpinnerModule,
    PebMessagesModule,
    PeHeaderMenuModule,
    HttpClientModule, // TODO: remove this after all HttpClientModules will be removed from dependencies
    PeBuilderShareModule,
  ],
  providers: [
    SiteEnvGuard,
    PeOverlayWidgetService,
    PeSiteHeaderService,
    BackgroundActivityService,
    PeDataGridService,
    ThemesApi,
    PebContextService,
    {
      provide: EnvService,
      useClass: SiteEnvService,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebEditorApi,
      useClass: ActualPebSitesEditorApi,
    },
    {
      provide: PebThemesApi,
      useClass: ActualPebSitesThemesApi,
    },
    {
      provide: AbstractSiteBuilderApi,
      useClass: PebActualSiteBuilderApi,
    },

    {
      provide: PebTranslateService,
      useExisting: TranslateService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'site',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Site,
    },
    {
      provide: PebSitesApi,
      useClass: PebActualSitesApi,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSiteWs,
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
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },
    {
      provide: PEB_SITE_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.siteHost,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PEB_SITE_API_BUILDER_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PEB_SITE_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.site,
    },
    {
      provide: 'PE_ACCESS_TOKEN',
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => authService.token,
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
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
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: PE_SITE_CONTAINER,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
  ],
})
export class CosSitesModule { }

