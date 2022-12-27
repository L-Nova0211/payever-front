import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebColorPickerComponent } from './color-picker.component';
import { PebColorPickerDirective } from './color-picker.directive';
import { PebColorPickerService } from './color-picker.service';
import { SliderDirective, TextDirective } from './helpers';

@NgModule({
  imports: [CommonModule],
  exports: [PebColorPickerDirective],
  providers: [PebColorPickerService],
  declarations: [PebColorPickerComponent, PebColorPickerDirective, TextDirective, SliderDirective],
})
export class PebColorPickerModule {
}
