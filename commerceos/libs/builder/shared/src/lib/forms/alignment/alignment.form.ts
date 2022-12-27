import { ChangeDetectionStrategy, Component, EventEmitter, Injector, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { PebEditorState } from '@pe/builder-core';
import { ALIGN_TYPES, SelectOption } from '@pe/builder-old';


@Component({
  selector: 'peb-alignment-form',
  templateUrl: './alignment.form.html',
  styleUrls: ['./alignment.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorAlignmentForm {
  @Input() formGroup: FormGroup;

  @Output() blurred = new EventEmitter<void>();

  public editorState = this.injector.get(PebEditorState);

  constructor(private injector: Injector) {}

  alignTypes: SelectOption[][] = ALIGN_TYPES;
}
