import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanActivateChild, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { PeMessageGuardService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class RolesGuard implements CanActivate, CanActivateChild {

  constructor(
    private peMessageGuardService: PeMessageGuardService,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = route.data?.allowedRoles;

    if (allowedRoles) {
      return this.peMessageGuardService.isAllowByRoles(allowedRoles);
    }

    return false;
  }

  canActivateChild(
    childRoute: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    const allowedRoles = childRoute.data?.allowedRoles;
    if (allowedRoles) {
      return this.peMessageGuardService.isAllowByRoles(allowedRoles);
    }

    return false;
  }
}
