import { Component } from '@angular/core';

@Component({
  selector: 'peb-editor-carousel-document-icon',
  template: `
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="18" style="padding: 6px 4px 6px 3px;" viewBox="0 0 18 18">
      <g id="carousel" stroke="none" stroke-width="1" fill="none" fill-rule="evenodd">
          <rect id="Rectangle" fill="#797979" x="3" y="4" width="12" height="8" rx="0.5"></rect>
          <path d="M0,5 L1.5,5 C1.77614237,5 2,5.22385763 2,5.5 L2,10.5 C2,10.7761424 1.77614237,11 1.5,11 L0,11 L0,11 L0,5 Z" id="Rectangle-Copy" fill="#797979"></path>
          <path d="M16,5 L17.5,5 C17.7761424,5 18,5.22385763 18,5.5 L18,10.5 C18,10.7761424 17.7761424,11 17.5,11 L16,11 L16,11 L16,5 Z" id="Rectangle-Copy-2" fill="#797979" transform="translate(17.000000, 8.000000) scale(-1, 1) translate(-17.000000, -8.000000) "></path>
          <g id="Group" transform="translate(5.000000, 13.000000)" fill="#797979">
              <circle id="Oval" cx="1" cy="1" r="1"></circle>
              <circle id="Oval-Copy" cx="4" cy="1" r="1"></circle>
              <circle id="Oval-Copy-2" cx="7" cy="1" r="1"></circle>
          </g>
      </g>
    </svg>
  `,
})
export class PebEditorCarouselDocumentIconComponent { }
