import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { PebEditorSnackbarErrorComponent } from './snackbar-error.component';


@NgModule({
  declarations: [
    PebEditorSnackbarErrorComponent,
  ],
  imports: [
    CommonModule,
  ],
  exports: [
    PebEditorSnackbarErrorComponent,
  ],
})
export class PebEditorSnackbarErrorModule {}
