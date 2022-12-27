import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessState } from '@pe/business';

@Injectable()
export class PeMessageEnvService {
  @SelectSnapshot(BusinessState.businessData) business;

  constructor(
    protected router: Router,
  ) {}

  _businessId: string;

  set businessId(id: string) {
    this._businessId = id;
  }

  get businessId(): string {
    return this._businessId ?? this.business?._id;
  }

  get businessData(): any {
    return this.business;
  }

  get shopId(): string {
    return this.business._id;
  }

  get businessName(): string {
    return this.business.name;
  }

  get applicationId(): string {
    return this.business._id;
  }
}
