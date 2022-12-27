import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, EventEmitter, Inject, Input, NgZone, OnInit, Output } from '@angular/core';

import { AddressInterface, AutocompleteType } from '../interfaces';
import { GoogleAutocompleteService } from '../services';
interface AddressComponentInterface {
  long_name: string;
  short_name: string;
  types: string[];
}

@Directive({
  selector: '[peGoogleAutocomplete]',
})
export class GoogleAutocompleteDirective implements OnInit {

  @Input() autocompleteType: AutocompleteType = 'address';
  @Input() countriesOnly: string[] = null;
  @Output() address: EventEmitter<AddressInterface> = new EventEmitter<AddressInterface>();

  private autocomplete: any;
  private window: Window;

  private static parseAddressComponent(
    name: string,
    components: AddressComponentInterface[],
    property: string = 'long_name',
  ): any {
    let result = '';
    components.forEach((component: AddressComponentInterface) => {
      if (component.types.indexOf(name) !== -1) {
        result = component[property];
      }
    });

    return result;
  }

  constructor(
    private peGoogleAutocompleteService: GoogleAutocompleteService,
    private elementRef: ElementRef,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document,
  ) {
    this.window = this.document.defaultView;
  }

  ngOnInit(): void {
    this.peGoogleAutocompleteService.onInitSubscribe(() => {
      const inputElem: HTMLElement = this.elementRef.nativeElement;

      if (this.window.google && this.window.google.maps) {
        const params: any = {
          types: [this.autocompleteType],
        };
        if (this.countriesOnly && this.countriesOnly.length) {
          params.componentRestrictions = { country: this.countriesOnly };
        }

        this.autocomplete = new this.window.google.maps.places.Autocomplete(inputElem, params);
        this.autocomplete.addListener('place_changed', this.change.bind(this));
        this.window.google.maps.event.addDomListener(inputElem, 'keydown', (event: KeyboardEvent) => {
          if (event.keyCode === 13) {
            event.preventDefault();
          }
        });
      }
    });
  }

  private change(): void {
    const addressComponents: AddressComponentInterface[] = this.autocomplete.getPlace().address_components;
    const street = GoogleAutocompleteDirective.parseAddressComponent('route', addressComponents);
    const streetNumber = ` ${GoogleAutocompleteDirective.parseAddressComponent('street_number', addressComponents)}`;
    this.zone.run(() => {
      this.address.emit({
        country: GoogleAutocompleteDirective.parseAddressComponent('country', addressComponents, 'short_name').trim(),
        city: GoogleAutocompleteDirective.parseAddressComponent('locality', addressComponents).trim(),
        zip_code: GoogleAutocompleteDirective.parseAddressComponent('postal_code', addressComponents).trim(),
        street: `${street}${streetNumber || ''}`.trim(),
        street_name: street,
        street_number: streetNumber,
      });
    });
  }
}
