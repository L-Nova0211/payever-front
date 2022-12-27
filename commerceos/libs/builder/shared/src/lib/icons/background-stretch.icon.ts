import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-background-stretch-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
      <defs>
          <path id="dphr0i1uja" d="M0 0H16V16H0z"/>
          <mask id="57f3x27nxb" width="16" height="16" x="0" y="0" fill="#fff" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox">
              <use xlink:href="#dphr0i1uja"/>
          </mask>
      </defs>
      <g fill="none" fill-rule="evenodd">
          <g>
              <g transform="translate(-1108 -268) translate(1108 268)">
                  <path fill="#FFF" fill-opacity=".5" d="M0 0H16V16H0z"/>
                  <use stroke="#FFF" stroke-dasharray="2.667" stroke-linejoin="round" stroke-width="1.778" mask="url(#57f3x27nxb)" xlink:href="#dphr0i1uja"/>
              </g>
          </g>
      </g>
    </svg>
  `,
})
export class PebEditorBackgroundStretchComponent { }
