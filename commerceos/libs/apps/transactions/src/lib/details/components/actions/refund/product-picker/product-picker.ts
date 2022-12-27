import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  QueryList,
  ViewChild,
  ViewChildren,
} from '@angular/core';
import { ControlContainer, FormArray, FormBuilder, FormGroup } from '@angular/forms';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

import { AppThemeEnum, EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { LocaleConstantsService } from '@pe/i18n';

import { RefundProductInterface } from '../../../../../shared';

let uniqueId = 0;

@Component({
  selector: 'pe-refund-product-picker',
  templateUrl: './product-picker.html',
  styleUrls: ['./product-picker.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RefundProductPickerComponent implements OnInit {

  @Input() placeholder: string;
  @Input() theme: AppThemeEnum;
  @Input() disabled = false;
  @Input() data: RefundProductInterface[];
  @Input() filterBy = 'name';
  @Input() buttonFunction: () => void;

  @Output() quantityChanged: EventEmitter<any> = new EventEmitter<any>();

  inputId = `peb-product-picker-${(uniqueId += 1)}`;

  filteredOptions: RefundProductInterface[] = [];
  addedItems: RefundProductInterface[] = [];

  productWidth: number;
  refundForm: FormGroup;

  private optionSelected: RefundProductInterface;
  private items: RefundProductInterface[] = [];

  @ViewChild('input') private inputRef: ElementRef;
  @ViewChild('productPickerWrapper', { static: true }) private wrapperRef: ElementRef;
  @ViewChildren('img') private imagesRef: QueryList<ElementRef>;

  constructor(
    private cdr: ChangeDetectorRef,
    public controlContainer: ControlContainer,
    private localeConstantsService: LocaleConstantsService,
    private formBuilder: FormBuilder,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) { }

  get fallbackImage(): string {
    return `${this.env.custom.cdn}/images/fallback.png`;
  }

  ngOnInit(): void {
    if (this.data) {
      this.items = this.data;
    }

    this.refundForm = this.controlContainer.control as FormGroup;

    const nativeEl = this.wrapperRef.nativeElement as HTMLElement;
    this.productWidth = nativeEl.getBoundingClientRect().width;

    this.filteredOptions = this.customFilter('');
  }

  get refundItems(): FormArray {
    return this.refundForm.get('refundItems') as FormArray;
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  trackByFn(index: number, item: RefundProductInterface): string {
    return `${index}.${item.id}`;
  }

  setFallbackImage(i: number) {
    if (this.imagesRef.length) {
      this.imagesRef.get(i).nativeElement.src = this.fallbackImage;
      this.cdr.detectChanges();
    }
  }

  emitChanges(): void {
    this.quantityChanged.emit(this.addedItems);
    this.cdr.detectChanges();
  }

  onKey(event: KeyboardEvent): void {
    this.filteredOptions = this.customFilter((event.target as HTMLInputElement).value);
    this.quantityChanged.emit();

    if (event.key === 'Enter') {
      (event.target as HTMLInputElement).blur();
      this.addSelectedProduct(this.inputRef.nativeElement.value);
    }
  }

  displayFn(product): string {
    return product.name;
  }

  optionSelect(event: MatAutocompleteSelectedEvent): void {
    this.optionSelected = event.option.value;
  }

  addProduct(): void {
    this.inputRef.nativeElement.focus();
    this.emitChanges();
  }

  onRemoveProduct($event: MouseEvent, i: number): void {
    if (this.addedItems[i].hasOwnProperty('id')) {
      this.addedItems = this.addedItems.filter((element) => {
        return element.id !== this.addedItems[i].id;
      });
    } else {
      this.addedItems = this.addedItems.filter((element) => {
        // I am pretty sure that this code is never triggered and not used but let's keep it for sure
        return (element as any).productId !== (this.addedItems[i] as any).productId;
      });
    }
    (this.refundForm.get('refundItems') as FormArray).removeAt(i);
    this.emitChanges();
  }

  customFilter(value: string): RefundProductInterface[] {
    const filterValue = value.toLowerCase();

    return this.items.filter((option) => option[this.filterBy].toLowerCase().includes(filterValue));
  }

  addSelectedProduct(option: RefundProductInterface): void {
    if (
      this.addedItems.includes(option) ||
      this.addedItems.find(item => item.name === option.name)
    ) {
      console.warn('Selected product is already added or empty', option);

      return;
    } else {
      if (this.optionSelected) {
        const item = this.items.find((product) => product.id === this.optionSelected.id);
        this.addedItems.push(item);
        this.inputRef.nativeElement.value = '';
        this.filteredOptions = this.customFilter('');
        this.inputRef.nativeElement.blur();

        const refundItemsFormGroup: FormGroup[] = this.addedItems.map(
          (item: any) => {
            return this.formBuilder.group({
              identifier: item.id,
              quantity: 0,
              name: item.name,
              price: item.price,
            });
          }
        );
        const refundItemsFormArray: FormArray = this.formBuilder.array(refundItemsFormGroup);
        this.refundForm.setControl('refundItems', refundItemsFormArray);
        this.optionSelected = null;
      }

    }
    this.emitChanges();
  }

  generateNumberOptions(count: number): { label: string; value: number; }[] {
    return Array.from({ length: ++count }, (_, i) => ({
      label: `${i}`,
      value: i,
    }));
  }
}
