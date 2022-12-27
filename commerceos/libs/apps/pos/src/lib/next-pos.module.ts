import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Route, RouterModule } from '@angular/router';

import { AuthStubService, PeAuthService } from '@pe/auth';
import {
  PebThemesApi,
  PEB_EDITOR_API_PATH,
  PebEditorApi,
  PebActualEditorWs,
  PebEditorWs,
  PEB_EDITOR_WS_PATH,
  PebEditorAuthTokenService,
  MediaService,
} from '@pe/builder-api';
import { PebEnvService, PebMediaService, PebTranslateService } from '@pe/builder-core';
import { PE_ENV, EnvService, NavigationService } from '@pe/common';
import { PeDataGridService } from '@pe/data-grid';
import { SnackBarService } from '@pe/forms';
import { TranslateService, TranslationGuard } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebMessagesModule } from '@pe/ui';

import {
  PEB_POS_HOST,
  PEB_POS_API_PATH,
  PEB_POS_API_BUILDER_PATH,
} from './constants/constants'
import { PosEnvGuard } from './env.guard';
import { CosNextRootComponent } from './root/next-root.component';
import {
  PosApi,
  ActualPosApi,
  BuilderPosApi,
  PosEnvService,
  PebActualPosThemesApi,
  PebActualEditorApi,
  ActualBuilderPosApi,
} from './services';
import { PePosHeaderService } from './services/pos-header.service';
import { TokenInterceptor } from './token.interceptor';


const routes: Route[] = [
  {
    path: '',
    component: CosNextRootComponent,
    canActivate: [PosEnvGuard, TranslationGuard],
    data: {
      i18nDomains: [
        'connect-integrations',
      ],
    },
    children: [{
      path: '',
      loadChildren: () => import('./pos.module').then(m => m.PebPosModule),
    }],

  },
]

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    PebMessagesModule,

  ],
  declarations: [
    CosNextRootComponent,
  ],
  providers: [
    PeOverlayWidgetService,
    AuthStubService,
    PosEnvGuard,
    PePosHeaderService,
    SnackBarService,
    MatSnackBar,
    PeDataGridService,
    NavigationService,
    {
      provide: EnvService,
      useClass: PosEnvService,
    },
    {
      provide: PebEnvService,
      useClass: PosEnvService,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [AuthStubService],
      useFactory: authService => authService,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'pos',
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderPos,
    },
    {
      provide: PEB_POS_API_BUILDER_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderPos,
    },
    {
      provide: PebThemesApi,
      useClass: PebActualPosThemesApi,
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
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PEB_POS_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.posHost,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShop,
    },
    {
      provide: PEB_POS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.pos + '/api',
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: BuilderPosApi,
      useClass: ActualBuilderPosApi,
    },
    {
      provide: PosApi,
      useClass: ActualPosApi,
    },
    {
      provide: PebEditorWs,
      useClass: PebActualEditorWs,
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderShopWs,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
  ],
})
export class CosNextPosModule { }
