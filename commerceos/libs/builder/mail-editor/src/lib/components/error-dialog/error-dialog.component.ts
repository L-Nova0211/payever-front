import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'peb-error-dialog',
  templateUrl: './error-dialog.component.html',
  styleUrls: ['./error-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorDialogComponent {

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<ErrorDialogComponent>,
  ) {}

  onSet() {
    this.data.setAction();
    this.dialogRef.close();
  }

  onCancel() {
    console.log(this.data);
    if (this.data.cancelAction) {
      this.data.cancelAction();
    }
    this.dialogRef.close();

    if (this.data.reloadOnHide) {
      window.location.reload();
    }
  }
}
