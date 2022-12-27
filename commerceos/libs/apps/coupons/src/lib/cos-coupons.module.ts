import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { CosMessageBus } from '@pe/base';
import { AppType, APP_TYPE, EnvironmentConfigInterface, MessageBus, PE_ENV } from '@pe/common';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { TranslationLoaderService } from '@pe/i18n-core';
import { PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { PE_COUPONS_CONTAINER } from './constants';
import { CosCouponsRootComponent } from './root/coupons-root.component';
import { PeCouponsHeaderService } from './services';
import { PE_CONTACTS_API_PATH, PE_COUPONS_API_PATH, PE_PRODUCTS_API_PATH } from './tokens';


const foldersProvides = [
  {
    deps: [PE_ENV],
    provide: PE_FOLDERS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.coupons + '/api',
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
    useValue: PE_COUPONS_CONTAINER,
  },
];

const routes: Route[] = [
  {
    path: '',
    component: CosCouponsRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./coupons.module').then(m =>  m.PeCouponsModule),
      },
    ],
  },
];

@NgModule({
  imports: [
    CommonModule,
    OverlayModule,
    RouterModule.forChild(routes),

    PePlatformHeaderModule,
    PeSimpleStepperModule,
  ],
  declarations: [CosCouponsRootComponent],
  providers: [
    PeCouponsHeaderService,
    TranslationLoaderService,
    ...foldersProvides,
    ...mediaProvides,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Coupons,
    },
    {
      deps: [PE_ENV],
      provide: PE_CONTACTS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
    },
    {
      deps: [PE_ENV],
      provide: PE_COUPONS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.coupons + '/api',
    },
    {
      deps: [PE_ENV],
      provide: PE_PRODUCTS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.products,
    },
  ],
})
export class CosCouponsModule { }
