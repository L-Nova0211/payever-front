import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';

export type LabelPosition = 'before' | 'after';

/** Unique element id */
let elementId = 0;

@Component({
  selector: 'peb-button-toggle',
  templateUrl: './button-toggle.html',
  styleUrls: ['./button-toggle.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebButtonToggleComponent {
  inputId = `peb-button-toggle-${(elementId += 1)}`;

  /** Sets toggle button label */
  @Input() label: string;

  /** Sets label position */
  @Input() labelPosition: LabelPosition = 'after';

  /** Sets spacer between label and button toggle */
  @Input() spacer = false;

  /** Sets button toogle checked */
  @Input() checked = false;

  /** Sets button toggle disabled */
  @Input() disabled: boolean;

  /** Sets button toggle required */
  @Input() required: boolean;

  /** Whether button toggle is focused */
  isFocused = false;

  /** Emits value when changed */
  @Output() readonly changed: EventEmitter<boolean> = new EventEmitter<boolean>();
  /** Emits value when focused */
  @Output() readonly focused: EventEmitter<boolean> = new EventEmitter<boolean>();
  /** Emits value when blured */
  @Output() readonly blured: EventEmitter<boolean> = new EventEmitter<boolean>();

  constructor(private cdr: ChangeDetectorRef) {}

  /** Toggles button toggle on click */
  onClick(event: Event, cb: HTMLInputElement) {
    if (!this.disabled) {
      event.preventDefault();
      this.toggle(event);
      cb.focus();
    }
  }

  /** Change input value change update model */
  onInputChange(event: Event) {
    const inputChecked = (event.target as HTMLInputElement).checked;
    this.updateModel(event, inputChecked);
  }

  /** Toggles value */
  toggle(event: Event) {
    this.updateModel(event, !this.checked);
  }

  /** Changes value and emits it */
  updateModel(event: Event, value: boolean) {
    this.checked = value;
    this.changed.emit(this.checked);
  }

  /** Emits element focus */
  onFocus(event: Event) {
    this.isFocused = true;
    const target = event.target as HTMLElement;
    target.focus();
    this.focused.emit();
  }

  /** Emits element blur */
  onBlur(event: Event) {
    this.isFocused = false;
    const target = event.target as HTMLElement;
    target.blur();
    this.blured.emit();
  }
}
