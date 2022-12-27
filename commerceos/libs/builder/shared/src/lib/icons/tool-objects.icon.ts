import { Component } from '@angular/core';

import { AbstractGradientIconComponent } from './abstract-gradient.icon';

const ID = 'peb-editor-tool-objects-icon-gradient';

@Component({
  selector: 'peb-editor-tool-objects-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
        <defs>
            <linearGradient [attr.id]="id" x1="50%" x2="50%" y1="0%" y2="100%">
                <stop offset="0%" stop-color="#43E695"/>
                <stop offset="100%" stop-color="#3BB2B8"/>
            </linearGradient>
        </defs>
        <path [attr.fill]="fillUrl" fill-rule="nonzero" d="M9.54 7.53c.31 0 .562.237.562.53l.007 1.99c0 .242.182.457.43.504l1.968.509a.463.463 0 0 1 .386.45l-.004.093-.361 3.03a.28.28 0 0 1-.285.249H9.19a.714.714 0 0 1-.577-.287L6.621 11.92a.422.422 0 0 1-.083-.251c0-.18.114-.332.302-.404l.126-.047.102.085.999.84c.17.14.41.169.612.073.177-.083.291-.298.291-.513l.008-3.643c0-.293.251-.53.562-.53zM13.11 6A1.9 1.9 0 0 1 15 7.904a1.9 1.9 0 0 1-1.89 1.904h-1.547a.345.345 0 0 1-.344-.346c0-.192.153-.347.344-.347h1.546c.664 0 1.204-.543 1.204-1.211s-.54-1.212-1.204-1.212H5.891c-.664 0-1.204.544-1.204 1.212 0 .668.54 1.211 1.204 1.211h1.546c.19 0 .344.155.344.347a.345.345 0 0 1-.343.346H5.89A1.9 1.9 0 0 1 4 7.904 1.9 1.9 0 0 1 5.89 6h7.22z"/>
    </svg>
  `,
})
export class PebEditorToolObjectsComponent extends AbstractGradientIconComponent {
  constructor() {
    super(ID);
  }
}
