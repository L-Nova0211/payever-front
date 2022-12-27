import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { BusinessInterface, EnvService } from '@pe/common';

export interface DefaultBusinessInterface extends BusinessInterface {
  companyAddress: any;
}
@Injectable()
export class DefaultCountryService {
  constructor(private envService: EnvService) {
  }
  private countryStream$ = new BehaviorSubject<string>(null);
  private defaultCountryStream$ = new BehaviorSubject<string>(null);

  country$ = this.countryStream$.asObservable();
  defaultCountry$ = this.defaultCountryStream$.asObservable();

  get country(): string {
    return this.countryStream$.value;
  }

  set country(value: string) {
    this.countryStream$.next(value);
  }

  get defaultCountry() {
    return this.defaultCountryStream$.value;
  }

  set defaultCountry(value: string) {
    this.defaultCountryStream$.next(value);
  }
}
