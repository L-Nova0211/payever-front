import { Component } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum } from '@pe/common';

@Component({
  selector: 'widget-skeleton',
  templateUrl: './skeleton.component.html',
  styleUrls: ['./skeleton.component.scss'],
})
export class WidgetSkeletonComponent {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  theme: AppThemeEnum;

  constructor() {
    this.theme = AppThemeEnum[this.businessData?.themeSettings?.theme] || 'dark';
  }
}
