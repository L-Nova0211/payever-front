import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { AppThemeEnum } from '@pe/common';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-seller-section',
  templateUrl: './seller.component.html',
  styleUrls: ['./seller.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class SellerSectionComponent extends BaseSectionClass {
  @Input() theme: AppThemeEnum = AppThemeEnum.default;

  get sellerName(): string {
    return this.order.seller?.name;
  }

  get sellerEmail(): string {
    return this.order.seller?.email;
  }
}
