import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { PebButtonModule } from '../button/button.module';

import { PebCountryPickerComponent } from './country-picker';
import { PebCountryPickerDirective } from './country-picker.directive';

@NgModule({
  imports: [CommonModule, PebButtonModule, MatAutocompleteModule],
  declarations: [PebCountryPickerComponent, PebCountryPickerDirective],
  exports: [PebCountryPickerComponent, PebButtonModule, PebCountryPickerDirective],
})
export class PebCountryPickerModule {}
