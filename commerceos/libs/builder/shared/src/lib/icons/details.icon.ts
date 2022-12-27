import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-details-icon',
  template: `
      <svg [attr.fill]="color" width="16px" height="10px" viewBox="0 0 16 10" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="6-Single-Product-1" transform="translate(-305.000000, -113.000000)" [attr.fill]="color">
            <g id="details" transform="translate(305.000000, 113.000000)">
              <path d="M10,3 C10,2.44771525 10.4477153,2 11,2 L15,2 C15.5522847,2 16,2.44771525 16,3 C16,3.55228475 15.5522847,4 15,4 L11,4 C10.4477153,4 10,3.55228475 10,3 Z" id="Line" fill-rule="nonzero"></path>
              <path d="M10,7 C10,6.44771525 10.4477153,6 11,6 L13,6 C13.5522847,6 14,6.44771525 14,7 C14,7.55228475 13.5522847,8 13,8 L11,8 C10.4477153,8 10,7.55228475 10,7 Z" id="Line-Copy" fill-rule="nonzero"></path>
              <path d="M2,0 L6,0 C7.1045695,-2.02906125e-16 8,0.8954305 8,2 L8,8 C8,9.1045695 7.1045695,10 6,10 L2,10 C0.8954305,10 1.3527075e-16,9.1045695 0,8 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" id="Rectangle-20"></path>
            </g>
          </g>
        </g>
      </svg>
  `,
})
export class PebEditorDetailsComponent {
  @Input() color = '#FFFFFF';
}

