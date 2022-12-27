import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-shipping-section',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class ShippingSectionComponent extends BaseSectionClass {
}
