import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebElementDef, PebMotionEvent } from '@pe/builder-core';
import { PebEditorRenderer } from '@pe/builder-main-renderer';
import { PebElementSelectionState } from '@pe/builder-state';
import { PeDestroyService } from '@pe/common';

@Component({
  selector: 'peb-motion-event-detail-form',
  templateUrl: './motion-event-detail.form.html',
  styleUrls: ['./motion-event-detail.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebMotionEventDetailForm {

  @Select(PebElementSelectionState.elements) selectedElements$!: Observable<PebElementDef[]>;

  @Input() formGroup: FormGroup;
  @Input() effectType: string;
  @Input() effectTypes: any[];

  component;

  constructor(
    private destroy$: PeDestroyService,
    private renderer: PebEditorRenderer,
  ) {
    this.selectedElements$.pipe(
      tap((elements) => {
        this.component = this.renderer.getElementComponent(elements[0].id);
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  searchInputEnterHandler($event: Event) {
    $event.preventDefault();
  }

  selectMotion($motion: PebMotionEvent) {
    this.formGroup.get(this.effectType).patchValue($motion);
  }
}
