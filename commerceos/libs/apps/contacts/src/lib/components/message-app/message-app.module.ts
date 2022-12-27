import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthModule, PeAuthService } from '@pe/auth';
import {
  BUILDER_MEDIA_API_PATH,
  PebActualEditorApi,
  PebActualEditorWs,
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PEB_EDITOR_API_PATH,
  PEB_EDITOR_WS_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PEB_PRODUCTS_API_PATH,
} from '@pe/builder-api';
import { PebContextService } from '@pe/builder-context';
import { PebEnvService, PebMediaService } from '@pe/builder-core';
import { BackgroundActivityService } from '@pe/builder-services';
import { EnvService, PE_ENV, MessageBus } from '@pe/common';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import { PeDataGridService } from '@pe/data-grid';
import { MediaService } from '@pe/media';
import {
  PE_MEDIA_API_PATH,
  PE_MESSAGE_API_PATH,
  PE_PRODUCTS_API_PATH,
  PeMessageEnvService,
  PE_MARKETING_API_PATH,
  CosMessageBus,
} from '@pe/message';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';

import { PE_CONTACTS_API_PATH } from '../../tokens';

import { MessageEnvGuard } from './env.guard';
import { PeMessageAppComponent } from './message-app.component';

const routes: Route[] = [
  {
    path: '',
    component: PeMessageAppComponent,
    canActivate: [MessageEnvGuard],
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/message').then(m =>  m.PeMessageModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,

    AuthModule,
    PePlatformHeaderModule,
    PebConfirmActionDialogModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    PeMessageAppComponent,
  ],
  providers: [
    MessageEnvGuard,
    PeDataGridService,
    SnackbarService,
    ThemesApi,
    PebContextService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: EnvService,
      useClass: PeMessageEnvService,
    },
    {
      provide: PebEnvService,
      useExisting: EnvService,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
    },
    {
      provide: PebEditorApi,
      useClass: PebActualEditorApi,
    },
    {
      provide: PebEditorWs,
      useClass: PebActualEditorWs,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: authService => authService,
    },
    BackgroundActivityService,
    {
      provide: PE_OVERLAY_DATA,
      useValue: {},
    },
    {
      provide: PEB_EDITOR_WS_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMessageWs,
    },
    {
      provide: PEB_EDITOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMessage,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PEB_GENERATOR_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderGenerator,
    },
    {
      provide: PEB_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.media,
    },
    {
      provide: BUILDER_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMedia,
    },
    {
      provide: PEB_STORAGE_PATH,
      deps: [PE_ENV],
      useFactory: env => env.custom.storage,
    },
    {
      provide: PEB_SHOPS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.shop + '/api',
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: PE_MESSAGE_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.message,
    },
    {
      provide: PE_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.media,
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.products,
    },
    {
      provide: THEMES_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.builderMessage,
    },
    {
      provide: PEB_STUDIO_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.studio,
    },
    {
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.synchronizer,
    },
    {
      provide: PE_MARKETING_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.marketing,
    },
    {
      deps: [PE_ENV],
      provide: PE_CONTACTS_API_PATH,
      useFactory: env => env.backend.contacts,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'message',
    },
  ],
})
export class MessageAppModule {}
