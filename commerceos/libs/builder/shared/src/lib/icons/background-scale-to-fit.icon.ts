import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-background-scale-to-fit-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="16" height="16" viewBox="0 0 16 16">
      <defs>
          <path id="7ib55wpr6a" d="M0 0H16V16H0z"/>
          <mask id="5x30i07r6b" width="16" height="16" x="0" y="0" fill="#fff" maskContentUnits="userSpaceOnUse" maskUnits="objectBoundingBox">
              <use xlink:href="#7ib55wpr6a"/>
          </mask>
      </defs>
      <g fill="none" fill-rule="evenodd">
          <g>
              <g transform="translate(-1108 -364) translate(1108 364)">
                  <path fill="#FFF" fill-opacity=".5" d="M0 3.556H16V12.445H0z"/>
                  <use stroke="#FFF" stroke-dasharray="2.667" stroke-linejoin="round" stroke-width="1.778" mask="url(#5x30i07r6b)" xlink:href="#7ib55wpr6a"/>
              </g>
          </g>
      </g>
    </svg>
  `,
})
export class PebEditorBackgroundScaleToFitComponent { }
