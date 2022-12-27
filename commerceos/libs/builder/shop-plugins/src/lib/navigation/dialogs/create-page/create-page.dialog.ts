import { Component, Inject } from '@angular/core';

import { PebPageShort } from '@pe/builder-core';
import { OverlayData, OVERLAY_DATA } from '@pe/builder-base-plugins';


@Component({
  selector: 'peb-shop-editor-create-page-dialog',
  templateUrl: 'create-page.dialog.html',
  styleUrls: ['./create-page.dialog.scss'],
})
export class PebShopEditorCreatePageDialogComponent {
  label: string;
  pages: PebPageShort[];

  constructor(
    @Inject(OVERLAY_DATA) public overlayData: OverlayData,
  ) {
    this.label = overlayData.data?.label;
    this.pages = overlayData.data?.pages;
  }

  select(page?: any): void {
    this.overlayData.emitter.next(page);
  }
}
