import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, CanDeactivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

import { appsShownWithoutRedirect } from '@pe/base';
import { DashboardDataService } from '@pe/base-dashboard';

import { BusinessDashboardLayoutComponent } from './dashboard-layout/dashboard-layout.component';
import { ngxZendeskWebwidgetService } from './ngx-zendesk-webwidget';

@Injectable()
export class ZendeskGuard implements CanActivate, CanDeactivate<BusinessDashboardLayoutComponent> {
  constructor(
    private _ngxZendeskWebwidgetService: ngxZendeskWebwidgetService,
    private dashboardDataService: DashboardDataService,
    private router: Router,
  ) {}

  isRouteAllowed(route: string, appNames: string[]): boolean {
    const parsed1 = /\/business\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([0-9a-z]{1,50})$/g.exec(
      route,
    );
    const appName1 = parsed1 && parsed1[1] ? parsed1[1] : null;

    const parsed2 = /\/business\/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}\/([0-9a-z]{1,50})\/.*$/g.exec(
      route,
    );
    const appName2 = parsed2 && parsed2[1] ? parsed2[1] : null;

    const appName = appName1 || appName2;

    return !(appName && appNames.indexOf(appName) >= 0);
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const url = String(this.router.url);

    return this.dashboardDataService.apps$.pipe(
      take(1),
      map((apps) => {
        if (this.isRouteAllowed(url, apps ? apps.map(a => a['code']) : appsShownWithoutRedirect)) {
          this._ngxZendeskWebwidgetService.setLocale(localStorage.getItem('pe_current_locale'));
          this._ngxZendeskWebwidgetService.show();
        }

        return true;
      }),
    );
  }

  canDeactivate(
    component: BusinessDashboardLayoutComponent,
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot,
  ): Observable<boolean> | Promise<boolean> | boolean {
    this._ngxZendeskWebwidgetService.hide();

    return true;
  }
}
