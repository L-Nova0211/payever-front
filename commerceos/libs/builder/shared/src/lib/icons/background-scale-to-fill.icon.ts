import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-background-scale-to-fill-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="22" height="16" viewBox="0 0 22 16">
      <defs>
          <path id="2gp8cjui1a" d="M2.667 0H18.667V16H2.667z"/>
          <mask id="z0kngwqu1b" width="16" height="16" x="0" y="0" fill="#fff" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox">
              <use xlink:href="#2gp8cjui1a"/>
          </mask>
      </defs>
      <g fill="none" fill-rule="evenodd">
          <g>
              <g transform="translate(-1105 -332) translate(1105 332)">
                  <path fill="#FFF" fill-opacity=".5" d="M0 0H21.333V16H0z"/>
                  <use stroke="#FFF" stroke-dasharray="2.667" stroke-linejoin="round" stroke-width="1.778" mask="url(#z0kngwqu1b)" xlink:href="#2gp8cjui1a"/>
              </g>
          </g>
      </g>
    </svg>
  `,
})
export class PebEditorBackgroundScaleToFillComponent { }
