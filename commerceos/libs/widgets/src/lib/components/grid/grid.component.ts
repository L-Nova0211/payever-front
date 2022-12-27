import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-grid',
  templateUrl: './grid.component.html',
  styleUrls: [
    '../common.widget.scss',
    './grid.component.scss',
  ],
})
export class GridComponent extends AbstractWidgetComponent {

}
