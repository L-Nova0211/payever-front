import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, Resolve, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

import { EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import { PebShippingSettingsService } from '../services/shipping-settings.service';


@Injectable()
export class ProfileResolver implements Resolve<any> {
  constructor(
    private api: PebShippingSettingsService,
    private router: Router,
    private envService: EnvService,
    private snackBarService: SnackbarService,
    private translateService: TranslateService,
  ) {
  }

  resolve(route: ActivatedRouteSnapshot): Observable<any> {
    const profileId: string = route.params.profileId;
    if (profileId) {
      return this.api.getProfile(profileId).pipe(
        tap((profile) => {
          if (!profile) {
            this.navigateToList();
          }
        }),
        catchError((error: HttpErrorResponse) => {
          console.error('RESOLVE PROFILE / ERROR', error);
          this.navigateToList();

          return [null];
        }),
      );
    } else {
      return of(null);
    }
  }

  private navigateToList(): void {
    const url: string[] = ['business', this.envService.businessId, 'shipping', 'profiles'];
    this.router.navigate(url, { queryParams: { addExisting: true }, queryParamsHandling: 'merge' });
  }
}