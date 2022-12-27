import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-tool-sections-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="21" height="20" viewBox="0 0 21 20">
        <defs>
            <linearGradient id="sections" x1="50%" x2="50%" y1=".153%" y2="99.276%">
                <stop offset="0%" stop-color="#EEF09A"/>
                <stop offset="100%" stop-color="#EBB42A"/>
            </linearGradient>
        </defs>
        <path fill="url(#sections)" fill-rule="evenodd" d="M15 14c.552 0 1 .448 1 1s-.448 1-1 1H5c-.552 0-1-.448-1-1s.448-1 1-1h10zm0-3c.552 0 1 .448 1 1s-.448 1-1 1H5c-.552 0-1-.448-1-1s.448-1 1-1h10zm0-7c.552 0 1 .448 1 1v4c0 .552-.448 1-1 1H5c-.552 0-1-.448-1-1V5c0-.552.448-1 1-1h10z" transform="translate(.364)"/>
    </svg>
  `,
})
export class PebEditorToolSectionsComponent {
}
