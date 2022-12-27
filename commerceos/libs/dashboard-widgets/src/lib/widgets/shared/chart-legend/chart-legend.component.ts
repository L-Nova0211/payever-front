import { Component, HostBinding, Input, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'chart-legend',
  templateUrl: './chart-legend.component.html',
  styleUrls: ['./chart-legend.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChartLegendComponent {
  @Input() set values(values: string[]) {
    this.isOneElement = values && values.length === 1;
    this.legendValues = values;
  }

  @HostBinding('class.one-element') isOneElement: boolean;

  legendValues: string[];
}
