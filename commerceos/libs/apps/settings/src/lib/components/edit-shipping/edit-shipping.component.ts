import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { skip } from 'rxjs/operators';

import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-shipping',
  templateUrl: './edit-shipping.component.html',
  styleUrls: ['./edit-shipping.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditShippingComponent extends AbstractComponent implements OnInit {
  theme;
  tfa: boolean;
  countries = [];
  addressArray = [];
  shippingForm: FormGroup;
  formTranslationNamespace = 'form.create_form.address';

  get address(): any {
    return this.shippingForm.get('address');
  }

  constructor(
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private cdr: ChangeDetectorRef,
    private localConstantsService: LocaleConstantsService,
    private translateService: TranslateService
  ) {
    super();
  }

  ngOnInit(): void {
    this.theme = this.overlayConfig.theme;
    this.getCountries();
    this.shippingForm =  this.formBuilder.group({
      address: this.formBuilder.array([
        this.formBuilder.group({
          id: [''],
          address: [''],
          apartment: [''],
          city: [''],
          country: [''],
          street: [''],
          zipCode: [''],
        }),
      ]),
    });

    if (this.overlayData.data.user) {
      this.shippingForm = this.formBuilder.group({
        address: this.formBuilder.array([]),
      });
      this.overlayData.data.user.shippingAddresses.forEach((item) => {
        const formItem = this.formBuilder.group({
          id: item._id,
          apartment: item.apartment,
          city: item.city,
          country: item.country,
          street: item.street,
          zipCode: item.zipCode,
          address: [''],
        });
        this.setAddressValue(formItem);
        this.address.push(formItem);
      });
    }
    this.cdr.detectChanges();

    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
  }

  onCheckValidity() {
    this.address.controls.forEach((rate) => {
        rate.get('city').setValidators([Validators.required]);
        rate.get('city').updateValueAndValidity();

        rate.get('country').setValidators([Validators.required]);
        rate.get('country').updateValueAndValidity();

        rate.get('street').setValidators([Validators.required]);
        rate.get('street').updateValueAndValidity();

        rate.get('zipCode').setValidators([Validators.required]);
        rate.get('zipCode').updateValueAndValidity();
    });
    this.cdr.detectChanges();

    if (this.shippingForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.shippingForm.valid) {
      const data = [];
      this.address.controls.forEach((item) => {
        data.push({
          id: item.get('id').value,
          apartment: item.get('apartment').value,
          city: item.get('city').value,
          country: item.get('country').value,
          street: item.get('street').value,
          zipCode: item.get('zipCode').value.toString(),
        });
      });
      this.peOverlayRef.close({ data: { data } });
    }
  }

  setAddressValue(form) {
    this.addressArray.push(
      `${form.get('street').value},
      ${form.get('zipCode').value || ''},
      ${form.get('city').value},
      ${this.countries.find(val => val.value.toLowerCase() === form.get('country').value.toLowerCase())?.label || ''}`
    );
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    Object.keys(countryList).forEach((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }

  onAutocompleteSelected(places, controlIndex) {
    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';

    this.address.controls[controlIndex].get('zipCode').setValue(postCode);
    this.address.controls[controlIndex].get('city').setValue(city);
    this.address.controls[controlIndex].get('country').setValue(country?.short_name);
    this.address.controls[controlIndex].get('street').setValue(`${streetName} ${streetNumber}`);
    this.addressArray[controlIndex] = places.formatted_address;
  }

  addNewRate() {
    const box = this.address;
    const formItem = this.formBuilder.group({
      id: [''],
      address: [''],
      apartment: [''],
      city: [''],
      country: [''],
      street: [''],
      zipCode: [''],
    });
    box.push(formItem);
    this.setAddressValue(formItem);
  }

  removeAddress(i) {
    this.address.controls.splice(i, 1);
  }

  getErrorMessage (formControlName) {
    return this.translateService.translate(`${this.formTranslationNamespace}.${formControlName}.label`) + ' ' +
      this.translateService.translate(`form.create_form.errors.is_require`);
  }
}
