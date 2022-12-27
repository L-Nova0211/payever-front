import { Component, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'peb-editor-tool-view-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20">
      <path fill="#FFF" fill-rule="nonzero" d="M16.667 3.333H3.333c-.916 0-1.658.75-1.658 1.667l-.008 10c0 .917.75 1.667 1.666 1.667h13.334c.916 0 1.666-.75 1.666-1.667V5c0-.917-.75-1.667-1.666-1.667zM2.333 7.5h8.75v3.917h-8.75V7.5zm0 4.583h8.75V16H3.167a.836.836 0 0 1-.834-.833v-3.084zM16.833 16h-4.79V7.387h5.624v7.78a.836.836 0 0 1-.834.833z"/>
    </svg>
  `,
  encapsulation: ViewEncapsulation.None,
})
export class PebEditorToolViewComponent {
}
