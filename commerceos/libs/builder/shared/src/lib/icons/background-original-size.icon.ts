import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-background-original-size-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
      <defs>
          <path id="2dbhgz2fqa" d="M0 0H16V16H0z"/>
          <mask id="jjoy21e0sb" width="16" height="16" x="0" y="0" fill="#fff" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox">
              <use xlink:href="#2dbhgz2fqa"/>
          </mask>
      </defs>
      <g fill="none" fill-rule="evenodd">
          <g>
              <g transform="translate(-1108 -236) translate(1108 236)">
                  <use stroke="#FFF" stroke-dasharray="2.667" stroke-linejoin="round" stroke-width="1.778" mask="url(#jjoy21e0sb)" xlink:href="#2dbhgz2fqa"/>
                  <path fill="#FFF" fill-opacity=".5" d="M2.667 4.444H13.334V11.555H2.667z"/>
              </g>
          </g>
      </g>
    </svg>
  `,
})
export class PebEditorBackgroundOriginalSizeComponent { }
