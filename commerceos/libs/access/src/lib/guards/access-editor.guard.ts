import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable, of, throwError } from 'rxjs';

import { PebEditorAuthTokenService } from '@pe/builder-api';
import { PebEnvService } from '@pe/builder-core';
import { PeAuthService } from '@pe/auth';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { AclOptionEnum, EmployeeStatusEnum, PeAccessApiService } from '../services/api.service';
import { PeAccessService } from '../services/access.service';

@Injectable()
export class PeAccessEditorGuard implements CanActivate {

  constructor(
    private pebEnvService: PebEnvService,
    private pebEditorAuthTokenService: PebEditorAuthTokenService,
    private router: Router,
    private authService: PeAuthService,
    private accessService: PeAccessService,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (!route.paramMap.has('businessId') || !route.paramMap.has('applicationId') || !route.parent?.paramMap.has('access')) {
      this.router.navigate(['/']);

      return false;
    }

    const businessId = route.paramMap.get('businessId');
    const applicationId = route.paramMap.get('applicationId');
    const user = this.authService.getUserData();
    const appType = route.data?.appType;
    this.pebEditorAuthTokenService.access = route.parent.paramMap.get('access');

    this.pebEnvService.businessId = route.paramMap.get('businessId');
    this.pebEnvService.applicationId = route.paramMap.get('applicationId');

    if (businessId && applicationId && user?.uuid) {
      return this.accessService.createEmployeeAndNavigate(user.uuid, appType, businessId, applicationId).pipe(
        map(() => false),
        catchError(() => of(true)),
      );
    }

    return true;
  }
}
