import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { LoaderService } from '@pe/base';
import { BusinessApiService, BusinessesLoaded } from '@pe/business';
import { WindowService } from '@pe/window';

@Component({
  selector: 'login-as-user-layout',
  templateUrl: './login-as-user-layout.component.html',
  styleUrls: [
    './login-as-user-layout.component.scss',
    '../../../../shared/src/lib/components/layout/layout.component.scss',
  ],
})
export class LoginAsUserLayoutComponent implements OnInit {
  isByEmail: boolean;
  city: string;
  email: string;
  name: string;
  logo: string;
  firstName: string;
  lastName: string;
  id: string;

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(
    take(1),
    filter(isMobile => !!isMobile),
  );

  constructor(
    private api: BusinessApiService,
    private authService: PeAuthService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private route: ActivatedRoute,
    private loaderService: LoaderService,
    private store: Store,
    private windowService: WindowService,
  ) {}

  ngOnInit() {
    this.isByEmail = this.activatedRoute.snapshot.queryParams['isByEmail'];
    this.name = this.activatedRoute.snapshot.queryParams['name'];
    this.city = this.activatedRoute.snapshot.queryParams['city'];
    this.email = this.activatedRoute.snapshot.queryParams['email'];
    this.logo = this.activatedRoute.snapshot.queryParams['logo'];
    this.firstName = this.activatedRoute.snapshot.queryParams['firstName'];
    this.lastName = this.activatedRoute.snapshot.queryParams['lastName'];
    this.name = this.activatedRoute.snapshot.queryParams['name'];
    this.id = this.activatedRoute.snapshot.queryParams['id'];
    this.loaderService.hideLoader();
  }

  onSuccessLogin(): void {
    this.authService.setToken(this.activatedRoute.snapshot.queryParams['accessToken']).pipe(
      take(1),
      switchMap(() => {
        if (this.isByEmail) {
          this.router.navigate([`business/${this.id}/info/overview`]);

          return of(true);
        } else {
          const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
          const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

          return this.api.getBusinessesList('true').pipe(
            switchMap((data) => {
              this.store.dispatch(new BusinessesLoaded(data, true));
              if (!data.total) {
                this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);

                return of(true);
              }
              if (data.businesses.some(x => x.active)) {
                if (data.total === 1) {
                  let business = JSON.parse(localStorage.getItem('pe_active_business')) || data.businesses[0];
                  if (!business) {
                    return this.api.getactiveBusiness().pipe(
                      switchMap((res) => {
                        business = res.businesses[0];

                        this.router.navigate([`business/${business._id}/info/overview`], queryParams);


                        return of(true);
                      })
                    );
                  }

                  this.router.navigate([`business/${business._id}/info/overview`], queryParams);
                } else {
                  this.router.navigate([`switcher`], queryParams);
                }
              } else if (data.businesses.length >= 1) {
                this.router.navigate([`switcher`], queryParams);
              }

              return of(true);
            }), catchError(() => {

              this.router.navigate(['login'], queryParams);

              return of(false);
            })
          );
        }
      })
    ).subscribe();
    this.authService.setRefreshToken(this.activatedRoute.snapshot.queryParams['refreshToken']).subscribe();
  }

  onBack(): void {
    window.history.back();
  }
}
