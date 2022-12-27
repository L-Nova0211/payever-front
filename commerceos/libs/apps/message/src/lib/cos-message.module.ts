import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthModule, PeAuthService } from '@pe/auth';
import {
  BUILDER_MEDIA_API_PATH,
  MediaService,
  PebEditorAuthTokenService,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_SHOPS_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PEB_PRODUCTS_API_PATH,
} from '@pe/builder-api';
import { PebEnvService, PebMediaService } from '@pe/builder-core';
import { BackgroundActivityService } from '@pe/builder-services';
import { PE_ENV, MessageBus, APP_TYPE, AppType } from '@pe/common';
import { PebConfirmActionDialogModule } from '@pe/confirm-action-dialog';
import { PeDataGridService } from '@pe/data-grid';
import { I18nModule } from '@pe/i18n';
import {
  PE_MEDIA_API_PATH,
  PE_MESSAGE_API_PATH,
  PE_PRODUCTS_API_PATH,
  PeMessageEnvService,
  PE_MARKETING_API_PATH,
  CosMessageBus,
  ChatListFacade,
} from '@pe/message';
import { PeMessageService } from '@pe/message';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';

import { CosMessageRootComponent } from './root/message-root.component';
import { PeMessageHeaderService } from './services/message-header.service';

const routes: Route[] = [
  {
    path: '',
    component: CosMessageRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('@pe/message').then(m =>  m.PeMessageAppModule),
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
    I18nModule,
  ],
  declarations: [
    CosMessageRootComponent,
  ],
  providers: [
    PeDataGridService,
    SnackbarService,
    PeMessageHeaderService,
    {
      provide: ChatListFacade,
      useFactory: (peMessageService: PeMessageService) => {
        return new ChatListFacade(peMessageService);
      },
      deps: [PeMessageService],
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: PebMediaService,
      useClass: MediaService,
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
      provide: 'PE_CONTACTS_HOST',
      deps: [PE_ENV],
      useFactory: env => env.backend.contacts,
    },
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'message',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Message,
    },
  ],
})
export class CosMessageModule {}
