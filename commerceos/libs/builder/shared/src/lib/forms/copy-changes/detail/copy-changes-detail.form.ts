import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PebScreen } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { PeDestroyService } from '@pe/common';


@Component({
  selector: 'peb-copy-changes-detail-form',
  templateUrl: './copy-changes-detail.form.html',
  styleUrls: ['./copy-changes-detail.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})

export class EditorCopyChangesDetailForm {

  @Select(PebEditorOptionsState.screen) screen$!: Observable<PebScreen>;

  screens$ = this.screen$.pipe(
    map(screen => Object.values(PebScreen).filter(s => s !== screen)),
  );

  @Input() formGroup: FormGroup;
  @Output() selected = new EventEmitter<PebScreen>();

  constructor(public readonly destroy$: PeDestroyService) {
  }

  selectScreen(screen: PebScreen) {
    this.selected.emit(screen);
  }
}
