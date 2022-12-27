import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';



@Component({
  selector: 'peb-simple-numbers',
  templateUrl: './simple-numbers.component.html',
  styleUrls: ['./simple-numbers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SimpleNumbersComponent extends AbstractWidgetDirective {
  /** Slected theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Bind theme class */
  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService, private cdr: ChangeDetectorRef) {
    super();
  }
}
