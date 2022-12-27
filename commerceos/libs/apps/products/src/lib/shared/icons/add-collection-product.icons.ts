import { Component, ElementRef } from '@angular/core';

@Component({
  selector: 'pe-data-add-collection-product-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="58" height="58" viewBox="0 0 58 58">
      <defs>
        <linearGradient id="f98673j0ca" x1="50%" x2="48.333%" y1="0%" y2="107.889%">
          <stop offset="0%" stop-color="#007DFE"/>
          <stop offset="100%" stop-color="#005CBB"/>
        </linearGradient>
      </defs>
      <g fill="none" fill-rule="evenodd">
        <g fill="url(#f98673j0ca)" fill-rule="nonzero" transform="translate(-384 -229)">
          <path d="M152.778 105.778h-22.556V83.222c0-1.78-1.442-3.222-3.222-3.222s-3.222 1.443-3.222 3.222v22.556h-22.556c-1.78 0-3.222 1.442-3.222 3.222s1.443 3.222 3.222 3.222h22.556v22.556c0 1.78 1.442 3.222 3.222 3.222s3.222-1.443 3.222-3.222v-22.556h22.556c1.78 0 3.222-1.442 3.222-3.222s-1.443-3.222-3.222-3.222z" transform="translate(286 149)"/>
        </g>
      </g>
    </svg>
  `,
})
export class PeDataAddCollectionProductIconComponent {
  elRef: ElementRef;

  constructor(elRef: ElementRef) {
    this.elRef = elRef;
  }

  getHtmlContent() {
    return this.elRef.nativeElement.innerHTML;
  }
}
