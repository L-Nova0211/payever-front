import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { AppThemeEnum } from '@pe/common';

import { PePickerDataInterface } from '../picker';

import { getUniqueId } from './misc/unique-id-counter.helper';

@Component({
  selector: 'pe-input-picker',
  templateUrl: './input-picker.html',
  styleUrls: ['./input-picker.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeInputPickerComponent implements OnInit, OnChanges {
  @Input() placeholder: string;
  @Input() label: string;
  @Input() data: PePickerDataInterface[] = [];
  @Input() buttonFunction: () => void;
  @Input() buttonLabel: string;
  @Input() theme: AppThemeEnum = AppThemeEnum.default;
  @Input() panelClass: string;

  /** Sets error message */
  @Input() errorMessage: string;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;

  @Input() set selectedItem(item: PePickerDataInterface) {
    if (!item) {
      return;
    }

    this.pickedItem = item;
    this.filteredOptions = this.customFilter('');
    queueMicrotask(() => {
      this.inputRef.nativeElement.value = item.label;
      this.inputRef.nativeElement.blur();
    });
  }

  inputId = `pe-picker-${getUniqueId()}`;

  filteredOptions: PePickerDataInterface[] = [];

  pickedItem: PePickerDataInterface;

  @Output() readonly changed: EventEmitter<PePickerDataInterface> = new EventEmitter<PePickerDataInterface>();
  @Output() readonly touched: EventEmitter<void> = new EventEmitter<void>();

  @ViewChild('input') inputRef: ElementRef;

  constructor(private cdr: ChangeDetectorRef) {}
  ngOnChanges(changes: SimpleChanges): void {
    this.filteredOptions = this.customFilter('');
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.filteredOptions = this.customFilter('');
    this.cdr.detectChanges();
  }

  getOptionText(option) {
    return option && option.label ? option.label : '';
  }

  emitChanges() {
    this.changed.emit(this.pickedItem.value);
  }

  onKey(event) {
    this.filteredOptions = this.customFilter(event.target.value);
    if (!event.target.value && this.pickedItem) {
      this.pickedItem = {
        label: null,
        value:null,
      };
      this.emitChanges();
    }
    this.cdr.detectChanges();
  }

  onAddItem(option: PePickerDataInterface) {
    this.pickedItem = option;
    this.inputRef.nativeElement.value = option.label;
    this.filteredOptions = this.customFilter('');
    this.inputRef.nativeElement.blur();
    this.isFieldInvalid = false;

    this.cdr.detectChanges();
    this.touched.emit();
    this.emitChanges();
  }

  onButtonClick() {
    this.buttonFunction();
    this.emitChanges();
  }

  private customFilter(value: string) {
    const filterValue = value.toLowerCase();

    return this.data.filter(option => option.label.toLowerCase().includes(filterValue));
  }
}
