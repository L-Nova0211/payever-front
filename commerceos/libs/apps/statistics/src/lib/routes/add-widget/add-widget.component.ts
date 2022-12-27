import { ChangeDetectionStrategy, Component, HostBinding, Input, OnInit } from '@angular/core';

import { AppThemeEnum, EnvService } from '@pe/common';

import { PeStatisticsItem, PeStatisticsSingleSelectedAction } from '../../interfaces/statistics.interface';

/**
 * @deprecated
 */
@Component({
  selector: 'peb-add-widget',
  templateUrl: './add-widget.component.html',
  styleUrls: ['./add-widget.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddWidgetComponent {
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  @HostBinding('class') class = `${this.theme}-widget`;

  @Input() item: PeStatisticsItem;
  @Input() actions: PeStatisticsSingleSelectedAction[];

  isLoading = false;

  constructor(private envService: EnvService) {}

  onAction(event: MouseEvent, action: PeStatisticsSingleSelectedAction) {
    event.stopPropagation();
    event.preventDefault();

    action.callback();
  }
}
