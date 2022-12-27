

import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';
import { PeMessageEnvService } from '@pe/message';


@Injectable()
export class MessageEnvGuard implements CanActivate {
    @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private envService: PeMessageEnvService,

  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    return true
  }
}
