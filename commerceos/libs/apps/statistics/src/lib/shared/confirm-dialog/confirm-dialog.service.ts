import { Injectable } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';

import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { PeConfirmDialog } from './confirm-dialog.component';

export interface ConfirmDialogContentsInterface {
  title: string;
  subtitle: string;
  confirmButton: string;
  declineButton: string;
}

@Injectable({ providedIn: 'any' })
export class ConfirmDialogService {
  confirmDialogRef: PeOverlayRef;

  afterClosed = new Subject<any>();
  constructor(private overlayService: PeOverlayWidgetService) {}

  /** Opens confirm dialog */
  openConfirmDialog(theme = 'dark', contents: ConfirmDialogContentsInterface) {
    const config: PeOverlayConfig = {
      panelClass: 'overlay-panel',
      data: { contents },
      headerConfig: {
        theme,
        hideHeader: true,
        title: 'Confirm',
      },
      component: PeConfirmDialog,
      backdropClick: () => {
        return EMPTY;
      },
    };
    this.confirmDialogRef = this.overlayService.open(config);
    this.confirmDialogRef.afterClosed.subscribe((val) => {
      this.afterClosed.next(val);
    });
  }
}
