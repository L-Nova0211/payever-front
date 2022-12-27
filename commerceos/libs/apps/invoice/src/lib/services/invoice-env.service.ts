import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

import { EnvService, BusinessInterface } from '@pe/common';


Injectable()
export class InvoiceEnvService extends EnvService {
  businessId: string;
  businessData: BusinessInterface;
  invoiceId: string;
  applicationId: string;
  shopId: string;
  themeId:string;
  businessName: string;
  businessId$: Observable<string>;
  businessData$: Observable<BusinessInterface>
  private businessUuidStream$ = new BehaviorSubject<string>(null);
  private businessStream$ = new BehaviorSubject<BusinessInterface>(null);
  private countryStream$ = new BehaviorSubject<string>(null);
  private currencyStream$ = new BehaviorSubject<string>(null);

  businessUuid$ = this.businessUuidStream$.asObservable();
  country$ = this.countryStream$.asObservable();
  currency$ = this.currencyStream$.asObservable();

  get businessUuid(): string {

    return this.businessUuidStream$.value;
  }

  set businessUuid(uuid: string) {
    this.businessUuidStream$.next(uuid);
  }
}
