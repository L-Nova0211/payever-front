import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatMomentDateModule } from '@angular/material-moment-adapter';
import { MatNativeDateModule } from '@angular/material/core';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { FormModule } from '@pe/forms';
import { I18nModule } from '@pe/i18n';
import { PETextEditorModule } from '@pe/text-editor';
import {
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebExpandablePanelModule,
  PebFormFieldTextareaModule,
  PebButtonModule,
  PebMessagesModule,
  PebLogoPickerModule,
  PebSelectModule,
  PeInputPickerModule,
  PebProductPickerModule,
} from '@pe/ui';

export const i18n = I18nModule.forRoot();

const modules = [
  CommonModule,
  FormsModule,
  ReactiveFormsModule,
  PETextEditorModule,
  MatNativeDateModule,
  MatMomentDateModule,
  FormModule,
  NgScrollbarModule,
  MatMenuModule,
  MatProgressSpinnerModule,
  PebButtonToggleModule,
  PebFormBackgroundModule,
  PebFormFieldInputModule,
  PebExpandablePanelModule,
  PebFormFieldTextareaModule,
  PebButtonModule,
  PebMessagesModule,
  PebLogoPickerModule,
  PebSelectModule,
  PeInputPickerModule,
  PebProductPickerModule,
];

@NgModule({
  imports: [
    ...modules,
    i18n,
  ],
  exports: [
    ...modules,
    I18nModule,
  ],
})
export class SharedModule { }
