import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, RouterStateSnapshot, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';

import { PeAuthService } from '@pe/auth';

import { PeMessageService } from '../services';

@Injectable({
  providedIn: 'root',
})
export class AdminGuard implements CanActivate {

  constructor(
    private peAuthService: PeAuthService,
    private peMessageService: PeMessageService,
  ) {
  }

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    return this.peMessageService.isLiveChat ? false : this.peAuthService.isAdmin();
  }
}
