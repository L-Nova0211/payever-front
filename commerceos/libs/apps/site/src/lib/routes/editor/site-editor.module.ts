import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';

import {
  MediaService,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PebActualEditorWs,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebThemesApi,
} from '@pe/builder-api';
import { PebContextApi, PebContextService } from '@pe/builder-context';
import { PebEnvService, PebMediaService } from '@pe/builder-core';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { PeBuilderShareModule } from '@pe/builder-share';
import { PebShopEditorModule } from '@pe/builder-shop-editor';
import { APP_TYPE, AppType, PE_ENV } from '@pe/common';
import { I18nModule } from '@pe/i18n';
import { THEMES_API_PATH } from '@pe/themes';

import { PebSiteBuilderViewComponent } from '../../components/builder-view/builder-view.component';
import { PEB_SITE_API_BUILDER_PATH, PEB_SITE_API_PATH, PEB_SITE_HOST } from '../../constants';
import { ActualPebSitesThemesApi } from '../../services/builder/actual.sites-themes.api';
import { PebSitesApi } from '../../services/site/abstract.sites.api';
import { PebActualSitesApi } from '../../services/site/actual.sites.api';

import { PebSiteEditorComponent } from './site-editor.component';


export const routerModule = RouterModule.forChild([
  {
    path: '',
    component: PebSiteEditorComponent,
  },
]);

@NgModule({
  imports: [
    CommonModule,
    PebShopEditorModule,
    routerModule,
    I18nModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatFormFieldModule,
    PeBuilderShareModule,
  ],
  declarations: [
    PebSiteEditorComponent,
    PebSiteBuilderViewComponent,
  ],
  providers: [
    PebContextService,
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: PebContextApi,
      useClass: PebContextService,
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
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSiteWs,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
    {
      provide: PebThemesApi,
      useClass: ActualPebSitesThemesApi,
    },
    {
      provide: PebSitesApi,
      useClass: PebActualSitesApi,
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
      provide: HTTP_INTERCEPTORS,
      useClass: UploadInterceptorService,
      multi: true,
      deps: [
        BackgroundActivityService,
        PEB_EDITOR_API_PATH,
      ],
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderSite,
    },
  ],
})
export class PebSiteEditorRouteModule {}