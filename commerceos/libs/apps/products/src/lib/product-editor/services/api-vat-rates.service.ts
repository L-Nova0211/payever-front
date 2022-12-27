import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { VatRateInterface } from '../../shared/interfaces/section.interface';

@Injectable()
export class VatRatesApiService {

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private http: HttpClient,
  ) { }

  getVatRates(country: string): Observable<VatRateInterface[]> {
    const url = `${this.env.backend.common}/api/tax/list/${country}`;

    return this.http.get<any[]>(url);
  }
}
