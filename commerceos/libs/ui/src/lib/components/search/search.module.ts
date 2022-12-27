import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { I18nModule } from '@pe/i18n';

import { PebFormFieldInputModule } from '../form-field-input';

import { PeSearchComponent } from './search-field/search.component';
import { PeSearchListItemComponent } from './search-list/search-list-item.component';
import { PeSearchListComponent } from './search-list/search-list.component';

@NgModule({
  declarations: [
    PeSearchComponent,
    PeSearchListComponent,
    PeSearchListItemComponent,
  ],
  exports: [
    PeSearchComponent,
    PeSearchListComponent,
    PeSearchListItemComponent,
  ],
  imports: [
    CommonModule,
    MatAutocompleteModule,
    MatIconModule,
    MatProgressSpinnerModule,
    ReactiveFormsModule,
    I18nModule,
    PebFormFieldInputModule,
  ],
})
export class PeSearchModule { }
