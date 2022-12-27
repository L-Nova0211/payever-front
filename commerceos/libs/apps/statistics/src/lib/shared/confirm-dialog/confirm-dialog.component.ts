import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

import { PeOverlayRef, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'pe-confirm-dialog',
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export class PeConfirmDialog {
  constructor(
    matIconRegistry: MatIconRegistry,
    sanitizer: DomSanitizer,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    private dialogRef: PeOverlayRef,
  ) {
    matIconRegistry.addSvgIcon(
      'icon-warning',
      sanitizer.bypassSecurityTrustResourceUrl('assets/icons/icons-warning.svg'),
    );
  }

  /** Closes confirm dialog with true */
  onConfirm() {
    this.dialogRef.close(true);
  }

  /** Closes confirm dialog with false */
  onDecline() {
    this.dialogRef.close(false);
  }
}
