import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';

import { PeAppointmentsEnvService } from '../services';

@Injectable()
export class PeAppointmentsEnvGuard implements CanActivate {
    @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private peAppointmentsEnvService: PeAppointmentsEnvService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.peAppointmentsEnvService.businessData = this.businessData;
    this.peAppointmentsEnvService.businessId = this.businessData._id;
    this.peAppointmentsEnvService.businessName = this.businessData.name;

    return true;
  }
}
