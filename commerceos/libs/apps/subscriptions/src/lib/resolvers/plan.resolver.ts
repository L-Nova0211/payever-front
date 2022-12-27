import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';

import { PeSubscriptionsApiService } from '../services';

@Injectable()
export class PeSubscriptionsPlanResolver implements Resolve<any> {
  constructor(
    private router: Router,

    private envService: EnvService,
    private peSubscriptionsApiService: PeSubscriptionsApiService,
  ) { }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const planId: string = route.params.planId;

    return planId
      ? this.peSubscriptionsApiService
          .getPlan(planId)
          .pipe(
            tap(plan => {
              !plan && this.navigateToList();
            }),
            catchError((error: HttpErrorResponse) => {
              console.error('RESOLVE SUBSCRIPTIONS / ERROR', error);
              this.navigateToList();

              return [null];
            }))
      : of(null);
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'subscriptions'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}
