import { ChangeDetectionStrategy, Component } from '@angular/core';

import { BaseSectionClass } from '../../../../classes/base-section.class';

@Component({
  selector: 'pe-timeline-section',
  templateUrl: './timeline.component.html',
  styleUrls: ['./timeline.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class TimelineSectionComponent extends BaseSectionClass {
}
