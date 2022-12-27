import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';


@Component({
  // tslint:disable-next-line:component-selector
  selector: 'pe-products-autocomplete',
  templateUrl: './products-autocomplete.component.html',
  styleUrls: ['./products-autocomplete.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeProductsAutocompleteComponent implements OnInit, OnChanges {

  @Input() label = '';
  @Input() values: string[];
  @Input() placeholder = 'Search';
  @Input() disabled = false;

  @Output() selected = new EventEmitter<string>();

  @ViewChild('input', { static: true }) elementRef: ElementRef;

  formControl: FormControl = new FormControl('');
  filteredValues: Observable<string[]>;


  ngOnInit(): void {
    this.filteredValues = this.formControl.valueChanges.pipe(
      startWith(''),
      map(value => this.filter(value)),
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    const { disabled } = changes;
    if (disabled?.currentValue) {
      this.disabled = disabled.currentValue;
      this.formControl[this.disabled ? 'disable' : 'enable']();
    }
  }

  valueSelected(value: string): void {
    this.elementRef.nativeElement.blur();
    this.formControl.patchValue(value);

    this.selected.emit(value);
  }

  private filter(value: string | any): string[] {
    const filterValue: string = this.normalizeValue(value);

    return this.values.filter(v => this.normalizeValue(v).includes(filterValue));
  }

  private normalizeValue(value: string): string {
    return value.toLowerCase().replace(/\s/g, '');
  }

  trackValue(index: number, value: string) {
    return value;
  }

  clear() {
    this.formControl.patchValue('');
  }
}
