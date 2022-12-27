import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostBinding, Input,
  Optional,
  Renderer2,
  Self,
  ViewChild,
} from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';

@Component({
  selector: 'peb-button-toggle',
  template: `
    <button #button type="button" class="toggle-button" (click)="toggleValue()">
      <ng-content></ng-content>
    </button>
  `,
  styleUrls: ['./button-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebButtonToggleComponent implements ControlValueAccessor {

  @Input() value?: unknown;
  @Input() toggle = false;
  @ViewChild('button', { static: true }) button: ElementRef;

  checked: boolean;

  onChange: (value: unknown) => void;
  onTouch: () => void;

  constructor(private renderer: Renderer2,
              @Optional() @Self() public ngControl: NgControl) {
    if (this.ngControl !== null) {
      this.ngControl.valueAccessor = this;
    }
  }

  @HostBinding('class.toggle-button-checked') get class() {
    return this.checked;
  }

  registerOnChange(fn: (value?: unknown) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouch = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.renderer.setAttribute(this.button.nativeElement, 'disabled', 'true');
    } else {
      this.renderer.removeAttribute(this.button.nativeElement, 'disabled');
    }
  }

  writeValue(value: boolean): void {
    this.checked = value;
  }

  toggleValue(): void {
    if (!this.toggle && this.value !== undefined && this.checked) {
      return;
    }
    this.checked = !this.checked;
    this.onTouch();
    this.onChange(this.value !== undefined ? this.value : this.checked);
  }
}
