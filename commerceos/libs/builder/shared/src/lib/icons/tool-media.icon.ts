import { Component } from '@angular/core';

import { AbstractGradientIconComponent } from './abstract-gradient.icon';

const ID = 'peb-editor-tool-media-icon-gradient';

@Component({
  selector: 'peb-editor-tool-media-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20">
        <defs>
            <linearGradient [attr.id]="id" x1="41.438%" x2="41.438%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="#17BFEA"/>
                <stop offset="100%" stop-color="#879CFF"/>
            </linearGradient>
        </defs>
        <path [attr.fill]="fillUrl" fill-rule="nonzero" d="M6.163 14.6h7.674c1.197 0 2.163-.918 2.163-2.056V7.057C16 5.92 15.034 5 13.837 5H6.163C4.966 5 4 5.919 4 7.057v5.487c0 1.138.966 2.057 2.163 2.057zm-1.298-2.056V11.39l3.78-2.345 4.73 4.732H6.163c-.72 0-1.298-.549-1.298-1.234zm9.563 1.097l-3.188-3.196 1.515-1.371 2.38 2.18v1.29c0 .48-.289.891-.707 1.097zM6.163 5.823h7.674c.72 0 1.298.549 1.298 1.234v3.059l-2.077-1.893a.443.443 0 0 0-.592 0l-1.831 1.632-1.616-1.618a.454.454 0 0 0-.548-.055l-3.606 2.236v-3.36c0-.686.577-1.235 1.298-1.235z" transform="translate(.364)"/>
    </svg>
  `,
})
export class PebEditorToolMediaComponent extends AbstractGradientIconComponent {
  constructor() {
    super(ID);
  }
}
