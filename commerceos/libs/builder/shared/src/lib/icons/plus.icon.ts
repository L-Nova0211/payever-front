import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-plus-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" [attr.width]="width" [attr.height]="height" viewBox="0 0 22 21">
      <g fill="none" fill-rule="evenodd" [attr.stroke]="color" stroke-linecap="square">
        <path d="M10 .5L10 20.5M20 10.5L0 10.5" transform="translate(1)" />
      </g>
    </svg>
  `,
})
export class PebEditorPlusComponent {
  @Input() width = 22;
  @Input() height = 21;
  @Input() color = '#FFFFFF';
}
