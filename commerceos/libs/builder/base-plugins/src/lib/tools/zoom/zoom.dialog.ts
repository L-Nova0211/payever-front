import { ChangeDetectionStrategy, Component, HostListener, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { Select, Store } from '@ngxs/store';
import { animationFrameScheduler, Observable } from 'rxjs';
import { takeUntil, tap, throttleTime } from 'rxjs/operators';

import { PebEditorOptionsAction, PebEditorOptionsState, PebScaleToFitAction } from '@pe/builder-renderer';
import { PeDestroyService } from '@pe/common';

import { OverlayData, OVERLAY_DATA } from '../../misc/overlay.data';

@Component({
  selector: 'peb-shop-editor-zoom-dialog',
  templateUrl: 'zoom.dialog.html',
  styleUrls: ['./zoom.dialog.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebEditorZoomDialogComponent {
  scales = [50, 100, 200];

  @Select(PebEditorOptionsState.scaleToFit) toFit$!: Observable<boolean>;
  @Select(PebEditorOptionsState.scale) scale$!: Observable<number>;

  formGroup = new FormGroup({
    scale: new FormControl(100),
  });

  constructor(
    @Inject(OVERLAY_DATA) public overlayData: OverlayData,
    private store: Store,
    private readonly destroy$: PeDestroyService,
  ) {
    this.scale$.pipe(
      tap((scale) => {
        this.formGroup.get('scale').patchValue(scale * 100, { emitEvent: false });
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.formGroup.get('scale').valueChanges.pipe(
      throttleTime(0, animationFrameScheduler, { trailing: true }),
      tap((scale) => {
        this.store.dispatch(new PebEditorOptionsAction({ scale: scale / 100, scaleToFit: false }));
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  @HostListener('click', ['$event']) onMouseDown(event: MouseEvent) {
    event.stopPropagation();
  }

  setScale(scale) {
    this.formGroup.get('scale').patchValue(scale * 100);
    this.store.dispatch(new PebEditorOptionsAction({ scale: scale / 100, scaleToFit: false }));
    this.close();
  }

  fitToScale() {
    this.store.dispatch(new PebScaleToFitAction(true));
    this.close();
  }

  close() {
    const scale = this.formGroup.get('scale').value * 100;
    this.overlayData.emitter.next(scale);
  }
}
