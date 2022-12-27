import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Optional,
  Output,
  Renderer2,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'peb-editor-checkbox-input',
  template: `
    <label>
      <input
        #input
        type="checkbox"
        [placeholder]="placeholder"
        (focus)="focused.emit()"
        (blur)="blurred.emit()"
        (change)="onToggle($event)"
      />
      <span *ngIf="label">{{ label }}</span>
    </label>

  `,
  styleUrls: ['./checkbox.input.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarCheckboxInput implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() label = '';

  @Output() focused = new EventEmitter<void>();
  @Output() blurred = new EventEmitter<void>();

  @ViewChild('input', { static: true }) input: ElementRef;

  onChange: (value: boolean) => void;
  onTouch: () => void;

  constructor(
    private renderer: Renderer2,
    @Optional() @Self() public ngControl: NgControl,
  ) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  onToggle($event: Event) {
    this.onChange(($event.target as HTMLInputElement).checked);
    this.onTouch();
  }

  registerOnChange(fn: () => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  writeValue(value: boolean): void {
    this.renderer.setProperty(this.input.nativeElement, 'checked', value);
  }
}
