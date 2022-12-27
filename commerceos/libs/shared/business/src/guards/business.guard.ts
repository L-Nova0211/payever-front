import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Actions, ofActionSuccessful, Select, Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { first, map, mergeMap, switchMap, tap, withLatestFrom } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import {
  BusinessState,
  BusinessInterface,
  BusinessDataLoaded,
  LoadBusinessData,
  BusinessApiService,
} from '@pe/business';
import { ResetDockerItems } from '@pe/docker';

@Injectable()
export class BusinessGuard implements CanActivate {
  @Select(BusinessState.businessData) businessData$: Observable<BusinessInterface>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  constructor(
    private store: Store,
    private actions$: Actions,
    private envService: CosEnvService,
    private authService: PeAuthService,
    private businessApiService: BusinessApiService,
  ) { }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    const slug = route.params.slug || route.parent.params.slug;

    return this.enable(slug).pipe(
      mergeMap(() => {
        this.envService.isPersonalMode = false;
        this.store.dispatch(new ResetDockerItems());

        if (slug === this.businessData._id) {
          //@TODO remove when new settings app will be ready
          localStorage.setItem('pe_opened_business', JSON.stringify(this.businessData));

          return of(true);
        }
        this.store.dispatch(new LoadBusinessData(slug));

        return this.actions$.pipe(
          ofActionSuccessful(BusinessDataLoaded),
          withLatestFrom(this.businessData$),
          first(),
          tap(([_, business]) => {
            this.envService.isPersonalMode = false;
            //@TODO remove when new settings app will be ready
            localStorage.setItem('pe_opened_business', JSON.stringify(business));

          }),
          map(() => true),
        );
      }),
    );
  }

   enable(businessId: string): Observable<any>{
    return this.businessApiService.enableBusiness(businessId).pipe(
      switchMap((res) => this.authService.setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      })),
    );
  }
}
