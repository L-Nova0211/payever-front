import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { ApiService } from '@pe/api';
import { AuthModule } from '@pe/auth';
import { AppType, APP_TYPE, EnvService } from '@pe/common';
import { TranslationGuard } from '@pe/i18n-core';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PebMessagesModule } from '@pe/ui';

import { environment } from '../../../../../apps/commerceos/src/environments/environment';

import { SettingsEnvGuard } from './env.guard';
import { CosEnvInitializer, CosEnvProvider } from './misc/constants';
import { CosNextRootComponent } from './root/next-root.component';
import { BusinessEnvService } from './services';
import { PeSettingsHeaderService } from './services/settings-header.service';
import { TokenInterceptor } from './token.interceptor';





const routes: Route[] = [
  {
    path: '',
    component: CosNextRootComponent,
    canActivate: [TranslationGuard, SettingsEnvGuard],
    children: [{
      path: '',
      loadChildren: () => import('./settings.module').then(m => m.SettingsModule),
    }],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    MatGoogleMapsAutocompleteModule,
    AgmCoreModule.forRoot({
      apiKey: environment.apis.config.googleMapsApiKey,
      libraries: ['places'],
    }),
    AuthModule,
    PebMessagesModule,
    RouterModule.forChild(routes),
  ],
  declarations: [
    CosNextRootComponent,
  ],
  providers: [
    CosEnvInitializer,
    CosEnvProvider,
    ApiService,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: PeSettingsHeaderService,
      useClass: PeSettingsHeaderService,
    },
    {
      provide: EnvService,
      useClass: BusinessEnvService,
    },
    SettingsEnvGuard,
    {
      provide: 'PEB_ENTITY_NAME',
      useValue: 'settings',
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Settings,
    },
  ],
})
export class CosNextSettingsModule { }
