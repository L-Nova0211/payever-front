import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PebButtonToggleComponent } from './button-toggle';
import { PebButtonToggleDirective } from './button-toggle.directive';

@NgModule({
  imports: [CommonModule, FormsModule],
  declarations: [PebButtonToggleComponent, PebButtonToggleDirective],
  exports: [PebButtonToggleComponent, PebButtonToggleDirective],
})
export class PebButtonToggleModule {}
