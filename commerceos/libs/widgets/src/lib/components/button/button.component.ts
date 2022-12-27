import { ChangeDetectionStrategy, Component } from '@angular/core';

import { AbstractWidgetComponent } from '../abstract-widget.component';

@Component({
  selector: 'pe-widget-button',
  templateUrl: './button.component.html',
  styleUrls: [
    '../common.widget.scss',
    './button.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ButtonComponent extends AbstractWidgetComponent {
  get isSingleButtonWithLabel() {
    return this.widget.data.length === 2 && this.widget.data.filter(item => item.isButton).length === 1;
  }

  get isDoubleButtons() {
    return this.widget.data.length === 2 && this.widget.data.filter(item => item.isButton).length === 2;
  }
}
