import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-background-tile-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
      <defs>
          <path id="5jqoqvto6a" d="M0 0H16V16H0z"/>
          <mask id="ypypm08o8b" width="16" height="16" x="0" y="0" fill="#fff" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox">
              <use xlink:href="#5jqoqvto6a"/>
          </mask>
      </defs>
      <g fill="none" fill-rule="evenodd">
          <g>
              <g transform="translate(-1108 -300) translate(1108 300)">
                  <path fill="#FFF" fill-opacity=".5" d="M0 10.667H5.333V16H0zM5.333 5.333H10.666V10.666H5.333zM10.667 10.667H16V16H10.667z"/>
                  <use stroke="#FFF" stroke-dasharray="2.667" stroke-linejoin="round" stroke-width="1.778" mask="url(#ypypm08o8b)" xlink:href="#5jqoqvto6a"/>
                  <path fill="#FFF" fill-opacity=".5" d="M0 0H5.333V5.333H0zM10.667 0H16V5.333H10.667z"/>
              </g>
          </g>
      </g>
    </svg>
  `,
})
export class PebEditorBackgroundTileComponent { }
