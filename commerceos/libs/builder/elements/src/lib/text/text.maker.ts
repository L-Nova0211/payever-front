import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { PebAbstractTextElement } from '@pe/builder-abstract';
import { ContentOverflow, getContentDimensions, PebElementType, PebTextVerticalAlign } from '@pe/builder-core';
import { getBackgroundStyle } from '@pe/builder-renderer';
import { PebTextEditorService } from '@pe/builder-text-editor';

@Component({
  selector: 'peb-element-text-maker',
  template: `
    <div class="content-wrap" #contentWrap>
      <peb-text-editor
        *ngIf="style$ | async"
        [text]="content$ | async"
        [document]="document"
        [scale]="options.scale"
        [readOnly]="options.readOnly"
        [autosize]="autosize"
        [verticalAlign]="verticalAlign"
        [enabled]="editorEnabled$ | async"
        (textChanged)="onTextChanged($event)"
      ></peb-text-editor>
    </div>
  `,
  styleUrls: ['./text.maker.scss'],
  providers: [
    PebTextEditorService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebTextMakerElement extends PebAbstractTextElement implements ContentOverflow, OnInit {

  /**
   * Keep same object reference on text editor autosize input binding,
   * when no `textAutosize` field in element's data to prevent unnecessary change detection
   */
  static textAutosize = {  width: false, height: false };

  @ViewChild('contentWrap') contentWrap: ElementRef;

  get document() {
    return this.editorAccessorService.iframe?.contentDocument ?? Document;
  }

  get verticalAlign(): PebTextVerticalAlign {
    return this.styles.verticalAlign ?? PebTextVerticalAlign.Top;
  }

  get autosize(): { width: boolean; height: boolean } {
    return this.element?.data?.textAutosize ?? PebTextMakerElement.textAutosize;
  }

  getContentDimensions() {
    return getContentDimensions(this.contentWrap.nativeElement);
  }

  get mappedStyles() {
    const styles = this.styles as any;

    /**
     * Safari 100% height inside css grid fix, in chrome otherwise inline-grid have strange behavior.
     * TODO: refactor CSS without using height 100%
     */
    const isSafari = /Safari/.test(navigator.userAgent) && /Apple Computer/.test(navigator.vendor);

    return {
      host: {
        display: isSafari ? 'inline-grid' : 'inline-block',
        position: this.element.parent?.type === PebElementType.Grid ? 'relative' : 'absolute',
        transform: styles.transform || null,
        boxShadow: styles.boxShadow || null,
        textShadow: styles.textShadow ? styles.textShadow : null,
        border: styles.border ? styles.border : null,
        ...getBackgroundStyle(styles),

        ...('top' in styles && { top: `${styles.top}px` }),
        ...('left' in styles && { left: `${styles.left}px` }),
        ...('backgroundColor' in styles && { backgroundColor: styles.backgroundColor }),

        padding: styles.padding ? `${styles.padding}px` : null,
        overflowWrap: styles.overflowWrap || null,

        width: `${styles.width}px`,
        height: `${styles.height}px`,
        zIndex: styles.zIndex ?? null,

        ...('minWidth' in styles && { minWidth: `${styles.minWidth}px` }),
        ...('minHeight' in styles && { minHeight: `${styles.minHeight}px` }),

        ...('maxWidth' in styles && { maxWidth: `${styles.maxWidth}px` }),
        ...('maxHeight' in styles && { maxHeight: `${styles.maxHeight}px` }),
      },
    };
  }
}
