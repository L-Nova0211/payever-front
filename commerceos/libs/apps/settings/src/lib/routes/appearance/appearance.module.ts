import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { I18nModule } from '@pe/i18n';
import { PebButtonToggleModule, PebCheckboxModule, PebFormBackgroundModule, PebRadioModule } from '@pe/ui';

import { AppearanceComponent } from './appearance.component';

@NgModule({
  declarations: [
    AppearanceComponent,
  ],
    imports: [
        I18nModule,
        FormsModule,
        ReactiveFormsModule,
        CommonModule,
        PebRadioModule,
        PebCheckboxModule,
        PebButtonToggleModule,
        PebFormBackgroundModule,
    ],
  providers: [
  ],
})
export class AppearanceModule { }
