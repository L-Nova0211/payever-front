import { Pipe, PipeTransform } from '@angular/core';

import { LocaleConstantsService } from '@pe/i18n';

@Pipe({
  name: 'country',
})
export class CountryPipe implements PipeTransform {
  countries = [];
  constructor(private localConstantsService: LocaleConstantsService) {}

  transform(countryCode: string) {
    this.getCountries();
    const country = this.countries.find(element => element.value === countryCode);

    return country.label;
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey])
          ? countryList[countryKey][0]
          : countryList[countryKey],
      });
    });
  }
}
