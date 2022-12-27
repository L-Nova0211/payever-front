import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { ConfirmActionDialogStylesComponent } from './components/confirm-action-dialog-styles.component';
import { ConfirmActionDialogComponent } from './components/confirm-action-dialog.component';

@NgModule({
  declarations: [
    ConfirmActionDialogComponent,
    ConfirmActionDialogStylesComponent,
  ],
  imports: [
    CommonModule,

    MatIconModule,
    MatDialogModule,
  ],
  exports: [
    ConfirmActionDialogComponent,
  ],
})

export class PebConfirmActionDialogModule {}
