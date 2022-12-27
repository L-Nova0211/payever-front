import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';

import { PebButtonModule } from '../button/button.module';
import { PebFormFieldInputModule } from '../form-field-input/form-field-input.module';

import { PeAutocompleteComponent } from './autocomplete';
import { PeAutocompleteDirective } from './autocomplete.directive';

@NgModule({
  imports: [CommonModule, MatAutocompleteModule, PebButtonModule, PebFormFieldInputModule],
  declarations: [PeAutocompleteComponent, PeAutocompleteDirective],
  exports: [PeAutocompleteComponent, PeAutocompleteDirective, PebButtonModule],
})
export class PeAutocompleteModule {}
