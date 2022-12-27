import { Inject, Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { ProductsApiService } from '../services/api.service';
import { DefaultCountryService } from '../services/country.service';


@Injectable()
export class BusinessResolver implements Resolve<any> {
  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private countryService: DefaultCountryService,
    private apiService: ProductsApiService,
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> | any {
    const uuid = state.url.split('business/')[1]?.split('/')[0];

    return this.apiService.getBusiness(uuid).pipe(
      map((data: any) => {
        this.countryService.defaultCountry = data.data.getBusiness.companyAddress.country;
      }),
    );
  }
}
