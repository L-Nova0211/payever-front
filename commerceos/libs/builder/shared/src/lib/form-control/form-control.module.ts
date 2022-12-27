import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';

import { PebAnglePickerComponent } from './angle-picker';
import { PebAutocompleteStylesComponent } from './autocomplete/autocomplete-styles.component';
import { PebAutocompleteComponent } from './autocomplete/autocomplete.component';
import { PebButtonToggleComponent, PebButtonToggleGroupComponent } from './button-toggle';
import { PebColorPaletteComponent } from './color-palette';
import { PebHexComponent, PebHSVColorPickerComponent, PebPickerComponent } from './color-picker';
import { PebFillPresetComponent } from './fill-preset';
import { PebInputComponent } from './input';
import { PebNumberInputComponent, PebNumberInputSpinButtonsComponent } from './number-input';
import { PebRangeInputComponent } from './range-input';
import { PebSelectComponent, PebSelectOptionListComponent } from './select';
import { PebSlideToggleComponent } from './slide-toggle';


@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatIconModule,
    MatAutocompleteModule,
  ],
  declarations: [
    PebAnglePickerComponent,
    PebPickerComponent,
    PebHSVColorPickerComponent,
    PebFillPresetComponent,
    PebNumberInputComponent,
    PebNumberInputSpinButtonsComponent,
    PebRangeInputComponent,
    PebInputComponent,
    PebSlideToggleComponent,
    PebSelectComponent,
    PebSelectOptionListComponent,
    PebColorPaletteComponent,
    PebButtonToggleComponent,
    PebButtonToggleGroupComponent,
    PebHexComponent,
    PebAutocompleteComponent,
    PebAutocompleteStylesComponent,
  ],
  exports: [
    PebAnglePickerComponent,
    PebPickerComponent,
    PebFillPresetComponent,
    PebNumberInputComponent,
    PebNumberInputSpinButtonsComponent,
    PebRangeInputComponent,
    PebInputComponent,
    PebSlideToggleComponent,
    PebSelectComponent,
    PebSelectOptionListComponent,
    PebColorPaletteComponent,
    PebButtonToggleComponent,
    PebButtonToggleGroupComponent,
    PebHexComponent,
    PebAutocompleteComponent,
  ],
})
export class PebFormControlModule {
}
