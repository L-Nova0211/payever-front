import { Component, EventEmitter, Input, Output } from '@angular/core';

import { AppThemeEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';

import { BusinessEnvService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-settings-context-menu',
  templateUrl: './context-menu.component.html',
  styleUrls: ['./context-menu.component.scss'],
})
export class PebWallpapersContextMenuComponent extends AbstractComponent {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @Input() actions: any;
  @Output() close: EventEmitter<void> = new EventEmitter();

  constructor(
    private envService: BusinessEnvService,
    protected translateService: TranslateService,
  ) {
    super();
  }

  closeContextMenu() {
    this.close.emit();
  }

  onChange(event, action) {
    action.callback(event);
  }
}
