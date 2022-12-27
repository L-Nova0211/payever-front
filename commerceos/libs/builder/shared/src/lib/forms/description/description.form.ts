import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnDestroy, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'editor-description-form',
  templateUrl: './description.form.html',
  styleUrls: ['./description.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditorDescriptionForm implements OnDestroy {

  @Input() formGroup: FormGroup;
  @Input() label = 'Description';
  @Input() opened = false;
  @Output() blurred = new EventEmitter();

  ngOnDestroy() {
    this.blurred.emit();
  }
}
