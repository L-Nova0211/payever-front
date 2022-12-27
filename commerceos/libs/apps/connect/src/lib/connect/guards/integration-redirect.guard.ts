import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router } from '@angular/router';
import { Observable, of } from 'rxjs';

@Injectable()
export class IntegrationRedirectGuard implements CanActivate {
  constructor(private router: Router) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const businessUuid: string = this.router.url.split('/')[2];
    const integration: string = route.params.name;
    const integrationCategory: string = route.params.category;
    let modalType: string = route.url[3]?.path;

    if (route.url[0]?.path === 'welcome') {
      modalType = 'welcome';
    }

    this.router.navigate([
    `business/${businessUuid}/connect/`], { queryParams: { integration, integrationCategory, modalType } });

    return of(false);
  }
}
