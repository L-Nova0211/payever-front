import { Component, Input } from '@angular/core';

export interface SectionInterface {
  title: string;
  value: string;
}

@Component({
  selector: 'widget-statistics',
  templateUrl: './widget-statistics.component.html',
  styleUrls: ['./widget-statistics.component.scss'],
})
export class WidgetStatisticsComponent {
  @Input() sections: SectionInterface[] = [];

  constructor() {}
}
