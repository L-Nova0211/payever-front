import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

import { PartnerService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessApiService, BusinessesLoaded } from '@pe/business';
import { PeUser, UserState } from '@pe/user';



@Injectable()
export class BusinessListGuard implements CanActivate {

  @SelectSnapshot(UserState.user) user: PeUser;

  constructor(
    private authService: PeAuthService,
    private api: BusinessApiService,
    private store: Store,
    private router: Router,
    private partnerService: PartnerService,
  ) {
  }

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> {
    if (!this.user.hasUnfinishedBusinessRegistration) {
      const invitationRedirectUrl = route.queryParams.invitationRedirectUrl;
      const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

      return this.api.getBusinessesList('true').pipe(
        switchMap((data) => {
          this.store.dispatch(new BusinessesLoaded(data, true));
          if (!data.total) {
            this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);

            return;
          }
          if (data.businesses.some(x => x.active) && data.total === 1) {
            let business = JSON.parse(localStorage.getItem('pe_active_business')) || data.businesses[0];
            if (!business) {
              return this.api.getactiveBusiness().pipe(
                switchMap((res) => {
                  business = res.businesses[0];

                  this.redirectIntoBusiness(business, invitationRedirectUrl);

                  return of(true);
                })
              )
            }
            this.redirectIntoBusiness(business, invitationRedirectUrl);
          }

          return of(true);
        }), catchError(() => {

          this.router.navigate(['login'], queryParams);

          return of(false);
        })
      );
    }
  }

  redirectIntoBusiness(business, invitationRedirectUrl) {
    const re = /:businessId/g;
    this.partnerService.partnerAfterActions.next({ id: business._id, re });

    const url = `business/${business._id}/info/overview`;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, business._id]);
    } else {
      this.router.navigate([url]);
    }
  }
}
