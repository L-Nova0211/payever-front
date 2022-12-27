import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve } from '@angular/router';
import { Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { VatRateInterface } from '../../shared/interfaces/section.interface';
import { VatRatesApiService } from '../services';

import { ProductResolver } from './product.resolver';
import { DefaultCountryService } from '../../shared/services/country.service';

export const DEFAULT_VAT_RATE: VatRateInterface = {
  description: 'Default taxes apply',
  rate: 0,
};

@Injectable()
export class VatRatesResolver implements Resolve<any[]> {
  constructor(
    private vatRatesService: VatRatesApiService,
    private countryService: DefaultCountryService,
    private readonly productResolver: ProductResolver
  ) {}

  resolve(route: ActivatedRouteSnapshot): Observable<VatRateInterface[]> {
    return this.productResolver.resolve(route).pipe(
      switchMap((product) => {
        return this.vatRatesService.getVatRates(product?.data.product.country || this.countryService.defaultCountry).pipe(
          map((rates: VatRateInterface[]) => {
            if (rates.length === 0) {
              return [DEFAULT_VAT_RATE];
            }

            return rates;
          }),
        );
      })
    )
  }
}
