import { Injectable } from '@angular/core';
import { BehaviorSubject, of } from 'rxjs';

import { EnvService } from '@pe/common';

import { OwnerTypesEnum } from '../misc/enum';
import { BusinessInterface } from '../misc/interfaces';

@Injectable()
export class BusinessEnvService extends EnvService {
  private _businessId: string;

  protected businessUuidStorage$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  set businessUuid(value: string) {
    this.businessUuidStorage$.next(value);
  }

  get businessUuid(): string {
    return this.businessUuidStorage$.getValue();
  }

  private businessDataValue: BehaviorSubject<BusinessInterface> = new BehaviorSubject<BusinessInterface>(null);

  get businessId$() {
    return of(this._businessId);
  }

  get businessId() {
    return this._businessId || this.businessUuid;
  }

  set businessId(value: string) {
    this._businessId = value;
  }

  get businessData$() {
    return this.businessDataValue;
  }

  get businessData(): BusinessInterface {
    return this.businessDataValue.getValue();
  }

  set businessData(business: BusinessInterface) {
    this.businessDataValue.next(business);
  }

  protected userAccount$: BehaviorSubject<Object> = new BehaviorSubject<Object>({});

  set userAccount(value: any) {
    this.userAccount$.next(value);
  }

  get userAccount(): any {
    return this.userAccount$.getValue();
  }

  protected userUuidStorage$: BehaviorSubject<string> = new BehaviorSubject<string>('');

  set userUuid(value: string) {
    this.userUuidStorage$.next(value);
  }

  get userUuid(): string {
    return this.userUuidStorage$.getValue();
  }

  protected ownerTypeStorage$: BehaviorSubject<OwnerTypesEnum> = new BehaviorSubject<OwnerTypesEnum>(null);

  set ownerType(value: OwnerTypesEnum) {
    this.ownerTypeStorage$.next(value);
  }

  get ownerType(): OwnerTypesEnum {
    return this.ownerTypeStorage$.getValue();
  }
}
