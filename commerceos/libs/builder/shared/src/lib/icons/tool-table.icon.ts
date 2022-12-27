import { Component } from '@angular/core';

import { AbstractGradientIconComponent } from './abstract-gradient.icon';

const ID = 'peb-editor-tool-table-icon-gradient';

@Component({
  selector: 'peb-editor-tool-table-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20">
        <defs>
            <linearGradient [attr.id]="id" x1="50%" x2="50%" y1="0%" y2="152.549%">
                <stop offset="0%" stop-color="#FFA400"/>
                <stop offset="100%" stop-color="#F00"/>
            </linearGradient>
        </defs>
        <path [attr.fill]="fillUrl" fill-rule="evenodd" d="M16 12v1a1 1 0 0 1-1 1h-4v-2.001L16 12zm-6-.001V14H6a1 1 0 0 1-1-1v-1l5-.001zM16 9v2l-5-.001V9h5zm-1-3a1 1 0 0 1 1 1v1h-5V6h4zm-5 0v1.999L5 8V7a1 1 0 0 1 1-1h4zM5 9l5-.001v2L5 11V9z" transform="translate(.364)"/>
    </svg>
  `,
})
export class PebEditorToolTableComponent extends AbstractGradientIconComponent {
  constructor() {
    super(ID);
  }
}
