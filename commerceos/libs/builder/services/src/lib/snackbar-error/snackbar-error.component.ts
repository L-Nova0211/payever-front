import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

import { PebElementStyles } from '@pe/builder-core';

interface PebEditorSnackbarDataInterface {
  text?: string;
  retryBtnCaption?: string;
  hideBtnCaption?: string;
  errorText?: string;
  textStyles?: PebElementStyles;
  actionStyles?: PebElementStyles;
  reloadOnHide: boolean;
  retryAction?: () => void;
  cancelAction?: () => void;
}

@Component({
  selector: 'peb-themes-snackbar-error',
  templateUrl: './snackbar-error.component.html',
  styleUrls: ['./snackbar-error.component.scss'],
})
export class PebEditorSnackbarErrorComponent {

  constructor(
    public snackBarRef: MatSnackBarRef<PebEditorSnackbarErrorComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: PebEditorSnackbarDataInterface,
  ) {}

  onRetryClick() {
    this.data.retryAction();
    this.snackBarRef.dismiss();
  }

  onHideClick() {
    if (this.data.cancelAction) {
      this.data.cancelAction();
    }
    this.snackBarRef.dismiss();

    if (this.data.reloadOnHide) {
      window.location.reload();
    }
  }
}
