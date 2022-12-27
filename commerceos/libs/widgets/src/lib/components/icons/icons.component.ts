import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-icons',
  templateUrl: './icons.component.html',
  styleUrls: [
    '../common.widget.scss',
    './icons.component.scss',
  ],
})
export class IconsComponent extends AbstractWidgetComponent {

  constructor() {
    super();
  }

  getRetinaIcon(icon: string) {
    return (icon || '').replace('32', '64');
  }
}
