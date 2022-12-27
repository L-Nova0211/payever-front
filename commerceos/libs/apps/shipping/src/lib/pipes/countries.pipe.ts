import { Pipe, PipeTransform } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';

import { LocaleConstantsService } from '@pe/i18n';

@Pipe({
  name: 'countries',
})
export class CountriesPipe implements PipeTransform {
  countries = [];
  constructor(private localConstantsService: LocaleConstantsService, private apmService: ApmService) {}

  transform(countryCodes: string[]) {
    this.getCountries();
    let countryString = '';
    countryCodes.forEach((code, index) => {
      if (index === countryCodes.length - 1) {
        countryString =
          `${countryString}${this.getCountry(code)}`;

        return;
      }
      countryString =
        `${countryString}${this.getCountry(code)}, `;
    });

    return countryString;
  }

  getCountry(code) {
    const country = this.countries.find(element => element.value === code);
    // this one is temporary, left for now, cos on live we have some businesses with incorrect country, created on BE
    if (!country) {
      return '';
    }

    return country.label;
  }

  getCountries() {
    const countryList = this.localConstantsService.getCountryList();

    Object.keys(countryList).map((countryKey) => {
      this.countries.push({
        value: countryKey,
        label: Array.isArray(countryList[countryKey]) ? countryList[countryKey][0] : countryList[countryKey],
      });
    });
  }
}
