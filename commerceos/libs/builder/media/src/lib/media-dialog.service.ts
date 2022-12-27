import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { MediaDataInterface, PebMediaComponent } from './media.component';

@Injectable()
export class MediaDialogService {

  constructor(private dialog: MatDialog) { }

  openMediaDialog(data: MediaDataInterface = {}): MatDialogRef<PebMediaComponent> {
    return this.dialog.open(PebMediaComponent, {
      data,
      height: '82.3vh',
      maxHeight: '82.3vh',
      maxWidth: '78.77vw',
      width: '78.77vw',
      panelClass: 'studio-dialog',
    });
  }
}
