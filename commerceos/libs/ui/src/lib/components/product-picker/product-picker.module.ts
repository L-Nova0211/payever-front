import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { PebButtonModule } from '../button/button.module';

import { PebProductPickerComponent } from './product-picker';
import { PebProductPickerDirective } from './product-picker.directive';

@NgModule({
  imports: [CommonModule, PebButtonModule, MatAutocompleteModule,FormsModule, ReactiveFormsModule],
  declarations: [PebProductPickerComponent, PebProductPickerDirective],
  exports: [PebProductPickerComponent, PebButtonModule, PebProductPickerDirective],
})
export class PebProductPickerModule {}
