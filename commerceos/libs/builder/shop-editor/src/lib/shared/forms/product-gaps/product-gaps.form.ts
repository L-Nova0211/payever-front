import { ChangeDetectionStrategy, Component, EventEmitter, HostBinding, Input, Output } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'shop-editor-product-gaps-form',
  templateUrl: './product-gaps.form.html',
  styleUrls: ['./product-gaps.form.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ShopEditorProductGapsForm {
  @Input() formGroup: FormGroup;

  @Input() colDisplay = true;
  @Input() rowDisplay = true;

  @Input() maxColGap = 100;

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  @HostBinding('class.without-border') @Input() withoutBorder;
}
