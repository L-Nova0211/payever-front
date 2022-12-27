import { OverlayModule } from '@angular/cdk/overlay';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { NgxsModule } from '@ngxs/store';

import { CosMessageBus } from '@pe/base';
import { MessageBus, PE_ENV, EnvironmentConfigInterface, APP_TYPE, AppType, PreloaderState } from '@pe/common';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { PE_SOCIAL_CONTAINER } from './constants';
import { CosSocialRootComponent } from './root/social-root.component';
import { PeSocialHeaderService } from './services';
import { PE_PRODUCTS_API_PATH, PE_SOCIAL_API_PATH } from './tokens';

const foldersProvides = [
  {
    deps: [PE_ENV],
    provide: PE_FOLDERS_API_PATH,
    useFactory: (env: EnvironmentConfigInterface) => env.backend.social + '/api',
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
    useValue: PE_SOCIAL_CONTAINER,
  },
];

const productsProvides = [
  {
    provide: PE_PRODUCTS_API_PATH,
    deps: [PE_ENV],
    useFactory: (env: EnvironmentConfigInterface) => env.backend.products,
  },
];

const routes: Route[] = [
  {
    path: '',
    component: CosSocialRootComponent,
    children: [
      {
        path: '',
        loadChildren: () => import('./social.module').then(m => m.PeSocialModule),
      },
    ],
  },
];

@NgModule({
  declarations: [CosSocialRootComponent],
  imports: [
    CommonModule,
    OverlayModule,
    RouterModule.forChild(routes),
    NgxsModule.forFeature([PreloaderState]),

    PePlatformHeaderModule,
    PeSimpleStepperModule,
  ],
  providers: [
    ...foldersProvides,
    ...mediaProvides,
    ...productsProvides,
    PeSocialHeaderService,
    {
      provide: MessageBus,
      useClass: CosMessageBus,
    },
    {
      provide: PE_SOCIAL_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: EnvironmentConfigInterface) => env.backend.social,
    },
    {
      provide: APP_TYPE,
      useValue: AppType.Social,
    },
  ],
})
export class CosSocialModule { }
