import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';

import { PeSubscriptionsEnvService } from '../services';

@Injectable()
export class PeSubscriptionsEnvGuard implements CanActivate {
   @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private peSubscriptionsEnvService: PeSubscriptionsEnvService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.peSubscriptionsEnvService.businessData = this.businessData;
    this.peSubscriptionsEnvService.businessId = this.businessData._id;
    this.peSubscriptionsEnvService.businessName = this.businessData.name;
    
    return true;
  }
}
