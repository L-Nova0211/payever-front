import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatMenuModule } from '@angular/material/menu';

import { PebColorPickerModule } from '@pe/builder-color-picker';

import { PebButtonModule } from '../button/button.module';

import { PebColorPickerFormComponent } from './color-picker';
import { PebColorPickerFormDirective } from './color-picker.directive';

@NgModule({
  imports: [CommonModule, PebButtonModule, MatMenuModule, PebColorPickerModule],
  declarations: [PebColorPickerFormComponent, PebColorPickerFormDirective],
  exports: [PebColorPickerFormComponent, PebButtonModule, PebColorPickerFormDirective],
})
export class PebColorPickerFormModule {}
