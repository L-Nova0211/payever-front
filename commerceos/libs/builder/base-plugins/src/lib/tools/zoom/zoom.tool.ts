import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { OverlayDataValue } from '../../misc/overlay.data';
import { AbstractPebEditorTool } from '../abstract.tool';

import { PebEditorZoomDialogComponent } from './zoom.dialog';

@Component({
  selector: 'peb-editor-zoom-tool',
  templateUrl: './zoom.tool.html',
  styleUrls: ['./zoom.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorZoomTool extends AbstractPebEditorTool {

  isMobile = this.deviceService.isMobile;

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  openZoom(element: HTMLElement): void {
    const overlay: Observable<OverlayDataValue> = this.openOverlay(
      PebEditorZoomDialogComponent,
      element,
      {},
      '',
      'zoom-dialog-backdrop',
    );

    overlay.pipe(
      take(1),
      tap(() => this.detachOverlay()),
    ).subscribe();
  }

}
