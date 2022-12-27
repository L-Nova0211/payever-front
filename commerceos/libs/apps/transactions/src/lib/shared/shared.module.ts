import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { I18nModule } from '@pe/i18n';
import { PebFormBackgroundModule, PebSelectModule } from '@pe/ui';

import { ApiService } from '../services/api.service';
import { SettingsService } from '../services/settings.service';

@NgModule({
  imports: [
    CommonModule,
    I18nModule,
    PebFormBackgroundModule,
    PebSelectModule,
  ],
  exports: [
    CommonModule,
    I18nModule,
    PebFormBackgroundModule,
    PebSelectModule,
  ],
  providers: [
    ApiService,
    SettingsService,
  ],
})

export class SharedModule {}
