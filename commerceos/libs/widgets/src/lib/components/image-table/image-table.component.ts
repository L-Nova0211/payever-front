import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-image-table',
  templateUrl: './image-table.component.html',
  styleUrls: [
    '../common.widget.scss',
    './image-table.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageTableComponent extends AbstractWidgetComponent {  
}
