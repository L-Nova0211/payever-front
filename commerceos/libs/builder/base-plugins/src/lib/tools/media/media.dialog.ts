import { Component, Inject } from '@angular/core';

import { PebElementType } from '@pe/builder-core';

import { ObjectCategory, OverlayData, OVERLAY_DATA } from '../../misc/overlay.data';

enum MediaOptions {
  Picture = 'Picture',
  Video = 'Video',
  Gallery = 'Gallery',
}

const MEDIA_CATEGORIES: {[key: string]: ObjectCategory} = {
};
@Component({
  selector: 'peb-editor-media-dialog',
  templateUrl: 'media.dialog.html',
  styleUrls: ['./media.dialog.scss'],
})
export class PebEditorMediaToolDialogComponent {
  public readonly mediaOptions: typeof MediaOptions = MediaOptions;

  constructor(
    @Inject(OVERLAY_DATA) public data: OverlayData,
  ) {}

  public addMedia(mediaType: MediaOptions): void {
    this.data.emitter.next(MEDIA_CATEGORIES[mediaType]);
  }
}
