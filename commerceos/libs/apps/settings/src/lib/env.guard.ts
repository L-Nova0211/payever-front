import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessState, SettingsBusinessInterface } from '@pe/business';
import { EnvService } from '@pe/common';

import { BusinessEnvService } from './services/env.service';


@Injectable()
export class SettingsEnvGuard implements CanActivate {
  @SelectSnapshot(BusinessState.businessData) businessData: SettingsBusinessInterface;

  constructor(
    @Inject(EnvService) private envService: BusinessEnvService,

  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;

    return true;
  }
}
