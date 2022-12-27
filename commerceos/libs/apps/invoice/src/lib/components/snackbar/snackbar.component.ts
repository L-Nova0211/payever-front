import { ChangeDetectionStrategy, Component, HostBinding, Inject } from '@angular/core';
import { MatSnackBarRef, MAT_SNACK_BAR_DATA } from '@angular/material/snack-bar';

interface PeInvoiceSnackbarDataInterface {
  width?: string;
  icon?: string;
  text?: string;
}

@Component({
  selector: 'pe-invoice-snackbar',
  templateUrl: './snackbar.component.html',
  styleUrls: ['./snackbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInvoiceSnackbarComponent {
  @HostBinding('style.width') get styleWidth(): string {
    return this.data.width || 'auto';
  }

  constructor(
    public snackBarRef: MatSnackBarRef<PeInvoiceSnackbarComponent>,
    @Inject(MAT_SNACK_BAR_DATA) public data: PeInvoiceSnackbarDataInterface,
  ) {}
}
