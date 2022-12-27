import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';

import { BaseStyleItemComponent } from '../base-item.component';

@Component({
  selector: 'pe-style-input-px',
  templateUrl: './input-px.component.html',
  styles: [`
    :host {
      display: contents;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StyleInputPxComponent extends BaseStyleItemComponent {
  constructor(
    protected injector: Injector
  ) {
    super(injector);
  }
}

