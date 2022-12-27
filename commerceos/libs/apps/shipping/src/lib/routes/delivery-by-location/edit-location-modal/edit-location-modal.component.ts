import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { countries } from 'countries-list';
import { BehaviorSubject, merge } from 'rxjs';
import { skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PeOverlayRef,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';

import { ShippingOriginInterface } from '../../../interfaces';
import { BaseComponent } from '../../../misc/base.component';
import { NumericPipe } from '../../../pipes/keypress.pipe';

@Component({
  selector: 'lib-shipping-form',
  templateUrl: './edit-location-modal.component.html',
  styleUrls: ['./edit-location-modal.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LibShippingEditLocationModalComponent extends BaseComponent implements OnInit {
  edit = false;
  countries;
  theme;
  address = '';

  locationForm: FormGroup = this.formBuilder.group({
    address: [''],
    name: [''],
    streetAddress: [''],
    city: [''],
    zipCode: [''],
    stateProvinceCode: [''],
    countryCode: ['DE'],
    phone: [''],
    phonePrefix: [''],
    phoneCountry: [''],
  });

  jsonURL = '/assets/json_data/countries_list.json';
  countriesWithCodes = [];

  @ViewChild('streetAddress') addressText: any;

  constructor(
    public numeric: NumericPipe,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private http: HttpClient,
    private destroyed$: PeDestroyService,
    private localConstantsService: LocaleConstantsService,
    protected translateService: TranslateService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super(translateService);
  }

  ngOnInit() {
    this.overlaySaveSubject.pipe(skip(1), tap(() => {
      this.onCheckValidity();
    }), takeUntil(this.destroyed$)).subscribe();
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    if (this.overlayData?.data?._id) {
      this.edit = true;
      this.setOriginForm();
    }

    const selectedCountry = this.locationForm.get('countryCode').value;

    this.loadCountryData();
    this.locationForm.controls.phoneCountry.setValue(selectedCountry);
    this.updatePhonePrefix(selectedCountry);

    merge(
      this.locationForm.controls.streetAddress.valueChanges.pipe(
        tap(() => {
          this.setAddressValue();
        })
      ),
      this.locationForm.controls.zipCode.valueChanges.pipe(
        tap(() => {
          this.setAddressValue();
        })
      ),
      this.locationForm.controls.countryCode.valueChanges.pipe(
        tap((val) => {
          this.locationForm.get('phoneCountry').patchValue(val);
          this.setAddressValue();
        })
      ),
      this.locationForm.controls.phoneCountry.valueChanges.pipe(
        tap((val) => {
          if (this.locationForm.controls.countryCode.value !== this.locationForm.controls.phoneCountry.value) {
            this.locationForm.get('countryCode').setValue(val);
          }
          this.setAddressValue();
          this.updatePhonePrefix(val);
        })
      ),
      this.locationForm.controls.city.valueChanges.pipe(
        tap((val) => {
          this.locationForm.controls.city.patchValue(
            val.replace(/[0-9]/g, ''),
            { onlySelf: true, emitEvent: false }
          );
          this.setAddressValue();
        })
      )
    ).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  setOriginForm() {
    const formData: ShippingOriginInterface = this.overlayData.data;
    formData.streetAddress = `${formData?.streetName} ${formData?.streetNumber}`;
    this.locationForm.patchValue(formData);
    this.setAddressValue();
  }

  setAddressValue() {
    this.address =
      `${this.locationForm.get('streetAddress').value}, ${this.locationForm.get('zipCode').value || ''},
       ${this.locationForm.get('city').value},
       ${this.countries.find((val) => {
          return val.value.toLowerCase() === this.locationForm.get('countryCode').value.toLowerCase()
        }).label
       }`;
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  onLocationSelected(event) {}

  public loadCountryData() {
    Object.keys(countries).map((countryKey) => {
      this.countriesWithCodes.push({
        value: countryKey,
        dialCode: `+${countries[countryKey].phone}`,
        label: Array.isArray(countries[countryKey])
          ? countries[countryKey][0]
          : countries[countryKey],
      });
    });
  }

  updatePhonePrefix(selectedCountry) {
    this.locationForm.get('phonePrefix').setValue(`${this.getPhoneCodeByCountryCode(selectedCountry)} `);
    this.locationForm.get('phonePrefix').updateValueAndValidity();
    this.cdr.detectChanges();
  }

  onCheckValidity() {
    const value = this.locationForm.controls;

    value.name.setValidators([Validators.required]);
    value.name.updateValueAndValidity();

    value.streetAddress.setValidators([Validators.required]);
    value.streetAddress.updateValueAndValidity();

    value.zipCode.setValidators([Validators.required]);
    value.zipCode.updateValueAndValidity();

    value.city.setValidators([Validators.required]);
    value.city.updateValueAndValidity();

    value.countryCode.setValidators([Validators.required]);
    value.countryCode.updateValueAndValidity();

    value.phone.setValidators([Validators.pattern(/^.{4,12}$/)]);
    value.phone.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.locationForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    const value = this.locationForm.controls;
    if (this.locationForm.valid) {
      const streetNumber = value.streetAddress.value.split(/(\d+)/g);
      const streetName = value.streetAddress.value.replace(streetNumber[1], '').replace(',', '').trim();
      const locationValues = {
        data: {
          streetName,
          streetNumber: streetNumber[1] || '',
          name: value.name.value,
          zipCode: String(value.zipCode.value),
          city: value.city.value,
          countryCode: value.countryCode.value,
          phone: `${value.phonePrefix.value.replace(/\s+/g, '')} ${value.phone.value}`,
        },
      };
      if (this.edit) {
        locationValues['id'] = this.overlayData.data._id;
      }
      this.peOverlayRef.close(locationValues);
    }
  }

  getPhoneCodeByCountryCode(code) {
    const foundCode = this.countriesWithCodes.find(country => country.value.toLowerCase() === code.toLowerCase());

    return foundCode?.dialCode.replace(/\s/g, '') || '';
  }

  onAutocompleteSelected(places) {
    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';

    this.locationForm.get('zipCode').setValue(postCode);
    this.locationForm.get('city').setValue(city);
    this.locationForm.get('countryCode').setValue(country?.short_name);
    this.locationForm.get('streetAddress').setValue(`${streetName} ${streetNumber}`);
    this.address = places.formatted_address;
  }
}
