import { Component, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';


interface PebEditorSnackbarDataInterface {
  text?: string;
  mainBtnCaption?: string;
  hideBtnCaption?: string;
  errorText?: string;
  textStyles?: CSSStyleDeclaration;
  actionStyles?: CSSStyleDeclaration;
  reloadOnHide: boolean;
  mainAction?: () => void;
  cancelAction?: () => void;
  pending?: boolean;
}

@Component({
  selector: 'peb-themes-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
})
export class PebEditorSnackbarComponent {

  constructor(
    public snackBarRef: MatSnackBarRef<PebEditorSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: PebEditorSnackbarDataInterface,
  ) {}

  onHideClick() {
    if (this.data.cancelAction) {
      this.data.cancelAction();
    }
    this.snackBarRef.dismiss();
  }

  onMainClick() {
    this.data?.mainAction();
    this.snackBarRef.dismiss();
  }
}
