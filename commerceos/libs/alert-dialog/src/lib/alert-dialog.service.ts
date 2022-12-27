import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PeAlertDialogComponent } from './alert-dialog.component';
import { PeAlertDialogConfig, PeAlertDialogData, PeAlertDialogIcon } from './alert-dialog.interface';

@Injectable()
export class PeAlertDialogService {

  private readonly defaultData: PeAlertDialogData = {
    title: 'Are you sure?',
    subtitle: 'Do you really want to close?',
    icon: PeAlertDialogIcon.Alert,
    actions: [
      {
        label: 'Yes',
        callback: () => Promise.resolve(true),
      },
      {
        label: 'No',
        callback: () => Promise.resolve(false),
      },
    ],
  };

  constructor(
    private dialog: MatDialog,
  ) { }

  open(config?: PeAlertDialogConfig): MatDialogRef<PeAlertDialogComponent> {
    const dialogRef = this.dialog.open(PeAlertDialogComponent, {
      ...config,
      panelClass: config?.panelClass ?? 'pe-alert-dialog__panel',
      backdropClass: config?.backdropClass ?? 'pe-alert-dialog__backdrop',
      data: {
        ...this.defaultData,
        ...config?.data,
      },
      width: config?.width ?? '260px',
      disableClose: config?.disableClose ?? true,
    });

    return dialogRef;
  }
}
