import { ObserversModule } from '@angular/cdk/observers';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PebCheckboxComponent } from './checkbox';
import { PebCheckboxDirective } from './checkbox.directive';

@NgModule({
  imports: [CommonModule, FormsModule, ObserversModule],
  exports: [PebCheckboxComponent, PebCheckboxDirective],
  declarations: [PebCheckboxDirective, PebCheckboxComponent],
})
export class PebCheckboxModule {}
