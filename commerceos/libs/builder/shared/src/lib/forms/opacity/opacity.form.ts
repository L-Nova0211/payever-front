import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-opacity-form',
  templateUrl: './opacity.form.html',
  styleUrls: ['./opacity.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorOpacityForm {
  @Input() formGroup: FormGroup;

  @Output() blurred = new EventEmitter<void>();
}
