import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-tool-blocks-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 12 12">
        <defs>
            <linearGradient id="blocks" x1="50%" x2="50%" y1=".153%" y2="99.276%">
                <stop offset="0%" stop-color="#EEF09A"/>
                <stop offset="100%" stop-color="#EBB42A"/>
            </linearGradient>
        </defs>
        <path fill="url(#blocks)" fill-rule="evenodd" d="M317 13a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h2zm8 0a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-4a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1h4zm0-8a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1h-10a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10z" transform="translate(-314 -5)"/>
    </svg>
  `,
})
export class PebEditorToolBlocksComponent {
}
