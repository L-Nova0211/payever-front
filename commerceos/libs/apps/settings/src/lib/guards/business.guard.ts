import { Injectable } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivate,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, mapTo, tap } from 'rxjs/operators';

import { BusinessState } from '@pe/business';
import { PeUser, UserState } from '@pe/user';

import { settingsBusinessIdRouteParam } from '../misc/constants';
import { OwnerTypesEnum } from '../misc/enum';
import { BusinessInterface } from '../misc/interfaces';
import { BusinessEnvService } from '../services';
import { SettingsRootRoutesEnum } from '../settings-root-routes.enum';

@Injectable()
export class PebBusinessGuard implements CanActivate {
  @Select(UserState.user) user$: Observable<PeUser>;
  @Select(BusinessState.businessData) businessData$: Observable<BusinessInterface>;

  constructor(
    private envService: BusinessEnvService,
  ) { }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const firstSegment = state.url.split('/')[1] || route.url[0]?.path;

    if (firstSegment && firstSegment === SettingsRootRoutesEnum.Personal) {
      return this.user$.pipe(
        tap((user) => {
          this.envService.userAccount = user;
          this.envService.userUuid = user._id;
          this.envService.ownerType = OwnerTypesEnum.Personal;
        }),
        mapTo(true),
        catchError(() => of(false)),
      );
    } else {
      const businessId = route.params[settingsBusinessIdRouteParam]
        || this.envService.businessId
        || route.parent.params['slug'];

      if (!businessId || businessId === 'undefined') {
        return false;
      }

      return this.businessData$.pipe(
        tap((business) => {
          this.envService.businessData = business;
          this.envService.businessUuid = business._id;
          this.envService.ownerType = OwnerTypesEnum.Business;
        }),
        mapTo(true),
        catchError(() => of(false)),
      );
    }
  }

}
