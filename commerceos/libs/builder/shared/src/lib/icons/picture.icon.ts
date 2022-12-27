import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-picture-icon',
  template: `
      <svg [attr.fill]="color" viewBox="0 0 16 16" version="1.1" xmlns="http://www.w3.org/2000/svg"
           xmlns:xlink="http://www.w3.org/1999/xlink">
          <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
              <g id="2-Image-2" transform="translate(-621.000000, -79.000000)" [attr.fill]="color" fill-rule="nonzero">
                  <g id="Group-9" transform="translate(610.000000, 70.000000)">
                      <path d="M27,23.2222222 L27,10.7777778 C27,9.8 26.2,9 25.2222222,9 L12.7777778,9 C11.8,9 11,9.8 11,10.7777778 L11,23.2222222 C11,24.2 11.8,25 12.7777778,25 L25.2222222,25 C26.2,25 27,24.2 27,23.2222222 Z M16.2444444,18.76 L18.1111111,21.0088889 L20.8666667,17.4622222 C21.0444444,17.2311111 21.4,17.2311111 21.5777778,17.4711111 L24.6977778,21.6311111 C24.92,21.9244444 24.7066667,22.3422222 24.3422222,22.3422222 L13.6844444,22.3422222 C13.3111111,22.3422222 13.1066667,21.9155556 13.3377778,21.6222222 L15.5511111,18.7777778 C15.72,18.5466667 16.0577778,18.5377778 16.2444444,18.76 Z"
                            id="pic-1"></path>
                  </g>
              </g>
          </g>
      </svg>
  `,
})
export class PebEditorPictureComponent {
  @Input() color = '#FFFFFF';
}

