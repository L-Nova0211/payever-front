import { ChangeDetectionStrategy, Component, ElementRef, Optional, Renderer2, Self, ViewChild } from '@angular/core';
import { ControlValueAccessor, NgControl } from '@angular/forms';


@Component({
  selector: 'peb-slide-toggle',
  template: `
    <label>
      <input #input type="checkbox" hidden (change)="onToggle($event)">
      <span>
        <ng-content></ng-content>
      </span>
      <div class="bar">
        <div class="thumb"></div>
      </div>
    </label>
  `,
  styleUrls: ['./slide-toggle.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebSlideToggleComponent implements ControlValueAccessor {

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
