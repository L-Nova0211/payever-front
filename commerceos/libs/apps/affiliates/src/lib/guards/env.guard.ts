import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';

import { PeAffiliatesEnvService } from '../services';

@Injectable()
export class PeAffiliatesEnvGuard implements CanActivate {
    @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private peAffiliatesEnvService: PeAffiliatesEnvService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.peAffiliatesEnvService.businessData = this.businessData;
    this.peAffiliatesEnvService.businessId = this.businessData._id;
    this.peAffiliatesEnvService.businessName = this.businessData.name;

    return true;
  }
}
