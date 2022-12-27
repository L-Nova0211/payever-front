import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';

import { PeAlertDialogStylesComponent } from './alert-dialog-styles.component';
import { PeAlertDialogComponent } from './alert-dialog.component';
import { PeAlertDialogService } from './alert-dialog.service';

@NgModule({
  imports: [
    CommonModule,
    MatDialogModule,
  ],
  declarations: [
    PeAlertDialogComponent,
    PeAlertDialogStylesComponent,
  ],
  providers: [PeAlertDialogService],
  exports: [PeAlertDialogComponent],
})
export class PeAlertDialogModule {}
