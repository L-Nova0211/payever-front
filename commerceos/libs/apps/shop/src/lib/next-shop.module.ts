import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule, Optional, SkipSelf } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthModule, PeAuthService } from '@pe/auth';
import {
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PebEditorApi,
  PebActualEditorWs,
  PebEditorWs,
  PEB_EDITOR_WS_PATH,
  PebEditorAuthTokenService,
} from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService, PebTranslateService } from '@pe/builder-core';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { PeBuilderShareModule } from '@pe/builder-share';
import { APP_TYPE, AppType, PE_ENV, EnvService } from '@pe/common';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import { PeDataGridService } from '@pe/data-grid';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { PeHeaderMenuModule } from '@pe/header';
import { TranslateService, TranslationGuard } from '@pe/i18n';
import { PE_MEDIA_CONTAINER } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';
import { PebMessagesModule } from '@pe/ui';
import { WelcomeScreenService } from '@pe/welcome-screen';

import { PEB_SHOP_HOST, PE_SHOP_CONTAINER } from './constants';
import { ShopEnvGuard } from './guards/env.guard';
import { CosNextRootComponent } from './root/next-root.component';
import {
  PebActualEditorApi,
  PebActualShopsApi,
  PebActualShopThemesApi,
  PebShopsApi,
  PEB_SHOPS_API_PATH,
  ShopEnvService,
} from './services';
import { PeShopHeaderService } from './services/shop-header.service';


const routes: Route[] = [
  {
    path: '',
    component: CosNextRootComponent,
    canActivate:[ShopEnvGuard, TranslationGuard],
    data: {
      i18nDomains: [
        'commerceos-grid-app',
      ],
    },
    children: [{
      path: '',
      loadChildren: () => import('./shop.module').then(m => m.PebShopModule),
    }],
  },
]

@NgModule({
  imports: [
    CommonModule,
    AuthModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PebMessagesModule,
    PeHeaderMenuModule,
    PebConfirmActionDialogModule,
    // HttpClientModule, // TODO: remove this after all HttpClientModules will be removed from dependencies
    PeBuilderShareModule,
  ],
  declarations: [
    CosNextRootComponent,
  ],
  providers: [
    PeOverlayWidgetService,
    WelcomeScreenService,
    ShopEnvGuard,
    PeShopHeaderService,
    BackgroundActivityService,
    PeDataGridService,
    ThemesApi,
    PebContextService,
    {
      provide:EnvService,
      useClass:ShopEnvService,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'shop',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Shop,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualShopThemesApi,
    },
    {
      provide: PebTranslateService,
      useExisting: TranslateService,
    },
    {
      provide: 'PE_ACCESS_TOKEN',
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => authService.token,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },
    {
      provide: PEB_SHOP_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.shopHost,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebShopsApi,
      useClass: PebActualShopsApi,
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
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShopWs,
    },
    {
      provide: PE_FOLDERS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: PE_SHOP_CONTAINER,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
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
  ],
})
export class CosNextShopModule { }
