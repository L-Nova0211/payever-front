import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'sandbox-settings-dialog',
  templateUrl: './settings.dialog.html',
  styleUrls: ['./settings.dialog.scss'],
})
export class SandboxSettingsDialog {
  constructor(
    private dialogRef: MatDialogRef<SandboxSettingsDialog>,
    @Inject(MAT_DIALOG_DATA) private data: any,
  ) {}

  onDeleteDB() {
    this.data.deleteLocalDB();
  }

  close() {
    this.dialogRef.close();
  }
}
