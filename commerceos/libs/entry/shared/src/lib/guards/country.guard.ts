import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateChild, Router, RouterStateSnapshot } from '@angular/router';
import { countries } from 'countries-list';
import { Observable } from 'rxjs';

@Injectable()
export class CountryGuard implements CanActivateChild {

  private activationFn = (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
    if (countries[route.params.country.toUpperCase()]) {
      return true;
    }
    this.router.navigate([state.url.split('/').slice(0, -1).join('/')]);

    return false;
  }

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.activationFn(route, state);
  }

  canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | boolean {
    return this.activationFn(route, state);
  }
}
