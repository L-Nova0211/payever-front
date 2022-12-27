import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';

@Injectable({
  providedIn: 'platform',
})
export class PebEnvironmentService extends EnvService {
  @SelectSnapshot(BusinessState.businessData) business: BusinessInterface;


  constructor() {
    super()
  }

  businessData$;
  businessId$;
  get businessId(): string {
    return this.business._id;
  }

  get businessData() {
    const businessData = this.business;

    return businessData as any;
  }

}
