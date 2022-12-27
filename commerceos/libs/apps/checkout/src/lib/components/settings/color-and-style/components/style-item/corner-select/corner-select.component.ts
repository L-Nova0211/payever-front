import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { CORNERS, CORNERS_ICONS } from '../../../constants';
import { BaseStyleItemComponent } from '../base-item.component';

@Component({
  selector: 'pe-style-corner-select',
  templateUrl: './corner-select.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleCornerSelectComponent extends BaseStyleItemComponent {
  readonly corners = CORNERS;
  readonly cornersIcons = CORNERS_ICONS;

  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }

  setSelectedCorner(br: string): void {
    this.control.setValue(br);
  }

  get selectedCorner(): string {
    return this.control.value;
  }
}
