import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, Router, ActivatedRoute } from '@angular/router';
import { Observable, of } from 'rxjs';

interface ParsedDataInterface {
  businessUuid: string;
  integrationName: string;
  integrationCategory: string;
}

@Injectable()
export class OAuthRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private route: ActivatedRoute
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const routeQueryParams = route.queryParams;
    const stateParams = routeQueryParams['state'];

    if (stateParams) {
      const parsedState: ParsedDataInterface = this.parseStateParams(stateParams);
      const businessUuid: string = parsedState.businessUuid;
      const integrationName: string = parsedState.integrationName;
      const integrationCategory: string = parsedState.integrationCategory;

      const newQueryParams = Object.assign({}, routeQueryParams, { state: null });

      this.router.navigate([`business/${businessUuid}/connect/${integrationCategory}/configure/${integrationName}`], {
        queryParams: {
          ...newQueryParams,
        },
      }).then((x) => {
        location.reload(); // TODO: investigate further why routing broken after redirect from external auth
      });
    } else {
      const businessUuid: string = route.params.businessUuid ?? route.parent.params.businessUuid;
      const integration: string = route.params.name;
      const integrationCategory: string = route.params.category;

      this.router.navigate([
      `business/${businessUuid}/connect/`], { queryParams: { integration, integrationCategory } });
    }

    return of(false);
  }

  private parseStateParams(params: string): ParsedDataInterface {
    try {
      const state = decodeURIComponent(window.atob(params));
      const stateJson = JSON.parse(state);

      return {
        businessUuid: stateJson.businessUuid,
        integrationName: stateJson.integrationName,
        integrationCategory: stateJson.integrationCategory,
      };
    } catch (e) {
      return null; // TODO Better to throw exception or show some error to user
    }
  }
}
