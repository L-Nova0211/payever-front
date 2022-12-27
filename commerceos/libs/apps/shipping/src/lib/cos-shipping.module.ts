import { AgmCoreModule } from '@agm/core';
import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { AuthModule } from '@pe/auth';
import { PebTranslateService } from '@pe/builder-core';
import { PE_ENV, PeDestroyService } from '@pe/common';
import { EnvService, MessageBus, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderModule } from '@pe/platform-header';

import { environment } from '../../../../../apps/commerceos/src/environments/environment';

import { PEB_SHIPPING_API_PATH } from './enums/constants';
import { ShippingEnvService } from './root/shipping-env.service'
import { CosShippingRootComponent } from './root/shipping-root.component';
import { CosMessageBus } from './services/message-bus.service';
import { PeShippingHeaderService } from './services/shipping-header.service';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './token.interceptor';

const routes: Route[] = [
  {
    path: '',
    component: CosShippingRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./shipping.module').then(m => m.PebShippingModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    RouterModule.forChild(routes),
    AuthModule,
    MatGoogleMapsAutocompleteModule,
    AgmCoreModule.forRoot({
      apiKey: environment.apis.config.googleMapsApiKey,
      libraries: ['places'],
    }),
  ],
  declarations: [CosShippingRootComponent],
  providers: [
    PeOverlayWidgetService,
    NavigationService,
    PeShippingHeaderService,
    PeDestroyService,
    {
      provide: PebTranslateService,
      useClass: TranslateService,
    },
    {
      provide: PEB_SHIPPING_API_PATH,
      deps: [PE_ENV],
      useFactory: env => `${env.backend.shipping}/api`,
    },
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: EnvService,
      useClass: ShippingEnvService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
  ],
})
export class CosShippingModule {}
