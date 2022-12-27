import { ChangeDetectionStrategy, Component, ElementRef, Input, ViewChild } from '@angular/core';

import { PebIntegrationData, PEB_DEFAULT_FONT_SIZE } from '@pe/builder-core';
import { PebAbstractStyledElement } from '@pe/builder-renderer';

@Component({
  selector: 'peb-shape-textarea-element-ui',
  template: `
    <div class="shape-textarea__wrapper" #wrapperRef>
      <span #inputSpanRef class="shape-textarea__input">{{ integrationLink?.title | rendererTranslate:options }}</span>
    </div>
  `,
  styleUrls: ['./shape-textarea.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapeTextareaElementUi extends PebAbstractStyledElement {

  @Input() integrationLink: PebIntegrationData;

  @ViewChild('wrapperRef') wrapperRef: ElementRef;
  @ViewChild('inputRef') inputRef: ElementRef;
  @ViewChild('inputSpanRef') inputSpanRef: ElementRef;

  protected get elements(): { [p: string]: HTMLElement | HTMLElement[] } {
    return {
      host: this.nativeElement,
      wrapper: this.wrapperRef?.nativeElement,
      inputSpan: this.inputSpanRef?.nativeElement,
    };
  }

  protected get mappedStyles() {
    return {
      host: {
        fontSize: PEB_DEFAULT_FONT_SIZE,
      },
      wrapper: {
        padding: 11,
      },
      input: {
        fontSize: PEB_DEFAULT_FONT_SIZE,
      },
      inputSpan: {
        fontSize: PEB_DEFAULT_FONT_SIZE,
      },
    };
  }
}
