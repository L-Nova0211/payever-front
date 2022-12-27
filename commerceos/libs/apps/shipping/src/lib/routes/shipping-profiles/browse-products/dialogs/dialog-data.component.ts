import {
  Component,
  EventEmitter,
  HostListener,
  Inject,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { AppThemeEnum, EnvService } from '@pe/common';

export interface DialogData {
  subject?: string;
  title: string;
  subtitle: string;
  subtitle1?: string;
  cancelButtonTitle: string;
  confirmButtonTitle: string;
}

/**
 * @title Injecting data when opening a dialog
 */

@Component({
  selector: 'dialog-data-example-dialog',
  templateUrl: 'dialog-data.component.html',
  styleUrls: ['./dialog-data.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class DialogDataExampleDialogComponent {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @Output() onCancel: EventEmitter<void> = new EventEmitter();
  @Output() onConfirm: EventEmitter<void> = new EventEmitter();
  @Input() icon = 'icon-alert-24';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: DialogData,
    public dialogRef: MatDialogRef<DialogDataExampleDialogComponent>,
    private envService: EnvService,
  ) {}

  onCancelClick(): void {
    this.onCancel.emit();
    this.dialogRef.close({
      cancel: true,
    });
  }

  onConfirmClick(): void {
    this.onConfirm.emit();
    this.dialogRef.close({
      cancel: false,
    });
  }

  @HostListener('keydown.esc')
  public onEsc() {
    this.onCancelClick();
  }
}
