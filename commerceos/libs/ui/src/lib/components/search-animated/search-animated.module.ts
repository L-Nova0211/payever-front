import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { I18nModule } from '@pe/i18n';

import { PeSearchAnimatedComponent } from './search-animated.component';


@NgModule({
  imports: [
      CommonModule,
      MatIconModule,
      MatListModule,
      I18nModule,
      FormsModule,
    ],
  declarations: [PeSearchAnimatedComponent],
  exports: [PeSearchAnimatedComponent],
})
export class PeSearchAnimatedModule {}
