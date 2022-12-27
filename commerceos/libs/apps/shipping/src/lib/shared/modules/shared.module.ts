import { MatGoogleMapsAutocompleteModule } from '@angular-material-extensions/google-maps-autocomplete';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { PeFoldersModule } from '@pe/folders';
import { PeGridModule } from '@pe/grid';
import { I18nModule } from '@pe/i18n';
import { MediaModule } from '@pe/media';
import {
  PebButtonModule,
  PebButtonToggleModule,
  PebCheckboxModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebExpandablePanelModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebMessagesModule,
  PebProductPickerModule,
  PebRadioModule,
  PebSelectModule,
  PePickerModule,
} from '@pe/ui';

export const i18n = I18nModule.forRoot();
export const MediaModuleForRoot = MediaModule.forRoot({});

const modules = [
  CommonModule,
  MatMomentDateModule,
  FormsModule,
  ReactiveFormsModule,
  MatSelectModule,
  MatSlideToggleModule,
  MatProgressSpinnerModule,
  MatIconModule,
  PeGridModule,
  MatMenuModule,
  MatDialogModule,
  PePickerModule,
  MatGoogleMapsAutocompleteModule,
  PeFoldersModule,

  PebButtonModule,
  PebCheckboxModule,
  PebFormFieldInputModule,
  PebFormFieldTextareaModule,
  PebSelectModule,
  PebRadioModule,
  PebFormBackgroundModule,
  PebExpandablePanelModule,
  PebButtonToggleModule,
  PebChipsModule,
  PebCountryPickerModule,
  PebMessagesModule,
  PebProductPickerModule,
];

@NgModule({
  imports: [
    ...modules,
    i18n,
    MediaModuleForRoot,
  ],
  exports: [
    ...modules,
    I18nModule,
    MediaModule,
  ],
})
export class SharedModule { }
