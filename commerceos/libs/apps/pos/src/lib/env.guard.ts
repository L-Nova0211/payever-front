import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';

import { PosEnvService } from './services';


@Injectable()
export class PosEnvGuard implements CanActivate {
    @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private envService: PosEnvService,

  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;
    this.envService.businessName = this.businessData.name;

    return true
  }
}
