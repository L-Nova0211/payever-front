import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig, MatSnackBarRef } from '@angular/material/snack-bar';

import { SnackbarComponent } from './snackbar.component';
import { SnackbarConfig } from './snackbar.model';

const DEFAULT_CONTENT = '';
const DEFAULT_DURATION = 5000;

@Injectable()
export class SnackbarService {

  private snackBarRef: MatSnackBarRef<SnackbarComponent>;

  constructor(
    private snackBar: MatSnackBar,
  ) { }

  toggle(isVisible: boolean, config?: Partial<SnackbarConfig>, snackBarConfig?: MatSnackBarConfig): MatSnackBarRef<SnackbarComponent> | null {
    if (isVisible) {
      const sbc: MatSnackBarConfig = {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        ...snackBarConfig,
        panelClass: `cos-snackbar`,
        data: {
          content: DEFAULT_CONTENT,
          duration: DEFAULT_DURATION,
          hideCallback: this.hide,
          useShowButton: false,
          iconId: 'icon-alert-24',
          iconSize: 24,
          ...config,
          ...snackBarConfig?.data,
        },
        duration: config.duration ?? snackBarConfig?.duration ?? DEFAULT_DURATION,
      };
      this.snackBarRef = this.snackBar.openFromComponent(SnackbarComponent, sbc);

      return this.snackBarRef;
    } else {
      this.hide();

      return null;
    }
  }

  hide = () => {
    this.snackBarRef?.dismiss();
  }

}
