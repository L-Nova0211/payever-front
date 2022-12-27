import { Injectable } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum } from '@pe/common';

import { PebEditorScriptsDialog } from './scripts.dialog';


@Injectable()
export class PebEditorScriptsDialogService {

  readonly theming = this.pebEnvService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private dialog: MatDialog,
    private pebEnvService: PebEnvService,
  ) {
  }

  openScriptsDialog(): MatDialogRef<PebEditorScriptsDialog> {
    return this.dialog.open(PebEditorScriptsDialog, {
      panelClass: ['scripts-dialog__panel', this.theming],
      width: '436px',
    });
  }
}
