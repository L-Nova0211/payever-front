import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  OnInit,
} from '@angular/core';
import { AbstractControl, ValidatorFn, Validators } from '@angular/forms';
import { BehaviorSubject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { IndustryInterface, ProductWithIndustriesInterface } from '@pe/api';
import {
  AddressInterface,
  AutocompleteOptions,
  PeValidators,
  SelectOptionInterface,
} from '@pe/forms';

import { FORM_ERRORS } from '../../constants';
import {
  CreateBusinessFormIndustryOptionsInterface,
  CreateBusinessFormInterface,
} from '../../interfaces/business-form.interface';
import { BaseBusinessFormComponent } from '../base-business-form.component';

const countryTelephoneCodes = require('country-telephone-code/data.json').countryTelephoneCodes;

const isSuggestedValueValidator = (options: BehaviorSubject<AutocompleteOptions>): ValidatorFn => {
  return (control: AbstractControl): { [key: string]: boolean } | null => {
    return control.value || !control.dirty ? null : { match: true };
  };
};

export const SALES: object[] = [
  { label: 'RANGE_1', max: 0 },
  { label: 'RANGE_2', min: 0, max: 5000 },
  { label: 'RANGE_3', min: 5000, max: 50000 },
  { label: 'RANGE_4', min: 50000, max: 250000 },
  { label: 'RANGE_5', min: 250000, max: 1000000 },
  { label: 'RANGE_6', min: 1000000 },
];

@Component({
  selector: 'entry-create-business-form',
  templateUrl: './create-business-form.component.html',
  styleUrls: ['./create-business-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreateBusinessFormComponent extends BaseBusinessFormComponent implements OnInit, AfterViewInit {
  address: AddressInterface = {};
  formTranslationsScope = 'forms.business_create';
  countryPhones;

  private readonly nameMaxLength: number = 40;
  salesRangeOptions: any;
  // private employeesRangeOptions: any;
  private businessStatusOptionsSubject$ = new BehaviorSubject<SelectOptionInterface[]>(null);
  businessStatusOptions$ = this.businessStatusOptionsSubject$.asObservable()

  private statusOptionsSubject$ = new BehaviorSubject<SelectOptionInterface[]>(null);
  statusOptions$ = this.statusOptionsSubject$.asObservable();

  private industryOptionsSubject$ = new BehaviorSubject<CreateBusinessFormIndustryOptionsInterface[]>(null);
  industryOptions$ = this.industryOptionsSubject$.asObservable();
  private businessNameLabelKeySubject$: BehaviorSubject<string> = new BehaviorSubject<string>(
    'forms.business_create.name.placeholder',
  );

  businessNameLabelKey$ = this.businessNameLabelKeySubject$.asObservable()
  // private foundationYearOptions: any;
  private readonly DEFUALT_VALUE: CreateBusinessFormInterface = {
    countryPhoneCode: 'DE:+49',
  };

  private readonly OTHER_INDUSTRY_CODES = {
    PRODUCT_CODE: 'BUSINESS_PRODUCT_OTHERS',
    INDUSTRY_CODE: 'BRANCHE_OTHER',
  };

  unUsedcodes = ['BV', 'HM'];
  errors = FORM_ERRORS;

  initialIndustryLabel: string;
  private initialIndustrySlug: string;

  ngOnInit(): void {
    this.initialIndustrySlug = (this.route.snapshot.params.industry || '').toLowerCase();

    this.salesRangeOptions = this.getFormOptions(SALES, 'sales');

    this.createForm();

    this.setBusinessStatusOptions(this.businessRegistrationData.businessStatuses);
    this.setStatusOptions(this.businessRegistrationData.statuses);
    this.setIndustriesOptions(this.businessRegistrationData.products);
    this.getCcountryList();

    this.cdr.markForCheck();
    this.cdr.detectChanges();

    this.updateValues();

    this.detectChanges$.pipe(
      tap((errors) => {
        this.errors = errors;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.setCountryPhoneCode();

    this.form.updateValueAndValidity();
  }

  createForm(): void {
    this.form = this.formBuilder.group({
      businessStatus: ['', Validators.required],
      name: ['', [PeValidators.notEmptyStringValidator(this.translateService, 'forms.error.validator.required'),
        Validators.maxLength(this.nameMaxLength)]],
      status: ['', Validators.required],
      salesRange: [this.salesRangeOptions[0].value, Validators.required],
      industry: ['', [isSuggestedValueValidator(this.industryOptionsSubject$), Validators.required]],
      countryPhoneCode: [this.DEFUALT_VALUE.countryPhoneCode, Validators.required],
      phoneNumber: [this.DEFUALT_VALUE.phoneNumber, Validators.required],
    });

    this.form.controls.businessStatus.valueChanges.pipe(
      tap((status) => {
        this.businessNameLabelKeySubject$.next(
          status === 'SOLO_ENTREPRENEUR'
            ? 'forms.business_create.nameOnInvoice.placeholder'
            : 'forms.business_create.name.placeholder'
        );
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  checkErrors(): void {
    for (let control in this.form.controls) {
      if (this.form.controls[control].invalid) {
        this.errors[control].hasError = true;
        if (this.form.controls[control].errors.required) {
          this.errors[control].errorMessage
            = this.translateService.translate(this.errors[control].label) + ' is required';
        }
        if (this.form.controls[control].errors.email) {
          this.errors[control].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');
        }
        if (this.form.controls[control].errors.minlength) {
          this.errors[control].errorMessage = this.translateService.translate('forms.error.validator.tel.minlength');
        }
      } else {
        this.errors[control].hasError = false;
      }
    }

  }

  getCcountryList(): void {
    this.countryPhones = this.addressService.countriesContinent
      .filter(value => !this.unUsedcodes.includes(value?.code))
      .map((value) => {
        return {
          value: `${value.code}:+${countryTelephoneCodes[value.code]}`,
          label: `+${countryTelephoneCodes[value.code]} ${value.name}`,
          groupId: value.continent,
        };
      });
  }


  private getFormOptions(data: object[], label: string): any {
    return data.map((field: { label: string; min?: number; max?: number }) => {
      const value: { min?: number; max?: number } = {};

      if (field.min !== undefined) {
        value.min = field.min;
      }
      if (field.max !== undefined) {
        value.max = field.max;
      }

      return {
        value,
        label: this.translateService.translate(`assets.${label}.${field.label}`),
      };
    });
  }

  private setBusinessStatusOptions(businessStatuses: string[]): void {
    this.businessStatusOptionsSubject$.next(
      businessStatuses.map((businessStatus: string) => {
        return {
          value: businessStatus,
          label: this.translateService.translate(`assets.business_status.${businessStatus}`),
        };
      }),
    );
    this.form.get('businessStatus').setValue(businessStatuses[0]);
  }

  private setCountryPhoneCode(): void {
    const detected = this.getDetectedLocale();
    const country = this.addressService.countriesContinent.find(c => c.code === detected);
    const defaultCountryPhoneCode = country ? `${country.code}:+${countryTelephoneCodes[country.code]}` : '';

    this.form.get('countryPhoneCode').setValue(defaultCountryPhoneCode || this.DEFUALT_VALUE.countryPhoneCode);
  }

  private setStatusOptions(statuses: string[]): void {
    this.statusOptionsSubject$.next(
      statuses.map((status: string) => {
        return {
          value: status,
          label: this.translateService.translate(`assets.status.${status}`),
        };
      }),
    );
    this.form.get('status').setValue(statuses[0]);
  }

  private setIndustriesOptions(products: ProductWithIndustriesInterface[]): void {
    let initialIndustry: CreateBusinessFormIndustryOptionsInterface;
    this.industryOptionsSubject$.next(
      Array.prototype.concat.apply(
        [],
        products.map((product) => {
          const industries = product.industries.map((industry: IndustryInterface) => ({
            value: industry.code,
            slug: industry.code.replace('BRANCHE_', '').toLowerCase(),
            label: this.translateService.translate(`assets.industry.${industry.code}`),
            productCode: product.code,
            defaultBusinessStatus: industry?.defaultBusinessStatus,
          }));

          industries.every((industry) => {
            if (this.initialIndustrySlug === industry.slug) {
              initialIndustry = industry;
            }

            return true;
          });

          if (this.initialIndustrySlug && !initialIndustry) {
            industries.every((industry) => {
              if (
                this.initialIndustrySlug.indexOf(industry.slug) >= 0 ||
                industry.slug.indexOf(this.initialIndustrySlug) >= 0
              ) {
                initialIndustry = industry;
              }

              return true;
            });
          }

          return industries.filter((industry) => {
            return (
              industry.value !== this.OTHER_INDUSTRY_CODES.INDUSTRY_CODE ||
              product.code === this.OTHER_INDUSTRY_CODES.PRODUCT_CODE
            );
          });
        }),
      ),
    );

    if (initialIndustry) {
      this.form.get('industry').setValue(initialIndustry);
      this.initialIndustryLabel = initialIndustry.label;
      if (initialIndustry.defaultBusinessStatus) {
        this.form.get('businessStatus').setValue(initialIndustry.defaultBusinessStatus);
      }
      this.cdr.detectChanges();
      this.cdr.markForCheck();
    }

  }

  private getDetectedLocale(): string {
    let result: string = (require('locale2') || '').split('-')[0];
    if (result === 'nb') {
      result = 'no';
    }

    return result.toUpperCase();
  }

  validateNumber(event): void {
    const keyCode = event.keyCode;

    const excludedKeys = [8, 37, 39, 46];

    if (!((keyCode >= 48 && keyCode <= 57) ||
      (keyCode >= 96 && keyCode <= 105) ||
      (excludedKeys.includes(keyCode)))) {
      event.preventDefault();
    }
  }

}
