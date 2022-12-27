import { ChangeDetectionStrategy, Component, HostBinding } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';

@Component({
  selector: 'peb-two-columns',
  templateUrl: './two-columns.component.html',
  styleUrls: ['./two-columns.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TwoColumnsComponent extends AbstractWidgetDirective {
  /** Selected theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Bind theme class */
  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService) {
    super();
  }
}
