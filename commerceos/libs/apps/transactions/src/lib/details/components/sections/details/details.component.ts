import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-details-section',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class DetailsSectionComponent extends BaseSectionClass {
}
