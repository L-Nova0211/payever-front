import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';

@Component({
  selector: 'peb-percentage',
  templateUrl: './percentage.component.html',
  styleUrls: ['./percentage.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePercentageComponent extends AbstractWidgetDirective {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService) {
    super();
  }

  /** Gets graph procentage */
  getGraphPercentage() {
    return `${
      this.config?.dataSource[1][0] ? this.config?.dataSource[1][0]?.value?.toString().replace(/[^0-9]/g, '') : 0
    }, 100`;
  }
}
