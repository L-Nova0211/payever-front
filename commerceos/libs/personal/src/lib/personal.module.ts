import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';

import { AuthModule } from '@pe/auth';
import { BaseDashboardModule } from '@pe/base-dashboard';
import { PEB_PRODUCTS_API_PATH } from '@pe/builder-api';
import { PE_ENV } from '@pe/common';
import { DockerModule, DockerService } from '@pe/docker';
import { PeHeaderModule, PlatformHeaderService, } from '@pe/header';
import { I18nModule } from '@pe/i18n';
import { PE_MEDIA_API_PATH, PE_MESSAGE_API_PATH, PE_PRODUCTS_API_PATH } from '@pe/message';
import { PePlatformHeaderModule, PePlatformHeaderService } from '@pe/platform-header';
import { ngxZendeskWebwidgetModule, ZendeskConfig, ZendeskGuard } from '@pe/zendesk';

import { PersonalDashboardLayoutComponent, PersonalLayoutComponent } from './components';
import { PersonalAppRegistryGuard } from './guards';
import { PEPersonalRoutingModule } from './personal-routing.module';

@NgModule({
  imports: [
    CommonModule,
    MatButtonModule,
    MatExpansionModule,
    MatSelectModule,
    I18nModule.forChild(),
    PEPersonalRoutingModule,
    ngxZendeskWebwidgetModule.forRoot(ZendeskConfig),
    BaseDashboardModule,
    DockerModule,
    AuthModule,
    PeHeaderModule,
    PePlatformHeaderModule,
  ],
  declarations: [PersonalLayoutComponent, PersonalDashboardLayoutComponent],
  providers: [
    PersonalAppRegistryGuard,
    ZendeskGuard,
    DockerService,
    {
      provide: PE_MEDIA_API_PATH,
      deps: [PE_ENV],
      useFactory: (env: any) => env.backend.media,
    },
    {
      provide: PE_MESSAGE_API_PATH,
      useValue: 'MICRO_URL_MESSAGE',
    },
    {
      provide: PE_PRODUCTS_API_PATH,
      useExisting: PEB_PRODUCTS_API_PATH,
    },
    {
      provide: PEB_PRODUCTS_API_PATH,
      deps: [PE_ENV],
      useFactory: env => env.backend.products,
    },
    {
      provide: PePlatformHeaderService,
      useClass: PlatformHeaderService,
    },
  ],
})
export class PEPersonalModule {}
