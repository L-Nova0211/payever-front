import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  Output,
  ViewChild,
} from '@angular/core';

let uniqueId = 0;

@Component({
  selector: 'peb-chips-list',
  templateUrl: './chips.html',
  styleUrls: ['./chips.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebChipsComponent {
  constructor(public elementRef: ElementRef, public changeDetectionRef: ChangeDetectorRef) {}
  /** Sets chips input placeholder */
  @Input() placeholder: string;
  /** Sets chips input disabled */
  @Input() disabled: boolean;
  /** Sets add value on tab */
  @Input() addOnTab: boolean;
  /** Sets add value on blur */
  @Input() addOnBlur: boolean;

  /** Emits on add */
  @Output() add: EventEmitter<any> = new EventEmitter();
  /** Emits on remove */
  @Output() remove: EventEmitter<any> = new EventEmitter();
  /** Emits on blur */
  @Output() blured: EventEmitter<any> = new EventEmitter();
  /** Emits on focused */
  @Output() focused: EventEmitter<any> = new EventEmitter();
  /** Emits on chip click */
  @Output() chipClick: EventEmitter<any> = new EventEmitter();
  /** Emits on changed */
  @Output() changed: EventEmitter<any> = new EventEmitter<any>();

  /** Input element ref */
  @ViewChild('input') inputViewChild: ElementRef;

  inputId = `peb-input-chips-${(uniqueId += 1)}`;

  /** Holds selected values */
  value = [];

  focus: boolean;

  /** Removes item on click */
  onItemClick(event: Event, index: any) {
    this.removeItem(event, index);
  }

  /** Focus input on component click */
  onInputFocus(event: FocusEvent) {
    this.focus = true;
    this.focused.emit(event);
  }

  /** 
   * Blur input on component clicked
   * Sets value on blur is addOnBlur is true 
   */
  onInputBlur(event: FocusEvent) {
    this.focus = false;
    if (this.addOnBlur && this.inputViewChild.nativeElement.value) {
      this.addItem(event, this.inputViewChild.nativeElement.value, false);
    }
    this.blured.emit(event);
  }

  /** Removes chip item */
  removeItem(event: Event, index?: number, removeLatest?: boolean): void {
    if (this.disabled) {
      return;
    }

    if (removeLatest) {
      const removeItem = this.value.pop();
      this.changed.emit(this.value);
      this.remove.emit({
        originalEvent: event,
        value: removeItem,
      });
    }

    const removedItem = this.value[index];
    this.value = this.value.filter((val, i) => i !== index);
    this.changed.emit(this.value);
    this.remove.emit({
      originalEvent: event,
      value: removedItem,
    });
  }

  /** Adds chip item */
  addItem(event: Event, item: string, preventDefault: boolean): void {
    this.value = this.value || [];
    if (item && item.trim().length) {
      if (this.value.indexOf(item) === -1) {
        this.value = [...this.value, item];
        this.changed.emit(this.value);
        this.add.emit({
          originalEvent: event,
          value: item,
        });
      }
    }
    this.inputViewChild.nativeElement.value = '';

    if (preventDefault) {
      event.preventDefault();
    }
  }

  /** Checks keys clicked */
  onKeydown(event: KeyboardEvent): void {
    switch (event.key) {
      case 'Backspace':
        if (this.inputViewChild.nativeElement.value.length === 0 && this.value && this.value.length > 0) {
          this.removeItem(event, null, true);
        }
        break;

      case 'Enter':
        this.addItem(event, this.inputViewChild.nativeElement.value, true);
        break;

      case 'Tab':
        if (this.addOnTab && this.inputViewChild.nativeElement.value !== '') {
          this.addItem(event, this.inputViewChild.nativeElement.value, true);
        }
        break;

      default:
        break;
    }
  }
}
