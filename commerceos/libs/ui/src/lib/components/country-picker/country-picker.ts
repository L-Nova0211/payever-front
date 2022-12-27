import {
  Component,
  ElementRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { countries } from 'country-data-list';

let uniqueId = 0;

@Component({
  selector: 'peb-country-picker',
  templateUrl: './country-picker.html',
  styleUrls: ['./country-picker.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class PebCountryPickerComponent implements OnInit {
  /** Sets input placeholder */
  @Input() placeholder: string;
  /** Use of external country data */
  @Input() externalCountries;
  /** Sets error message */
  @Input() errorMessage: string;
  /** Whether field is invalid */
  @Input() isFieldInvalid = false;

  label = 'Countries and regions';

  inputId = `peb-counrty-picker-${(uniqueId += 1)}`;

  private countries = [];
  /** Filtered options in autocomplete */
  filteredOptions = [];

  /** Added countries */
  addedCountries = [];

  /** Emits value on change */
  @Output() readonly changed: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly removed: EventEmitter<any> = new EventEmitter<any>();
  @Output() readonly touched: EventEmitter<any> = new EventEmitter<any>();

  /** Input ref */
  @ViewChild('input') inputRef: ElementRef;

  ngOnInit() {
    this.resetCountries();

    this.filteredOptions = this.customFilter('');
  }

  /** Emits when selected countries changed */
  emitChanges() {
    this.changed.emit(this.addedCountries);
  }

  /** On keypress filters auto complete items */
  onKey(event) {
    this.filteredOptions = this.customFilter(event.target.value);
  }

  /** Adds selected country to the list */
  addCountry() {
    if (this.inputRef.nativeElement.value === '' || this.addedCountries.includes(this.inputRef.nativeElement.value)) {
      throw Error('value same or empty');
    } else {
      if (this.countries.filter((item) => item === this.inputRef.nativeElement.value).length !== 0) {
        if (this.addedCountries[0] === 'All Countries' || this.inputRef.nativeElement.value === 'All Countries') {
          this.addedCountries = [];
        }
        this.addedCountries.push(this.inputRef.nativeElement.value);
        this.inputRef.nativeElement.value = '';
      }
    }

    this.touched.emit();
    this.emitChanges();
  }

  /** Removes country */
  onRemoveCountry($event, i) {
    const itemToRemove = this.addedCountries[i];
    this.addedCountries = this.addedCountries.filter((element) => {
      return element !== this.addedCountries[i];
    });

    this.removed.emit(itemToRemove);
    this.emitChanges();
  }

  resetCountries() {
    if (this.externalCountries) {
      this.countries = this.externalCountries;
    } else {
      this.countries = countries.all.map((element) => {
        return element.name;
      });
    }
  }

  private customFilter(value: string): string[] {
    const filterValue = value.toLowerCase();

    return this.countries.filter((option) => option.toLowerCase().includes(filterValue));
  }
}
