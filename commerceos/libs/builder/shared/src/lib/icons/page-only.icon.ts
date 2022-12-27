import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'peb-editor-page-only-icon',
  template: `
    <svg viewBox="0 0 31 28" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
      <!-- Generator: sketchtool 63.1 (101010) - https://sketch.com -->
<!--      <title>315474EC-423E-478C-99E1-EE9522A133EF</title>-->
<!--      <desc>Created with sketchtool.</desc>-->
      <defs>
        <rect id="path-1" x="0" y="0" width="29" height="26" rx="2"></rect>
        <filter x="-5.2%" y="-5.8%" width="110.3%" height="111.5%" filterUnits="objectBoundingBox" id="filter-2">
          <feOffset dx="0" dy="0" in="SourceAlpha" result="shadowOffsetOuter1"></feOffset>
          <feGaussianBlur stdDeviation="0.5" in="shadowOffsetOuter1" result="shadowBlurOuter1"></feGaussianBlur>
          <feColorMatrix values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.5 0" type="matrix" in="shadowBlurOuter1"></feColorMatrix>
        </filter>
      </defs>
      <g id="Page-1" fill="none" fill-rule="evenodd">
        <g id="View-1" transform="translate(-35.000000, -157.000000)">
          <g id="page" transform="translate(36.000000, 158.000000)">
            <g id="Rectangle">
              <use fill="black" fill-opacity="1" filter="url(#filter-2)" xlink:href="#path-1"></use>
              <use fill="#FFFFFF" fill-rule="evenodd" xlink:href="#path-1"></use>
            </g>
            <path d="M2,0 L27,0 C28.1045695,-2.02906125e-16 29,0.8954305 29,2 L29,3 L29,3 L0,3 L0,2 C-1.3527075e-16,0.8954305 0.8954305,2.02906125e-16 2,0 Z" id="Rectangle" fill="#96A6BA"></path>
            <rect id="Rectangle-Copy-3" fill="#96A6BA" x="4" y="7" width="21" height="7" rx="1"></rect>
            <rect id="Rectangle-Copy-4" fill="#96A6BA" x="4" y="16" width="9" height="6" rx="1"></rect>
            <rect id="Rectangle-Copy-5" fill="#96A6BA" x="16" y="16" width="9" height="6" rx="1"></rect>
          </g>
        </g>
      </g>
    </svg>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorPageOnlyIconComponent {}
