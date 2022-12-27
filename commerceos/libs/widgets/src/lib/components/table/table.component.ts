import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-table',
  templateUrl: './table.component.html',
  styleUrls: [
    '../common.widget.scss',
    './table.component.scss',
  ],
})
export class TableComponent extends AbstractWidgetComponent {

}
