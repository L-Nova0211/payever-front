import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
  selector: 'peb-color-picker-form',
  templateUrl: './color-picker.html',
  styleUrls: ['./color-picker.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebColorPickerFormComponent {
  @Input() label: string;
  @Input() theme = 'dark';
  @Input() buttonLabel: string;

  color: string;
  displayColorPicker: boolean;

  @Output() changed: EventEmitter<any> = new EventEmitter<any>();
  @Output() touched: EventEmitter<any> = new EventEmitter<any>();

  emitChanges() {
    this.touched.emit();
    this.changed.emit(this.color);
  }

  colorSelect(event) {
    this.color = event;
    this.emitChanges();
  }

  openColorPicker(trigger: HTMLDivElement) {
    trigger.click();
    setTimeout(() => {
      this.displayColorPicker = true;
    });
  }

  closeColorPicker() {
    this.displayColorPicker = false;
  }
}
