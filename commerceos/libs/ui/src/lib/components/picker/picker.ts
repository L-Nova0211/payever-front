import {
  AfterViewChecked,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ContentChild,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  TemplateRef,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';

import { TranslateService } from '@pe/i18n';

import { PePickerDataInterface } from './interface';

let uniqueId = 0;

@Component({
  selector: 'pe-picker',
  templateUrl: './picker.html',
  styleUrls: ['./picker.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PePickerComponent implements OnInit, OnChanges, AfterViewChecked {
  /** Picker input placeholder */
  @Input() placeholder: string;
  @Input() isEditableItem = false;
  @Input() type = 'text';
  @Input() removeBtnText = 'Remove';
  @Input() editBtnText = 'Edit';
  @Input() label: string;
  /** Picker input data */
  @Input() data: PePickerDataInterface[] = [];
  /** Sets error message */
  @Input() errorMessage: string;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;
  /** Button fuction. (if buttonLabel.length > 0) */
  @Input() buttonFunction: () => void;
  /** Button label */
  @Input() buttonLabel: string;
  @Input() set lazyLoadData(data: PePickerDataInterface[]) {
    this._lazyLoadData = data;
    this.filteredOptions = data;
    this.cdr.detectChanges();
  };

  @Input() optionsItemWidth: number;
  @Input() optionsButtonTitle = this.translateService.translate('ui.picker.remove');

  @ViewChild('pickerWrapper', { static: true }) wrapperRef: ElementRef;
  pickedItems: PePickerDataInterface[] = [];

  inputId = `pe-picker-${(uniqueId += 1)}`;

  /** Filtered options array */
  filteredOptions: PePickerDataInterface[] = [];
  _lazyLoadData: PePickerDataInterface[] = null;

  @Output() readonly changed: EventEmitter<any> = new EventEmitter<any>();
  /** Emits when touched */
  @Output() readonly touched: EventEmitter<any> = new EventEmitter<any>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() readonly onEdit: EventEmitter<any> = new EventEmitter<any>();
  // eslint-disable-next-line @angular-eslint/no-output-on-prefix
  @Output() readonly onKeyUp: EventEmitter<any> = new EventEmitter<any>();
  /** Button fuction. (if buttonLabel.length > 0) */
  @Output() readonly buttonClick = new EventEmitter<void>();
  @Output() readonly optionsButtonClick = new EventEmitter<PePickerDataInterface>();

  /** Input ref */
  @ViewChild('input') inputRef: ElementRef;

  @ContentChild('pickedItemTpl') pickedItemTpl: TemplateRef<any>;

  constructor(
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (this._lazyLoadData === null) {
      this.filteredOptions = this.customFilter('');
    }
    this.cdr.detectChanges();
  }

  ngOnInit() {
    this.filteredOptions = this.customFilter('');
    this.cdr.detectChanges();
  }

  ngAfterViewChecked() {
    const nativeEl = this.wrapperRef.nativeElement as HTMLElement;
    if (nativeEl.scrollWidth > 0 && !this.optionsItemWidth) {
      this.optionsItemWidth = nativeEl.scrollWidth - 2;
      this.cdr.detectChanges();
    }
  }

  /** Returns option label */
  getOptionText(option) {
    return option && option.label ? option.label : '';
  }

  /** Emit changes */
  emitChanges() {
    this.changed.emit(this.pickedItems);
  }

  /** Filter autocomplete options on keypress */
  onKey(event) {
    this.filteredOptions = this.customFilter(event.target.value);
    this.onKeyUp.emit(event.target.value);
    this.cdr.detectChanges();
  }

  /** Adds item to the picked list */
  onAddItem(option) {
    if (option === '' || this.pickedItems.includes(option)) {
      throw Error('value same or empty');
    } else {
      this.pickedItems.push(option);
      this.inputRef.nativeElement.value = '';
      this.filteredOptions = this.customFilter('');
      this.inputRef.nativeElement.blur();
    }
    this.cdr.detectChanges();
    this.touched.emit();
    this.emitChanges();
  }

  /** Removes item from picked list */
  onRemoveItem($event, i) {
    this.optionsButtonClick.emit(this.pickedItems[i]);
    this.pickedItems = this.pickedItems.filter((element) => {
      return element !== this.pickedItems[i];
    });

    this.cdr.detectChanges();
    this.emitChanges();
  }

  /** On button clicked */
  onButtonClick() {
    this.buttonClick.emit();
    this.emitChanges();
  }

  onEditItem($event, i) {
    this.onEdit.emit(i);
  }

  private customFilter(value: string) {
    const filterValue = value.toLowerCase();

    return filterValue.length < 1 ? []
      : this.data.filter((option) => option.label.toLowerCase().includes(filterValue));
  }

  public changeEditedItem(editedItem) {
    this.pickedItems.splice(this.pickedItems.indexOf(this.pickedItems.find(item => item.value === editedItem.value)), 1);
    this.pickedItems.push(editedItem);
    this.emitChanges();
    this.cdr.detectChanges();
  }
}
