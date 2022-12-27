import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

import { PebFormFieldInputModule, PebFormFieldTextareaModule, PebSelectModule } from '@pe/ui';

import { PebEditorScriptFormDialog } from './script-form.dialog';
import { PebEditorScriptsDialog } from './scripts.dialog';
import { PebEditorScriptsDialogService } from './scripts.service';


@NgModule({
  declarations: [PebEditorScriptsDialog, PebEditorScriptFormDialog],
  imports: [
    CommonModule,
    MatExpansionModule,
    MatIconModule,
    MatFormFieldModule,
    MatSelectModule,
    PebFormFieldInputModule,
    PebSelectModule,
    PebFormFieldTextareaModule,
    ReactiveFormsModule,
  ],
  providers: [PebEditorScriptsDialogService],
  exports: [PebEditorScriptsDialog],
})
export class PebEditorScriptsDialogModule { }
