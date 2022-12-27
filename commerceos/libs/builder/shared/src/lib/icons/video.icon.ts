import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-video-icon',
  template: `
      <svg width="20px" height="12px" viewBox="0 0 20 12" version="1.1" xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="15-add-video-1" transform="translate(-648.000000, -112.000000)" [attr.fill]="color" fill-rule="nonzero">
                  <g id="Group-2" transform="translate(637.000000, 66.000000)">
                      <path d="M29.6454017,47.1044001 C29.4246016,47.0030001 29.1638016,47.0396001 28.9794016,47.1986001 L25.3024013,50.3646004 L25.3024013,46.7536001 C25.3024013,46.398 25.0130013,46.1084 24.6572012,46.1084 L11.6450001,46.1084 C11.2894,46.1084 11,46.3978 11,46.7536001 L11,57.055201 C11,57.410601 11.2892,57.700401 11.6450001,57.700401 L24.6574012,57.700401 C25.0128013,57.700401 25.3028013,57.411201 25.3028013,57.055201 L25.3028013,53.4444007 L28.9798016,56.6102009 C29.1642016,56.769401 29.4254016,56.805801 29.6458017,56.704601 C29.8670017,56.6030009 30.0088017,56.3820009 30.0088017,56.1382009 L30.0088017,47.6706001 C30.0086017,47.4270001 29.8670017,47.2060001 29.6454017,47.1044001 Z"
                            id="video"></path>
                  </g>
              </g>
          </g>
      </svg>
  `,
})
export class PebEditorVideoComponent {
  @Input() color = '#FFFFFF';
}

