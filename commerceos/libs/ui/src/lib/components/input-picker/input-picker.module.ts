import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { PebButtonModule } from '../button';

import { PeInputPickerComponent } from './input-picker';
import { PeInputPickerDirective } from './input-picker.directive';

@NgModule({
  imports: [CommonModule, MatAutocompleteModule, PebButtonModule],
  declarations: [PeInputPickerComponent, PeInputPickerDirective],
  exports: [PeInputPickerComponent, PeInputPickerDirective, PebButtonModule],
})
export class PeInputPickerModule {}
