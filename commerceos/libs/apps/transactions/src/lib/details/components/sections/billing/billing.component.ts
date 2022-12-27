import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-billing-section',
  templateUrl: './billing.component.html',
  styleUrls: ['./billing.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class BillingSectionComponent extends BaseSectionClass {
}
