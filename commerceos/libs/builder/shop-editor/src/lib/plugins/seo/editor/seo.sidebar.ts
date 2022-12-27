import { Component } from '@angular/core';

import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-shop-editor-seo-sidebar',
  templateUrl: 'seo.sidebar.html',
  styleUrls: [
    '../../../../../../styles/src/lib/styles/_sidebars.scss',
    './seo.sidebar.scss',
  ],
  providers: [PeDestroyService],
})
export class PebEditorShopSeoSidebarComponent {
  constructor(
    readonly destroy$: PeDestroyService,
  ) {
  }
}
