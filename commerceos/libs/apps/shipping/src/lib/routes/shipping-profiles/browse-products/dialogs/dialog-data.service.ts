import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { filter, take } from 'rxjs/operators';

import { AppThemeEnum, EnvService } from '@pe/common';

import { DialogData, DialogDataExampleDialogComponent } from './dialog-data.component';

@Injectable({ providedIn: 'root' })
export class ConfirmDialogService {
  theme = AppThemeEnum.default;
  private dialogRef: MatDialogRef<DialogDataExampleDialogComponent>;

  constructor(private dialog: MatDialog,
              private envService: EnvService,
  ) {}

  public open(options: DialogData) {
    this.theme = this.envService.businessData?.themeSettings?.theme
      ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
      : AppThemeEnum.default;
    this.dialogRef = this.dialog.open(DialogDataExampleDialogComponent, {
      disableClose: true,
      panelClass: `my-panel-${this.theme}`,
      data: options,
    });
  }

  public onCancelClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => data?.cancel),
    );
  }

  public onConfirmClick(): Observable<any> {
    return this.dialogRef.afterClosed().pipe(
      take(1),
      filter(data => !data?.cancel),
    );
  }

  public closeDialog() {
    this.dialog.closeAll();
  }
}
