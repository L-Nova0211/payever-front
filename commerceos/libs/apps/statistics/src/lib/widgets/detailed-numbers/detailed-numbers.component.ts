import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { AbstractWidgetDirective } from '../abstract.widget';

@Component({
  selector: 'peb-detailed-numbers',
  templateUrl: './detailed-numbers.component.html',
  styleUrls: ['./detailed-numbers.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DetailedNumbersComponent extends AbstractWidgetDirective {
  /** Selected theme */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Binds theme class */
  @HostBinding('class') class = `${this.theme}-widget`;

  constructor(private envService: EnvService, private cdr: ChangeDetectorRef) {
    super();
  }

  /** Row number depending on widget size */
  getRowsNumber() {
    return ['small', 'medium'].includes(this.config.size) || !this.config.size ? 4 : 8;
  }

  /** Checks if row is empty if its empty row is hidden */
  checkIfEmpty(row: any[]) {
    return row.filter((cell: string | number) => cell === undefined).length === 3;
  }
}
