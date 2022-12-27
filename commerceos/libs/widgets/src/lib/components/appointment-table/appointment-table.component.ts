import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-appointment-table',
  templateUrl: './appointment-table.component.html',
  styleUrls: [
    '../common.widget.scss',
    './appointment-table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppointmentTableComponent extends AbstractWidgetComponent {  
}
