import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-html-document-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="18" style="padding: 6px 4px 6px 3px;" viewBox="0 0 18 18">
      <g id="html" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round">
          <line x1="6.5" y1="14.5" x2="11.5" y2="3.5" id="Line" stroke="#797979" stroke-width="1.5"></line>
          <polyline id="Path" stroke="#797979" stroke-width="1.5" transform="translate(15.000000, 9.500000) rotate(-270.000000) translate(-15.000000, -9.500000) " points="12 11 15 8 18 11"></polyline>
          <polyline id="Path-Copy" stroke="#797979" stroke-width="1.5" transform="translate(3.000000, 9.500000) scale(-1, 1) rotate(-270.000000) translate(-3.000000, -9.500000) " points="0 11 3 8 6 11"></polyline>
      </g>
    </svg>
  `,
})
export class PebEditorHTMLDocumentIconComponent { }
