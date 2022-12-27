import { Component, ViewEncapsulation } from '@angular/core';

import { AbstractGradientIconComponent } from './abstract-gradient.icon';

const ID = 'peb-editor-tool-product-icon-gradient';

@Component({
  selector: 'peb-editor-tool-product-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20">
        <defs>
            <linearGradient [attr.id]="id" x1="50%" x2="50%" y1="0%" y2="98.595%">
                <stop offset="0%" stop-color="#FF5351"/>
                <stop offset="100%" stop-color="#C20000"/>
            </linearGradient>
        </defs>
        <path [attr.fill]="fillUrl" fill-rule="evenodd" d="M6.87 7.387a.676.676 0 1 1 0-1.352.676.676 0 0 1 0 1.352m2.892-2.2A.636.636 0 0 0 9.312 5L5.864 5A.863.863 0 0 0 5 5.863L5 9.313c0 .168.067.33.187.45l5.05 5.048a.642.642 0 0 0 .914 0l3.66-3.66a.647.647 0 0 0 0-.915l-5.049-5.05z" transform="translate(.364)"/>
    </svg>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class PebEditorToolProductComponent extends AbstractGradientIconComponent {
  constructor() {
    super(ID);
  }
}
