import { Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-text',
  templateUrl: './text.component.html',
  styleUrls: [
    '../common.widget.scss',
    './text.component.scss',
  ],
})
export class TextComponent extends AbstractWidgetComponent {
}
