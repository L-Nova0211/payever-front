import { Injectable } from '@angular/core';
import { Resolve } from '@angular/router';
import { Observable, of } from 'rxjs';

import { CountryArrayInterface } from '@pe/forms-core';

import { CountryService } from '../services/country.service';

@Injectable()
export class CountriesResolver implements Resolve<CountryArrayInterface[]> {
  constructor(
    private countryService: CountryService
  ) { }

  resolve(): Observable<CountryArrayInterface[]> {
    return of(this.countryService.getCountries());
  }
}
