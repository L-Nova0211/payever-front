import { Component } from '@angular/core';

import { AbstractGradientIconComponent } from './abstract-gradient.icon';

const ID = 'peb-editor-tool-text-icon-gradient';

@Component({
  selector: 'peb-editor-tool-text-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="14" viewBox="0 0 13 14">
      <g fill="none" fill-rule="evenodd">
        <g fill="#0371E2" fill-rule="nonzero">
          <path d="M8.984 14v-.382H8.49c-.556 0-.967-.145-1.234-.434-.19-.213-.285-.75-.285-1.61V.878h2.014c.59 0 1.067.094 1.429.284.362.189.652.483.87.882.134.248.239.661.316 1.24H12L11.842 0H.169L0 3.283h.4c.05-.633.205-1.136.465-1.507.26-.372.573-.623.938-.754.281-.096.756-.144 1.424-.144h1.719v10.696c0 .784-.078 1.287-.232 1.507-.254.358-.682.537-1.287.537h-.506V14h6.063z" transform="translate(-477 -65) translate(163 56) translate(314.501 9)"/>
        </g>
      </g>
    </svg>`,
})
export class PebEditorToolTextComponent extends AbstractGradientIconComponent {
  constructor() {
    super(ID);
  }
}
