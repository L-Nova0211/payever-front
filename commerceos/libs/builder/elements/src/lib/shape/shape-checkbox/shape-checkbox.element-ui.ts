import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { PebIntegrationData, PEB_DEFAULT_FONT_SIZE } from '@pe/builder-core';
import { PebAbstractStyledElement } from '@pe/builder-renderer';


@Component({
  selector: 'peb-shape-checkbox-element-ui',
  template: `
    <div class="shape-checkbox__wrapper" #wrapperRef>
      <span #inputSpanRef class="shape-checkbox__input">{{ integrationLink?.title | rendererTranslate:options }}</span>
    </div>
  `,
  styleUrls: ['./shape-checkbox.element-ui.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapeCheckboxElementUi extends PebAbstractStyledElement {

  @Input() integrationLink: PebIntegrationData;

  protected get elements(): { [p: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
    };
  }

  protected get mappedStyles(): any {
    return {
      host: {
        fontSize: PEB_DEFAULT_FONT_SIZE,
      },
    };
  }
}
