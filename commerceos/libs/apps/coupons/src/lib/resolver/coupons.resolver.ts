import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { PeCouponsApiService } from '../services'

@Injectable()
export class CouponsResolver implements Resolve<any> {
  constructor(
    private api: PeCouponsApiService,
    private router: Router,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const couponId: string = route.params.couponId;
    if (couponId) {
      return this.api.getCoupon(couponId).pipe(
        tap((coupon) => {
          if (!coupon) {
            this.navigateToList();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE COUPON / ERROR', error);
          this.navigateToList();

          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'coupon'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}