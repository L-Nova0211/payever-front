import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { takeUntil, tap } from 'rxjs/operators';

import { PebEditorSlot } from '@pe/builder-abstract';
import { PebEditorState, PebScreen } from '@pe/builder-core';
import { PebEditorAccessorService } from '@pe/builder-services';

import { EditorCopyChangesDetailForm } from './detail/copy-changes-detail.form';

@Component({
  selector: 'peb-copy-changes-form',
  templateUrl: './copy-changes.form.html',
  styleUrls: [
    '../../../../../styles/src/lib/styles/_sidebars.scss',
    './copy-changes.form.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebCopyChangesForm {
  @Input() formGroup: FormGroup;
  @Output() selected = new EventEmitter<PebScreen>();

  private get editor() {
    return this.editorAccessorService.editorComponent;
  }

  constructor(
    public editorState: PebEditorState,
    private editorAccessorService: PebEditorAccessorService,
  ) {
  }

  showDetail() {
    this.editor.detail = { back: 'Section', title: 'Select view' };
    const sidebarCmpRef = this.editor.insertToSlot(EditorCopyChangesDetailForm, PebEditorSlot.sidebarDetail);
    sidebarCmpRef.instance.formGroup = this.formGroup;

    sidebarCmpRef.instance.selected.pipe(
      tap((value: PebScreen) => {
        this.selected.emit(value);
        this.editor.backTo('main');
      }),
      takeUntil(sidebarCmpRef.instance.destroy$),
    ).subscribe();
  }

}
