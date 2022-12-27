
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
import { MatAutocompleteTrigger } from '@angular/material/autocomplete';


@Component({
  selector: 'pe-autocomplete',
  templateUrl: './autocomplete.html',
  styleUrls: ['./autocomplete.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeAutocompleteComponent implements OnInit, OnChanges {

  @Input() placeholder: string;
  @Input() isEditableItem = false;
  @Input() removeBtnText = 'Remove';
  @Input() editBtnText = 'Edit';
  @Input() label: string;
  @Input() data = [];
  @Input() buttonFunction: () => void;
  @Input() buttonLabel: string;
  @Input() errorMessage: string;
  @Input() isFieldInvalid = false;
  @Input() initialValue: string;

  filteredOptions = [];

  @Output() readonly changed: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly touched: EventEmitter<any> = new EventEmitter<any>();

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

  onKey(event) {
    this.filteredOptions = this.customFilter(event.target.value);
    this.cdr.detectChanges();
  }

  onAddItem(option) {
    this.inputRef.nativeElement.blur();
    this.cdr.detectChanges();
    this.touched.emit();
    this.changed.emit(option);
  }

  private customFilter(value: string) {
    const filterValue = value.toLowerCase();

    return this.data.filter((option) => option.label.toLowerCase().includes(filterValue));
  }

  selectionMade(event: Event, trigger: MatAutocompleteTrigger) {
    event.stopPropagation();
    trigger.openPanel();
    this.inputRef.nativeElement.focus();
  }
}
