import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';

import { AuthModule, PeAuthService } from '@pe/auth';
import { CosMessageBus } from '@pe/base';
import {
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
  PebEditorApi,
  PebEditorAuthTokenService,
  PebEditorWs,
  PebThemesApi,
} from '@pe/builder-api';
import { PebEnvService, PebMediaService } from '@pe/builder-core';
import { BackgroundActivityService, UploadInterceptorService } from '@pe/builder-services';
import { PE_ENV, EnvService, MessageBus, APP_TYPE, AppType, EnvironmentConfigInterface } from '@pe/common';
import { PE_DOMAINS_API_PATH, PE_PRIMARY_HOST } from '@pe/domains';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { ThemesApi, THEMES_API_PATH } from '@pe/themes';

import { CosAppointmentsRoutingModule } from './cos-appointments-routing.module';
import { CosAppointmentsRootComponent } from './root';
import { PeAppointmentsEnvService, PeAppointmentsHeaderService } from './services';
import { PE_ACCESS_API_PATH, PE_APPOINTMENTS_API_PATH, PE_CONTACTS_API_PATH, PE_PRODUCTS_API_PATH } from './tokens';

(window as any).PayeverStatic.IconLoader.loadIcons(['apps', 'settings', 'set', 'builder']);

const angularModules = [CommonModule];

const peModules = [
  AuthModule.forRoot(),
  PePlatformHeaderModule,
];

const domainsProvides =[
  {
    deps: [PE_ENV],
    provide: PE_DOMAINS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments,
  },
  {
    deps: [PE_ENV],
    provide: PE_PRIMARY_HOST,
    useFactory: (env: EnvironmentConfigInterface) => 'payever.appointments', //env.primary.appointmentsHost,
  },
];

const envProvides = [
  {
    provide: EnvService,
    useClass: PeAppointmentsEnvService,
  },
  {
    provide: PebEnvService,
    useExisting: EnvService,
  },
];

const foldersProvides = [
  {
    deps: [PE_ENV],
    provide: PE_FOLDERS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments + '/api',
  },
];

const mediaProvides = [
  {
    deps: [PE_ENV],
    provide: PE_CUSTOM_CDN_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.custom.cdn,
  },
  {
    deps: [PE_ENV],
    provide: PE_MEDIA_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
  },
  {
    provide: PE_MEDIA_CONTAINER,
    useValue: AppType.Appointments,
  },
];

const pebProvides = [
  BackgroundActivityService,
  {
    provide: APP_TYPE,
    useValue: AppType.Appointments,
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
    provide: PebMediaService,
    useClass: MediaService,
  },
  {
    provide: PebThemesApi,
    useClass: ThemesApi,
  },
  {
    deps: [PeAuthService],
    provide: PebEditorAuthTokenService,
    useFactory: (peAuthService: PeAuthService) => peAuthService,
  },
  {
    deps: [PeAuthService],
    provide: 'PE_ACCESS_TOKEN',
    useFactory: (peAuthService: PeAuthService) => peAuthService.token,
  },
  {
    provide: 'PEB_ENTITY_NAME',
    useValue: AppType.Appointments,
  },
  {
    deps: [BackgroundActivityService, PEB_EDITOR_API_PATH],
    multi: true,
    provide: HTTP_INTERCEPTORS,
    useClass: UploadInterceptorService,
  },
  {
    deps: [PE_ENV],
    provide: 'PE_CONTACTS_HOST',
    useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
  },
  {
    deps: [PE_ENV],
    provide: PEB_EDITOR_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAppointments,
  },
  {
    deps: [PE_ENV],
    provide: PEB_EDITOR_WS_PATH,
    useFactory: (env: EnvironmentConfigInterface) => 'wss://builder-appointments.test.devpayever.com/ws',
  },
  {
    deps: [PE_ENV],
    provide: PEB_GENERATOR_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderGenerator,
  },
  {
    deps: [PE_ENV],
    provide: PEB_MEDIA_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
  },
  {
    deps: [PE_ENV],
    provide: PEB_SHOPS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAppointments,
  },
  {
    deps: [PE_ENV],
    provide: PEB_STORAGE_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.custom.storage,
  },
  {
    deps: [PE_ENV],
    provide: PEB_STUDIO_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.studio,
  },
  {
    deps: [PE_ENV],
    provide: PEB_SYNCHRONIZER_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.contactsSynchronizer,
  },
];

const peProvides = [
  {
    provide: MessageBus,
    useClass: CosMessageBus,
  },
];

const appointmentsProvides = [
  PeAppointmentsHeaderService,
  {
    deps: [PE_ENV],
    provide: PE_ACCESS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments,
  },
  {
    deps: [PE_ENV],
    provide: PE_CONTACTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
  },
  {
    deps: [PE_ENV],
    provide: PE_PRODUCTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.products,
  },
  {
    deps: [PE_ENV],
    provide: PE_APPOINTMENTS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.appointments,
  },
];

const themesProvides = [
  {
    deps: [PE_ENV],
    provide: THEMES_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.builderAppointments,
  },
];

@NgModule({
  declarations: [CosAppointmentsRootComponent],
  imports: [
    CosAppointmentsRoutingModule,
    ...angularModules,
    ...peModules,
  ],
  providers: [
    ...domainsProvides,
    ...envProvides,
    ...foldersProvides,
    ...mediaProvides,
    ...pebProvides,
    ...peProvides,
    ...appointmentsProvides,
    ...themesProvides,
  ],
})
export class CosAppointmentsModule { }
