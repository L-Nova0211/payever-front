import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-order-section',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class OrderSectionComponent extends BaseSectionClass {
}
