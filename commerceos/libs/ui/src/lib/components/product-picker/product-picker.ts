import {
  AfterViewChecked,
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
import { FormControl } from '@angular/forms';
import { filter, startWith, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';

let uniqueId = 0;

@Component({
  selector: 'peb-product-picker',
  templateUrl: './product-picker.html',
  styleUrls: ['./product-picker.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebProductPickerComponent implements OnInit, AfterViewChecked , OnChanges {
  constructor(
    private destroyed$: PeDestroyService,
    public cdr: ChangeDetectorRef) {}
  
  @Input() placeholder: string;
  /** Product picker data */
  @Input() data;
  /** Product picker filter by */
  @Input() filterBy = 'name';
  /** Button function */
  @Input() buttonFunction: () => void;
  /** Label */
  @Input() label = 'Add Products';
  /** Sets error message */
  @Input() errorMessage: string;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;

  @Input() multiSelect = true;

  inputId = `peb-product-picker-${(uniqueId += 1)}`;

  private items = [];
  /** Autocomplete options shown */
  filteredOptions = [];

  /** Added products */
  addedItems = [];

  productWidth;
  optionSelected;

  /** Emits on products list changed */
  @Output() changed: EventEmitter<any> = new EventEmitter<any>();
  /** Emits on touch */
  @Output() touched: EventEmitter<any> = new EventEmitter<any>();

  @Output() filtered = new EventEmitter<string>();

  /** Input ref */
  @ViewChild('input') inputRef: ElementRef;
  @ViewChild('productPickerWrapper', { static: true }) wrapperRef: ElementRef;

  filterController = new FormControl('');

  ngOnInit() {
    if (this.data) {
      this.items = this.data;
    }

    this.filterController.valueChanges
    .pipe(
      filter(value => typeof value !== 'object'),
      startWith(''),
      tap(value => {
        this.filteredOptions = this.customFilter(value);
        this.filtered.emit(value)
      }),
      takeUntil(this.destroyed$)
    )
    .subscribe()

    this.filteredOptions = this.customFilter('');
  }

  ngOnChanges(changes:SimpleChanges){
      if(changes.data){
        this.items = this.data;
        this.filteredOptions = this.customFilter(this.filterController.value) 
      }
  }

  ngAfterViewChecked() {
    const nativeEl = this.wrapperRef.nativeElement as HTMLElement;
    this.productWidth = nativeEl.scrollWidth;
    this.cdr.detectChanges();
  }

  /** Emits changes */
  emitChanges() {
    this.touched.emit();
    this.changed.emit(this.addedItems);
    this.cdr.detectChanges();
  }

  onKey(event) {
    this.touched.emit();
  }

  displayFn(product): string {
    return product.name;
  }

  optionSelect(event) {
    this.touched.emit();
    this.optionSelected = event.option.value;
    this.addSelectedProduct(this.optionSelected);
  }

  addProduct() {
    this.buttonFunction();
    this.emitChanges();
  }

  onRemoveProduct($event, i) {
    if (this.addedItems[i].hasOwnProperty('id')) {
      this.addedItems = this.addedItems.filter((element) => {
        return element.id !== this.addedItems[i].id;
      });
    } else {
      this.addedItems = this.addedItems.filter((element) => {
        return element.productId !== this.addedItems[i].productId;
      });
    }
    this.emitChanges();
  }

  private customFilter(value: string): string[] {
    value = value || '';

    const filterValue = value.toLowerCase();
    
    return this.items.filter((option) => option[this.filterBy].toLowerCase().includes(filterValue));
  }

  addSelectedProduct(option) {
    if(!option || !option.id){
      return;
    }

    if(this.addedItems.some(item => item.id == option.id)){
      this.filterController.setValue('');
      this.inputRef.nativeElement.blur();
      this.emitChanges();

      return;
    }

    const item = this.items.filter((product) => product.id === this.optionSelected.id);
    if(this.multiSelect){
      this.addedItems.push(item[0]);
    }
    else{
      this.addedItems = [item[0]];
    }
    
    this.filterController.setValue('')
    this.inputRef.nativeElement.blur();
    this.emitChanges();
  }
}
