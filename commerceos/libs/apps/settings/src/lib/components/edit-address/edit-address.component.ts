import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject } from 'rxjs';
import { skip, takeUntil } from 'rxjs/operators';

import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import {
  OverlayHeaderConfig,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
  PeOverlayRef,
} from '@pe/overlay-widget';

import { FormTranslationsService } from '../../services';
import { AbstractComponent } from '../abstract';

@Component({
  selector: 'peb-edit-address',
  templateUrl: './edit-address.component.html',
  styleUrls: ['./edit-address.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EditAddressComponent extends AbstractComponent implements OnInit {
  data: any;
  countries;
  theme;
  address = '';

  locationForm: FormGroup = this.formBuilder.group({
    address: [''],
    street: [''],
    city: [''],
    zipCode: [''],
    country: ['DE'],
  });

  @ViewChild('streetAddress') addressText: any;

  constructor(
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private http: HttpClient,
    private apm: ApmService,
    private localConstantsService: LocaleConstantsService,
    protected translateService: TranslateService,
    public formTranslationsService: FormTranslationsService,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
  ) {
    super();
  }

  ngOnInit() {
    if (this.overlayData.data.details) {
      this.data = this.overlayData.data.business;
      const details = this.overlayData.data.details.companyAddress;
      this.locationForm.patchValue(details);
    }
    this.overlaySaveSubject.pipe(skip(1)).subscribe((dialogRef) => {
      this.onCheckValidity();
    });
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    this.setOriginForm();

    this.locationForm.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((val) => {
      this.setAddressValue();
    });

    this.formTranslationsService.formTranslationNamespace = 'form.create_form.address';
  }

  setOriginForm() {
    const formData = this.overlayData.data;
    formData.streetAddress = `${formData.street}`;
    this.locationForm.patchValue(formData);
    this.setAddressValue();
  }

  setAddressValue() {
    this.address = `${this.locationForm.get('street').value}, ${this.locationForm.get('zipCode').value || ''}, ${this.locationForm.get('city').value}, ${this.countries.find(val => val.value.toLowerCase() === this.locationForm.get('country').value.toLowerCase()).label}`;
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    this.countries = [];

    if (countryList) {
      Object.keys(countryList).forEach((countryKey) => {
        this.countries.push({
          value: countryKey,
          label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
        });
      });
    } else {
      this.apm.apm.captureError(`Settings edit address could not load countries on this business ${this.data.id}`);
    }
  }

  onClose() {
    this.peOverlayRef.close();
  }

  onCheckValidity() {
    const value = this.locationForm.controls;

    value.street.setValidators([Validators.required]);
    value.street.updateValueAndValidity();

    value.zipCode.setValidators([Validators.required]);
    value.zipCode.updateValueAndValidity();

    value.city.setValidators([Validators.required]);
    value.city.updateValueAndValidity();

    value.country.setValidators([Validators.required]);
    value.country.updateValueAndValidity();

    this.cdr.detectChanges();

    if (this.locationForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    if (this.locationForm.valid) {
      this.data['businessDetail'] = { companyAddress: this.locationForm.value };
      this.peOverlayRef.close({ data: this.data });
    }
  }

  onAutocompleteSelected(places) {
    const postCode = places.address_components.find(val => val.types.includes('postal_code'))?.long_name || '';
    const city = places.address_components.find(val => val.types.includes('locality'))?.long_name || '';
    const country = places.address_components.find(val => val.types.includes('country')) || '';
    const streetNumber = places.address_components.find(val => val.types.includes('street_number'))?.long_name || '';
    const streetName = places.address_components.find(val => val.types.includes('route'))?.long_name || '';

    this.locationForm.get('zipCode').setValue(postCode);
    this.locationForm.get('city').setValue(city);
    this.locationForm.get('country').setValue(country?.short_name);
    this.locationForm.get('street').setValue(`${streetName} ${streetNumber}`);
    this.address = places.formatted_address;
  }
}
