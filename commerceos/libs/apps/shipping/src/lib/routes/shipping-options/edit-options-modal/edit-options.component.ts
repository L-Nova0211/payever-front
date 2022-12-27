import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, EMPTY } from 'rxjs';
import { catchError, filter, skip, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { CurrencySymbolPipe, LocaleConstantsService, TranslateService } from '@pe/i18n';
import {
  OverlayHeaderConfig,
  PeOverlayRef,
  PE_OVERLAY_CONFIG,
  PE_OVERLAY_DATA,
  PE_OVERLAY_SAVE,
} from '@pe/overlay-widget';

import { ConditionTypesEnum } from '../../../enums/ConditionTypesEnums';
import { RateTypesEnums } from '../../../enums/RateTypeEnums';
import { ShippingSpeedEnum } from '../../../enums/ShippingSpeedEnum';
import { BaseComponent } from '../../../misc/base.component';
import { NumericPipe } from '../../../pipes/keypress.pipe';
import { PebShippingZoneService } from '../../../services/shipping-zone.service';

@Component({
  selector: 'peb-edit-shipping-form',
  templateUrl: './edit-options.component.html',
  styleUrls: ['./edit-options.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PebShippingEditOptionsComponent extends BaseComponent implements OnInit {
  @ViewChild('countryPicker') countryPicker: any;
  theme;

  edit = false;
  countries;
  alreadySelectedCountries;
  countriesAutocomplete;
  carriers;
  currency;
  currencyName = '';

  conditionsEnum = ConditionTypesEnum;
  rateTypeEnum = RateTypesEnums;

  rateTypes = [
    { label: 'Custom rates', value: RateTypesEnums.CUSTOM },
  ];

  conditions = [
    { label: 'None', value: ConditionTypesEnum.NONE },
    { label: 'Based on item weight', value: ConditionTypesEnum.ITEM_WEIGHT },
    { label: 'Based on order price', value: ConditionTypesEnum.ORDER_PRICE },
  ];

  shippingSpeed = [
    { label: 'Standard (2 to 4 business days)', value: ShippingSpeedEnum.STANDARD },
    { label: 'Express (1 to 2 business days)', value: ShippingSpeedEnum.EXPRESS },
    { label: 'Custom Flat rate (no shipping time)', value: ShippingSpeedEnum.CUSTOM },
  ];

  shippingForm: FormGroup = this.formBuilder.group({
    name: [''],
    countries: [''],
    rates: this.formBuilder.array([
      this.formBuilder.group({
        name: [''],
        rateType: [RateTypesEnums.CUSTOM],
        ratePrice: [],
        conditions: [ConditionTypesEnum.NONE],
        minWeight: [],
        maxWeight: [],
        minPrice: [],
        maxPrice: [],
        shippingSpeed: [ShippingSpeedEnum.STANDARD],
        carrier: [],
        autoShow: [false],
        handleFeePercent: [null, [Validators.maxLength(3)]],
        handleFeeFlat: [],
      }),
    ]),
  });

  constructor(
    public numeric: NumericPipe,
    private formBuilder: FormBuilder,
    private peOverlayRef: PeOverlayRef,
    private currencySymbol: CurrencySymbolPipe,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_SAVE) public overlaySaveSubject: BehaviorSubject<any>,
    private localConstantsService: LocaleConstantsService,
    private destroyed$: PeDestroyService,
    private cdr: ChangeDetectorRef,
    private shippingZoneService: PebShippingZoneService,
    private apmService: ApmService,
    protected translateService: TranslateService,
  ) {
    super(translateService);
  }

  get rates(): FormArray {
    return this.shippingForm.get('rates') as FormArray;
  }

  ngOnInit() {
    this.getCountries();
    this.theme = this.overlayConfig.theme;
    this.overlaySaveSubject.pipe(
      skip(1),
      tap((dialogRef) => {
        this.onCheckValidity();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.carriers = this.overlayData?.connections?.map((conn) => {
      return { label: conn.name?.toUpperCase(), value: conn.name };
    });
    if (this.carriers?.length > 0) {
      this.rateTypes.push(
        { label: 'Carrier rates', value: RateTypesEnums.CARRIER },
      );
    }
    this.currencyName = this.overlayData.currency;
    this.currency = this.currencySymbol.transform(this.overlayData.currency);

    if (this.overlayData?.data?._id) {
      this.shippingForm = this.formBuilder.group({
        name: [''],
        countries: [''],
        rates: this.formBuilder.array([]),
      });
      const selectedCountries = this.alreadySelectedCountries?.length ? 
      this.alreadySelectedCountries : this.countries;

      const countries = this.overlayData.data.countryCodes.map((countryId) => {
        const countryArray = selectedCountries.filter(item => item.value === countryId);

        return countryArray[0].label;
      });
      this.shippingForm.get('name').setValue(this.overlayData.data.name);
      this.shippingForm.get('countries').setValue(countries);
      this.overlayData.data.rates.forEach((item) => {
        this.rates.push(this.formBuilder.group({
          name: item.name,
          rateType: item.rateType,
          ratePrice: item.ratePrice,
          conditions: item.conditions,
          minWeight: item.minWeight,
          maxWeight: item.maxWeight,
          minPrice: item.minPrice,
          maxPrice: item.maxPrice,
          shippingSpeed: item.shippingSpeed,
          carrier: item?.integration?.name,
          autoShow: item.autoShow,
          handleFeePercent: item?.integration?.handlingFeePercentage,
          handleFeeFlat: item?.integration?.flatAmount,
        }));
      });
      this.edit = true;
    }

    this.rates.controls.forEach((rate) => {
      rate.get('handleFeePercent').valueChanges.pipe(
        filter(data => !!data),
        tap((value) => {
          if (value > 100) {
            rate.get('handleFeePercent').patchValue(100);
          }
          if (value < 0) {
            rate.get('handleFeePercent').patchValue(0);
          }
        })
      ).subscribe();

      ['ratePrice', 'minWeight', 'maxWeight', 'minPrice', 'maxPrice', 'handleFeeFlat'].forEach((item) => {
        rate.get(item).valueChanges.pipe(
          filter(data => !!data && data < 0),
          tap((value) => {
              rate.get(item).patchValue(0);
          })
        ).subscribe();
      });
    });
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();
    const items = [];
    this.overlayData?.items?.forEach((val) => {
      if (val.hasOwnProperty('data')) {
        val.data.countryCodes.forEach((item) => {
          items.push(item);
        });
      } else {
        val.countryCodes.forEach((item) => {
          items.push(item);
        });
      }
    });

    this.countries = [];
    this.alreadySelectedCountries = [];
    if (items.find(val => val === 'All')) {
      this.alreadySelectedCountries.push({
        value: 'All',
        label: 'Rеst of World',
      });
    } else {
      this.countries.push({
        value: 'All',
        label: 'Rеst of World',
      });
    }
    Object.keys(countryList).map((countryKey) => {
      const country = {
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      };
      if (!items.find(val => countryKey === val)) {
        this.countries.push(country);
      } else {
        this.alreadySelectedCountries.push(country);
      }
    });

    this.countriesAutocomplete = this.countries.map(country => country.label);
  }

  onCheckValidity() {
    const value = this.shippingForm.controls;

    value.name.setValidators([Validators.required]);
    value.name.updateValueAndValidity();

    value.countries.setValidators([Validators.required]);
    value.countries.updateValueAndValidity();

    this.rates.controls.forEach((rate) => {
      if (rate.get('rateType').value === RateTypesEnums.CUSTOM) {
        rate.get('name').setValidators([Validators.required]);
      }
      if (rate.get('rateType').value === RateTypesEnums.CARRIER) {
        rate.get('carrier').setValidators([Validators.required]);
      }

      if (rate.get('conditions').value === ConditionTypesEnum.ITEM_WEIGHT) {
        rate.get('minPrice').setValidators([]);
        rate.get('maxPrice').setValidators([]);
        rate.get('minWeight')
          .setValidators([Validators.required, Validators.max(rate.get('maxWeight').value - 1 || 0)]);
        rate.get('maxWeight').setValidators([Validators.required]);
      } else if (rate.get('conditions').value === ConditionTypesEnum.ORDER_PRICE) {
        rate.get('minWeight').setValidators([]);
        rate.get('maxWeight').setValidators([]);
        rate.get('minPrice').setValidators([Validators.required, Validators.max(rate.get('maxPrice').value - 1 || 0)]);

        rate.get('maxPrice').setValidators([Validators.required]);
      } else {
        rate.get('minPrice').setValidators([]);
        rate.get('maxPrice').setValidators([]);
        rate.get('minWeight').setValidators([]);
        rate.get('maxWeight').setValidators([]);
      }
      rate.updateValueAndValidity();
    });
    this.cdr.detectChanges();
    if (this.shippingForm.valid) {
      this.onSave();
    }
  }

  onSave() {
    const form = this.shippingForm.controls;

    const countries = [];
    if (form.countries.value) {
      form.countries.value.forEach((country) => {
        const countryValue = this.alreadySelectedCountries.find(item => item.label === country)?.value;
        if (countryValue) {
          countries.push(countryValue);
        }
      });
    }

    let rates;
    if (form.rates.value) {
      rates = form.rates.value.map((rate) => {
        if (rate.rateType === RateTypesEnums.CUSTOM) {
          const rateObject = {};
          Object.keys(rate).forEach((property) => {
            if (rate[property] !== null) {
              rateObject[property] = rate[property];
            }
          });

          return rateObject;
        }

        return {
          rateType: rate.rateType,
          autoShow: rate.autoShow ? rate.autoShow : false,
          integration: {
            name: rate.carrier,
            flatAmount: rate.handleFeeFlat,
            handlingFeePercentage: rate.handleFeePercent,
          },
        };
      });
    }

    if (this.shippingForm.valid) {
      this.overlayConfig.doneBtnTitle = 'Saving...';
      if (this.edit) {
        const zoneToSave = {
          data: {
            rates,
            name: form.name.value,
            countryCodes: countries,
          },
          id: this.overlayData?.data?._id,
        };

        this.shippingZoneService
          .editShippingZone(zoneToSave.id, zoneToSave.data)
          .pipe(
            tap((_) => {
              this.close(zoneToSave);
            }),
            takeUntil(this.destroyed$),
            catchError((err) => {
              this.apmService.apm.captureError(
                `Cant edit shipping zones ERROR ms:\n ${JSON.stringify(err)}`
              );

              this.peOverlayRef.close(null);

              return EMPTY;
            }),
          ).subscribe();
      } else {
        const shippingZone = {
          rates,
          name: form.name.value,
          countryCodes: countries,
        };
        this.shippingZoneService
          .addShippingZone(shippingZone)
          .pipe(
            tap((data) => {
              this.close(shippingZone);
            }),
            takeUntil(this.destroyed$),
            catchError((err) => {
              this.apmService.apm.captureError(
                `Cant add zones ERROR ms:\n ${JSON.stringify(err)}`
              );
              this.peOverlayRef.close(null);

              return EMPTY;
            }),
          ).subscribe();
      }
    }
  }

  close(data) {
    this.peOverlayRef.close(data);
  }

  addNewRate() {
    const box = this.rates as FormArray;
    box.push(
      this.formBuilder.group({
        name: [''],
        rateType: [RateTypesEnums.CUSTOM],
        ratePrice: [],
        conditions: [ConditionTypesEnum.NONE],
        minWeight: [],
        maxWeight: [],
        minPrice: [],
        maxPrice: [],
        shippingSpeed: [ShippingSpeedEnum.STANDARD],
        carrier: [],
        autoShow: [false],
        handleFeePercent: [],
        handleFeeFlat: [],
      }),
    );
  }

  removeRate(index) {
    this.rates.removeAt(index);
  }

  removeCountry(countryName) {
    const countryToAddIntoArray = this.alreadySelectedCountries.find(item => item.label === countryName);
    if (countryToAddIntoArray) {
      this.countries.push(countryToAddIntoArray);
      this.alreadySelectedCountries.splice(this.alreadySelectedCountries.indexOf(countryToAddIntoArray), 1);
      this.countriesAutocomplete.push(countryName);
      this.countriesAutocomplete.sort();
      this.countryPicker.filteredOptions = this.countriesAutocomplete;
      this.cdr.detectChanges();
    }
  }

  changeCountry(addedItems) {
    if (addedItems) {
      addedItems.forEach((country) => {
        const countryToRemoveFromArray = this.countries.find(item => item.label === country);
        if (countryToRemoveFromArray) {
          this.alreadySelectedCountries.push(countryToRemoveFromArray);
          this.countries.splice(this.countries.indexOf(countryToRemoveFromArray), 1);
          this.countriesAutocomplete.splice(this.countriesAutocomplete.indexOf(country), 1);
          this.countriesAutocomplete.sort();
          this.countryPicker.filteredOptions = this.countriesAutocomplete;
          this.cdr.detectChanges();
        }
      });
    }
  }

  carrierTypeChanged(e) {
    if (this.carriers?.length > 0) {
      this.rates.controls.forEach((rate) => {
        const connectionObj = this.overlayData.connections.find(val => val.name === e);
        if (rate.get('rateType').value === RateTypesEnums.CARRIER) {
          rate.get('handleFeePercent').setValue(connectionObj.handlingFeePercentage);
          rate.get('handleFeeFlat').setValue(connectionObj.flatAmount);
        }
      });
    }
  }

  conditionsChange(value, rate) {
    if (value === this.conditionsEnum.ITEM_WEIGHT) {
      rate.get('minPrice').setValue(null);
      rate.get('maxPrice').setValue(null);
    } else if (value === this.conditionsEnum.ORDER_PRICE) {
      rate.get('minWeight').setValue(null);
      rate.get('maxWeight').setValue(null);
    } else {
      rate.get('minWeight').setValue(null);
      rate.get('maxWeight').setValue(null);
      rate.get('minPrice').setValue(null);
      rate.get('maxPrice').setValue(null);
    }
  }
}
