import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { NavigationService, PePreloaderService } from '@pe/common';
import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';

import { PeSocialApiService, PeSocialDialogService, PeSocialEnvService } from './services';

import { PeSocialRoutingModule } from './social-routing.module';
import { PeSocialComponent } from './social.component';

const angularModules = [
  CommonModule,
  MatIconModule,
];

const peModules = [

  I18nModule,
  PeGridModule,
  PeFoldersModule,
];

@NgModule({
  declarations: [PeSocialComponent],
  imports: [
    ...angularModules,
    ...peModules,
    PeSocialRoutingModule,
  ],
  providers: [
    PeSocialApiService,
    PeSocialDialogService,
    PeSocialEnvService,

    NavigationService,
    PePreloaderService,
  ],
})
export class PeSocialModule { }
