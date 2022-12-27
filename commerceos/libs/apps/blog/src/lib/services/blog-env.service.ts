import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { EnvService } from '@pe/common';
import { BusinessInterface } from '@pe/common';

@Injectable()
export class BlogEnvService extends EnvService {

  private businessIdStream$ = new BehaviorSubject<string>('');
  businessId$ = this.businessIdStream$.asObservable();

  get businessId(): string {
    return this.businessIdStream$.value;
  }

  set businessId(businessId: string) {
    this.businessIdStream$.next(businessId);
  }

  private applicationIdStream$ = new BehaviorSubject<string>('');

  get applicationId(): string {
    return this.applicationIdStream$.value;
  }

  set applicationId(applicationId: string) {
    this.applicationIdStream$.next(applicationId);
  }

  get businessName(): string {
    return this.businessIdStream$.value;
  }

  set businessName(businessName: string) {
    this.businessIdStream$.next(businessName);
  }

  private businessDataValue: BehaviorSubject<BusinessInterface> = new BehaviorSubject<BusinessInterface>(null);
  get businessData$() {
    return this.businessDataValue;
  }

  get businessData(): BusinessInterface {
    return this.businessDataValue.getValue();
  }

  set businessData(business: BusinessInterface) {
    this.businessDataValue.next(business);
  }

}
