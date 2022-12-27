import { Injectable, Inject } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { EnvService } from '@pe/common';

import { BlogEnvService } from './services/blog-env.service';


@Injectable()
export class BlogEnvGuard implements CanActivate {
    @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    @Inject(EnvService) private envService: BlogEnvService,

  ) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;

    return true
  }
}
