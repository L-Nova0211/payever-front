import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-image-adjustment-form',
  templateUrl: './image-adjustment.form.html',
  styleUrls: ['./image-adjustment.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorImageAdjustmentForm {
  @Input() formGroup: FormGroup;
  @Input() label = 'Adjustment';
  @Input() opened = false;
}
