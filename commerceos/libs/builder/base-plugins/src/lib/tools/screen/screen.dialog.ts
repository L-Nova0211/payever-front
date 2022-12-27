import { Component, Inject } from '@angular/core';
import { Select, Store } from '@ngxs/store';
import { Observable } from 'rxjs';

import { PebScreen } from '@pe/builder-core';
import { PebDefaultScreenAction, PebEditorOptionsState, PebScreenAction } from '@pe/builder-renderer';

import { OverlayData, OVERLAY_DATA } from '../../misc/overlay.data';


@Component({
  selector: 'peb-editor-screen-dialog',
  templateUrl: 'screen.dialog.html',
  styleUrls: ['./screen.dialog.scss'],
})
export class PebEditorScreenToolDialogComponent {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<boolean>;

  PebScreen = PebScreen;

  constructor(
    @Inject(OVERLAY_DATA) public overlayData: OverlayData,
    private store: Store,
  ) { }

  setScreen(screen: PebScreen) {
    this.store.dispatch(new PebScreenAction(screen));
    this.close(screen);
  }

  setDefaultScreen(screen: PebScreen) {
    this.store.dispatch(new PebDefaultScreenAction(screen));
    this.close(screen);
  }

  close(value: PebScreen) {
    this.overlayData.emitter.next(value);
  }
}
