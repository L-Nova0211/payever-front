import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';

import { OverlayDataValue } from '../../misc/overlay.data';
import { AbstractPebEditorTool } from '../abstract.tool';

import { PebEditorMediaToolDialogComponent } from './media.dialog';

@Component({
  selector: 'peb-editor-media-tool',
  templateUrl: './media.tool.html',
  styleUrls: ['./media.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorMediaTool extends AbstractPebEditorTool {

  constructor(injector: Injector) {
    super(injector);
  }

  openMedia(element: HTMLElement) {
    const overlay: Observable<OverlayDataValue> = this.openOverlay(
      PebEditorMediaToolDialogComponent,
      element,
      null,
      'dialog-media-panel',
    );
    this.createElementAfterClose(overlay);
  }

}
