import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { BaseStyleItemComponent } from '../base-item.component';

@Component({
  selector: 'pe-style-color-picker',
  templateUrl: './color-picker.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleColorPickerComponent extends BaseStyleItemComponent {
  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }
}
