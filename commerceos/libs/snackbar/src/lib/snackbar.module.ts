import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';

import { SnackbarComponent } from './snackbar.component';
import { SnackbarService } from './snackbar.service';

@NgModule({
  declarations: [
    SnackbarComponent,
  ],
  imports: [
    CommonModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
  ],
  providers: [
    SnackbarService,
  ],
})
export class SnackbarModule {}
