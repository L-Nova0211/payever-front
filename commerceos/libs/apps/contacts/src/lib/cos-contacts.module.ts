
import { CommonModule, CurrencyPipe } from '@angular/common';
import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { PE_FOLDERS_API_PATH } from '@pe/folders';
import { TranslationGuard } from '@pe/i18n';
import { PE_CUSTOM_CDN_PATH, PE_MEDIA_API_PATH, PE_MEDIA_CONTAINER } from '@pe/media';
import { PePlatformHeaderModule } from '@pe/platform-header';
import { PeSimpleStepperModule } from '@pe/stepper';

import { CosContactsRootComponent } from './root/contacts-root.component';
import { PeContactsHeaderService } from './services';
import { PE_CONTACTS_API_PATH } from './tokens';


const routes: Route[] = [
  {
    path: '',
    component: CosContactsRootComponent,
    canActivate: [TranslationGuard],
    data: {
      i18nDomains: ['commerceos-grid-app'],
      isFromDashboard: true,
    },
    children: [
      {
        path: '',
        loadChildren: () => import('./contacts.module').then(
          m => m.ContactsModule,
        ),
      },
    ],
  },
];

@NgModule({
  declarations: [CosContactsRootComponent],
  imports: [
    CommonModule,
    PePlatformHeaderModule,
    PeSimpleStepperModule,
    RouterModule.forChild(routes),
  ],
  providers: [
    CurrencyPipe,
    PeAuthService,
    PeContactsHeaderService,
    {
      deps: [PE_ENV],
      provide: PE_CONTACTS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
    },
    {
      deps: [PE_ENV],
      provide: 'PE_CONTACTS_HOST',
      useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts,
    },
    {
      deps: [PE_ENV],
      provide: PE_CUSTOM_CDN_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.custom.cdn,
    },
    {
      deps: [PE_ENV],
      provide: PE_FOLDERS_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.contacts + '/api',
    },
    {
      deps: [PE_ENV],
      provide: PE_MEDIA_API_PATH,
      useFactory: (env: EnvironmentConfigInterface) => env.backend.media,
    },
    {
      provide: PE_MEDIA_CONTAINER,
      useValue: 'images',
    },
  ],
})
export class CosContactsModule { }
