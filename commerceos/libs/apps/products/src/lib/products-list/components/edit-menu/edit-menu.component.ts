import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AppThemeEnum, MessageBus, EnvService } from '@pe/common';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pf-edit-menu',
  templateUrl: 'edit-menu.component.html',
  styleUrls: ['./edit-menu.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditMenuComponent {

  item: any;

  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  constructor(
    private messageBus: MessageBus,
    private envService: EnvService,
  ) {
  }

  edit() {
    this.messageBus.emit('products.edit.menu', this.item)
  }

  delete() {
    this.messageBus.emit('products.delete.menu', this.item)
  }

}
