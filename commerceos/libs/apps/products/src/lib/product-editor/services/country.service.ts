import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { BehaviorSubject, Subject } from 'rxjs';

import { EnvService } from '@pe/common';

import { Headings } from '@pe/confirmation-screen';
import { AddressService, CountryArrayInterface } from '@pe/forms-core';
import { TranslateService } from '@pe/i18n-core';
import { PeUser, UserState } from '@pe/user';

import { ProductModel } from '../../shared/interfaces/product.interface';
import { DefaultCountryService } from '../../shared/services/country.service';

@Injectable()
export class CountryService {
  private countryStream$ = new BehaviorSubject<CountryArrayInterface>(null);
  private countries: CountryArrayInterface[] = [];

  @SelectSnapshot(UserState.user) userData: PeUser;

  noValid$ = new BehaviorSubject<boolean>(false);
  country$ = this.countryStream$.asObservable();
  readonly saved$ = new Subject<CountryArrayInterface>();
  updatedCountry$ = new Subject<ProductModel>();
  selectedIndex = 0;
  defaultCountry: string;

  get country(): CountryArrayInterface {
    return this.countryStream$.value;
  }

  set country(country: CountryArrayInterface) {
    this.findSelectedIndex(country);
    this.countryStream$.next(country);
  }

  get confirmHeadings(): Headings {
    return {
      title: this.translateService.translate('dialog_pre_update.heading_country'),
      subtitle: this.translateService.translate('dialog_pre_update.description_country'),
      confirmBtnText: this.translateService.translate('dialog_pre_update.yes'),
      declineBtnText: this.translateService.translate('dialog_pre_update.no'),
    }
  }

  constructor(
    private addressService: AddressService,
    private envService: EnvService,
    private countryService: DefaultCountryService,
    private translateService: TranslateService
  ) {
    this.defaultCountry = this.countryService.defaultCountry;
  }

  getCountries(): CountryArrayInterface[] {
    this.countries = this.addressService.preferredCountriesArray
    .concat(this.addressService.countriesArray).map(
      item => ({
        ...item,
        name: Array.isArray(item.name) ? item.name[item.name.length - 1] : item.name,
      })
    ).sort((a, b) => a.name > b.name ? 1 : -1);

    this.setDefault();

    return this.countries;
  }

  setCountryByCode(code: string): void {
    if(code) {
      this.country = this.countries.find(item => item.code.toLowerCase() === code.toLowerCase());
    }
  }

  checkValidation() {
    this.noValid$.next(!this.country);
  }

  private setDefault() {
    if (this.defaultCountry) {
      this.setCountryByCode(this.defaultCountry);
    }
  }

  private findSelectedIndex(country: CountryArrayInterface) {
    if (country) {
      this.selectedIndex = this.countries.findIndex(item => item.code == country.code);
    }
  }
}
