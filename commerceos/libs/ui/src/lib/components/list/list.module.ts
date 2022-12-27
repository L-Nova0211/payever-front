import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';

import { I18nModule } from '@pe/i18n';

import { PebButtonModule } from '../button';
import { PebButtonToggleModule } from '../button-toggle';
import { PebFormBackgroundModule } from '../form-background';

import { PeListContainerComponent } from './list-container.component';
import { PeListSectionComponent } from './list-section.component';

@NgModule({
  declarations: [
    PeListSectionComponent,
    PeListContainerComponent,
  ],
  exports: [
    PeListSectionComponent,
    PeListContainerComponent,
  ],
  imports: [
    CommonModule,
    MatIconModule,

    I18nModule,
    PebButtonModule,
    PebButtonToggleModule,
    PebFormBackgroundModule,
  ],
})
export class PeListModule { }
