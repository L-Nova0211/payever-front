import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebChipComponent } from './chip';
import { PebChipsComponent } from './chips';
import { PebChipsDirective } from './chips.directive';

@NgModule({
  imports: [CommonModule],
  declarations: [PebChipsComponent, PebChipComponent, PebChipsDirective],
  exports: [PebChipsComponent, PebChipComponent, PebChipsDirective],
})
export class PebChipsModule {}
