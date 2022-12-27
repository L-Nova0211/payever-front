import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { FormControl } from '@angular/forms';


@Component({
  selector: 'peb-fill-preset',
  templateUrl: './fill-preset.component.html',
  styleUrls: ['./fill-preset.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebFillPresetComponent {

  @Input() control: FormControl;
  @Output() colorSelected = new EventEmitter<string>();

  columns = [
    ['#ffffff', '#d9d9d9', '#464646', '#000000'],
    ['#0091df', '#007bbd', '#005c8d', '#003f60'],
    ['#eb4653', '#cc3c47', '#a8323b', '#7f232a'],
    ['#5937ff', '#4d2ee6', '#4026c3', '#301c94'],
    ['#ffbe00', '#dca400', '#b78800', '#8f6a00'],
    ['#069d3b', '#047d2f', '#046526', '#034d1d'],
  ];

  select(color) {
    this.control?.markAsTouched();
    this.control?.markAsDirty();
    this.control?.patchValue(color);
    this.colorSelected.emit(color);
  }
}
