import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorSnackbarComponent } from './snackbar.component';


@NgModule({
  declarations: [
    PebEditorSnackbarComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    PebEditorSnackbarComponent,
  ],
})
export class PebEditorSnackbarModule {}
