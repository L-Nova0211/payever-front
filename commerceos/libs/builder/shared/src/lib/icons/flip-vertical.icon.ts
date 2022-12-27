import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-flip-vertical-icon',
  styles: ['svg {transform: rotate(90deg)}'],
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="9" viewBox="0 0 13 9">
      <g fill="none">
        <path fill="#989898" d="M0 4.5L5 0 5 9z"/>
        <path fill="#FFF" d="M8 4.5L13 0 13 9z" transform="matrix(-1 0 0 1 21 0)"/>
      </g>
    </svg>
  `,
})
export class PebEditorFlipVerticalComponent {
}
