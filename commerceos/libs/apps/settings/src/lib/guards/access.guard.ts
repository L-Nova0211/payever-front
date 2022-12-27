import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { mapTo, tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { BusinessState, SettingsBusinessInterface } from '@pe/business';
import { EnvService } from '@pe/common';

import { ApiService } from '../services';

@Injectable()
export class SettingsAccessGuard implements CanActivate {
  @SelectSnapshot(BusinessState.businessData) businessData: SettingsBusinessInterface;

  constructor(
    private envService: EnvService,
    private cosEnvService: CosEnvService,
    private settingsApiService: ApiService,
    private router: Router,
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | boolean {
    const id = state.url.split('/')[2] || route.url[1]?.path;
    const innerPath = state.url.split('/')[4] || route.url[3]?.path;

    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;

    return this.cosEnvService.isPersonalMode
      ? of(true).pipe(tap(
        () => !innerPath && this.router.navigate([`personal/${id}/settings/general/personal`])
      ))
      : this.settingsApiService.checkAccess(this.envService.businessId).pipe(
        tap(() => !innerPath && this.router.navigate([`business/${id}/settings/info`])),
        mapTo(true),
      );
  }
}
