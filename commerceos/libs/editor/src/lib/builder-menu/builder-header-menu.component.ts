import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, MessageBus } from '@pe/common';

import { PeBuilderHeaderMenuActionsEnum } from '../enums';
import { PeBuilderHeaderMenuDataInterface } from '../interfaces';

@Component({
  selector: 'pe-builder-header-menu',
  templateUrl: './builder-header-menu.component.html',
  styleUrls: ['./builder-header-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeBuilderHeaderMenuComponent {
  public actionPublish = this.menuData.action === PeBuilderHeaderMenuActionsEnum.SetBuilderPublish;
  public theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    @Inject(MAT_DIALOG_DATA) public menuData: PeBuilderHeaderMenuDataInterface | any,
    public dialogRef: MatDialogRef<PeBuilderHeaderMenuComponent>,
    
    private messageBus: MessageBus,
    private pebEnvService: PebEnvService,
  ) { }

  public onCloseClick(): void {
    this.dialogRef.close();
  }

  public setValue(value): void {
    this.messageBus.emit(this.menuData.action, value);
    this.dialogRef.close();
  }
}
