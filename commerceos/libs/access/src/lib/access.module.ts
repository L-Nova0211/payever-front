import { CommonModule } from '@angular/common';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { RouterModule } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import {
  BUILDER_MEDIA_API_PATH,
  PEB_GENERATOR_API_PATH,
  PEB_MEDIA_API_PATH,
  PEB_STORAGE_PATH,
  PEB_STUDIO_API_PATH,
  PEB_SYNCHRONIZER_API_PATH,
  PEB_PRODUCTS_API_PATH,
  PebEditorAuthTokenService,
} from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';
import { BackgroundActivityService } from '@pe/builder-services';
import { PE_ENV } from '@pe/common';
import { LoginModule } from '@pe/entry/login';
import { RegistrationModule } from '@pe/entry/registration';
import { EntrySharedModule } from '@pe/entry/shared';
import { PersonalFormModule } from '@pe/personal-form';
import { PePlatformHeaderModule, PePlatformHeaderService, PlatformHeaderFakeService } from '@pe/platform-header';

import { PeAccessComponent } from './access.component';
import { PeAccessInterceptor } from './access.interceptor';
import { PeAccessEditorGuard } from './guards/access-editor.guard';
import { PeAccessEnvService } from './services/env.service';
import { PeAccessApiService } from './services/api.service';
import { PeAccessService } from './services/access.service';

@NgModule({
  imports: [
    CommonModule,
    HttpClientModule,
    MatDialogModule,
    RouterModule.forChild([
      /* {path: '', pathMatch: 'full', component: InsertYourComponentHere} */
      {
        path: ':access',
        component: PeAccessComponent,
        data: { i18nDomains: ['commerceos-app', 'commerceos-widgets-app'] },
        children: [
          {
            path: 'business/:businessId/blog/:applicationId/edit',
            loadChildren: () => import('@pe/apps/blog').then(m => m.PebBlogEditorRouteModule),
            canActivate: [PeAccessEditorGuard],
            data: { appType: 'blog' },
          },
          {
            path: 'business/:businessId/site/:applicationId/edit',
            loadChildren: () => import('@pe/apps/site').then(m => m.PebSiteEditorRouteModule),
            canActivate: [PeAccessEditorGuard],
            data: { appType: 'site' },
          },
          {
            path: 'business/:businessId/shop/:applicationId/edit',
            loadChildren: () => import('@pe/apps/shop').then(m => m.PebShopEditorRouteModule),
            canActivate: [PeAccessEditorGuard],
            data: { appType: 'shop' },
          },
        ],
      },
    ]),
    PePlatformHeaderModule,
    LoginModule,
    RegistrationModule,
    PersonalFormModule,
    EntrySharedModule,
  ],
  declarations: [PeAccessComponent],
  providers: [
    PeAccessApiService,
    PeAccessService,
    BackgroundActivityService,
    PeAccessEditorGuard,
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderFakeService,
    },
    {
      provide: PebEnvService,
      useValue: PeAccessEnvService,
    },
    {
      provide: HTTP_INTERCEPTORS,
      multi: true,
      useClass: PeAccessInterceptor,
    },
    {
      provide: PebEditorAuthTokenService,
      deps: [PeAuthService],
      useFactory: (authService: PeAuthService) => ({
        get token() {
          return authService.token;
        },
        access: null,
      }),
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
      provide: PEB_STUDIO_API_PATH,
      useValue: env=>env.backend.studio,
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
      provide: PEB_SYNCHRONIZER_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.synchronizer,
    },
  ],
})
export class PeAccessModule {}
