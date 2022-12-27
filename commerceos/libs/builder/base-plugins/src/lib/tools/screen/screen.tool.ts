import { ChangeDetectionStrategy, Component, Injector } from '@angular/core';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PebScreen } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';

import { OverlayDataValue } from '../../misc/overlay.data';
import { AbstractPebEditorTool } from '../abstract.tool';

import { PebEditorScreenToolDialogComponent } from './screen.dialog';

@Component({
  selector: 'peb-editor-screen-tool',
  templateUrl: './screen.tool.html',
  styleUrls: ['./screen.tool.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebEditorScreenTool extends AbstractPebEditorTool {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  constructor(
    injector: Injector,
  ) {
    super(injector);
  }

  openScreen(element: HTMLElement) {
    const overlay: Observable<OverlayDataValue> = this.openOverlay(
      PebEditorScreenToolDialogComponent,
      element,
      {},
      'screen-panel',
    );

    overlay.pipe(
      take(1),
      tap(() => this.detachOverlay()),
    ).subscribe();
  }
}
