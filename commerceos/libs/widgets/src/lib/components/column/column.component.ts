import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-column',
  templateUrl: './column.component.html',
  styleUrls: [
    '../common.widget.scss',
    './column.component.scss',
  ],
})
export class ColumnComponent extends AbstractWidgetComponent {
}
