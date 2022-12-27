import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router, RouterStateSnapshot } from '@angular/router';
import { EMPTY, Observable } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { PartnerService } from '@pe/api';

@Injectable({ providedIn: 'root' })
export class PartnerResolver implements Resolve<any> {

  constructor(
    private router: Router,
    private partnerService: PartnerService,
  ) { }

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<any> {
    const { app, country, fragment, industry } = route.params;

    return this.partnerService.getPartnerData({ app, country, fragment, industry }).pipe(
      tap((data) => {
        localStorage.removeItem('pe-partners-data');
        localStorage.setItem('pe-partners-data', JSON.stringify(data));
      }),
      catchError(() => {
        this.router.navigate([state.url.split('/').slice(0, -1).join('/')]);

        return EMPTY;
      }),
    );
  }
}
