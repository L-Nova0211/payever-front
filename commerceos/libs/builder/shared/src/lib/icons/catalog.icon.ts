import { Component, Input } from '@angular/core';

@Component({
  selector: 'peb-editor-catalog-icon',
  template: `
      <svg [attr.fill]="color" width="19px" height="8px" viewBox="0 0 19 8" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
        <title>catalog</title>
        <g id="Page-1" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <g id="6-Single-Product-1" transform="translate(-305.000000, -150.000000)" [attr.fill]="color">
            <g id="catalog" transform="translate(305.000000, 150.000000)">
              <path d="M1,0 L4,0 C4.55228475,-1.01453063e-16 5,0.44771525 5,1 L5,4 C5,4.55228475 4.55228475,5 4,5 L1,5 C0.44771525,5 6.76353751e-17,4.55228475 0,4 L0,1 C-6.76353751e-17,0.44771525 0.44771525,1.01453063e-16 1,0 Z" id="Rectangle-20"></path>
              <path d="M15,0 L18,0 C18.5522847,-1.01453063e-16 19,0.44771525 19,1 L19,4 C19,4.55228475 18.5522847,5 18,5 L15,5 C14.4477153,5 14,4.55228475 14,4 L14,1 C14,0.44771525 14.4477153,1.01453063e-16 15,0 Z" id="Rectangle-20-Copy-6"></path>
              <path d="M1.5,6 L3.5,6 C4.05228475,6 4.5,6.44771525 4.5,7 C4.5,7.55228475 4.05228475,8 3.5,8 L1.5,8 C0.94771525,8 0.5,7.55228475 0.5,7 C0.5,6.44771525 0.94771525,6 1.5,6 Z" id="Rectangle-20-Copy-3"></path>
              <path d="M15.5,6 L17.5,6 C18.0522847,6 18.5,6.44771525 18.5,7 C18.5,7.55228475 18.0522847,8 17.5,8 L15.5,8 C14.9477153,8 14.5,7.55228475 14.5,7 C14.5,6.44771525 14.9477153,6 15.5,6 Z" id="Rectangle-20-Copy-7"></path>
              <path d="M8,0 L11,0 C11.5522847,-1.01453063e-16 12,0.44771525 12,1 L12,4 C12,4.55228475 11.5522847,5 11,5 L8,5 C7.44771525,5 7,4.55228475 7,4 L7,1 C7,0.44771525 7.44771525,1.01453063e-16 8,0 Z" id="Rectangle-20-Copy"></path>
              <path d="M8.5,6 L10.5,6 C11.0522847,6 11.5,6.44771525 11.5,7 C11.5,7.55228475 11.0522847,8 10.5,8 L8.5,8 C7.94771525,8 7.5,7.55228475 7.5,7 C7.5,6.44771525 7.94771525,6 8.5,6 Z" id="Rectangle-20-Copy-4"></path>
            </g>
          </g>
        </g>
      </svg>
  `,
})
export class PebEditorCatalogComponent {
  @Input() color = '#FFFFFF';
}

