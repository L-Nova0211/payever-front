import { Component, OnInit, SecurityContext } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';

import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';

@Component({
  selector: 'login-refresh-layout',
  templateUrl: './login-refresh-layout.component.html',
})
export class LoginRefreshLayoutComponent implements OnInit {
  public activeBusiness: BusinessInterface;
  public email: string;
  public returnUrl: string;
  private filterUrlRegexp = /^http(s)?\:\/\/([^\/?#]+)(?:[\/?#]|$)/i;
  private allowedDomain = true;

  constructor(
    private activatedRoute: ActivatedRoute,
    private authService: PeAuthService,
    private router: Router,
    private route: ActivatedRoute,
    private sanitizer: DomSanitizer,
  ) {}

  onSuccessLogin(): void {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const businessId = this.authService.refreshLoginData.activeBusiness._id;
    if (this.returnUrl) {
      if (this.allowedDomain) {
        window.location.replace(this.returnUrl);
      } else if (!this.filterUrlRegexp.test(this.returnUrl)) {
        this.router.navigateByUrl(this.returnUrl);
      }
    } else if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, businessId]);
    } else {
      this.router.navigate([`business/${businessId}/info/overview`]);
    }
  }

  ngOnInit() {
    this.returnUrl = this.sanitizer.sanitize(
      SecurityContext.URL,
      this.activatedRoute.snapshot.queryParams['returnUrl'],
    );
    const { activeBusiness, email } = this.authService.refreshLoginData;
    const matchesHttp = this.filterUrlRegexp.test(this.returnUrl);
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

    this.allowedDomain = this.authService.isPayeverDomain(this.returnUrl);

    if (matchesHttp && !this.allowedDomain) {
      this.router.navigate(['login'], queryParams);
    }

    if (activeBusiness && email) {
      this.activeBusiness = activeBusiness;
      this.email = email;
    } else {
      this.router.navigate(['login'], queryParams);
    }
  }

  onSecondFactorCode(): void {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } }
      : { queryParams: { returnUrl: this.returnUrl } };
    this.router.navigate(['second-factor-code'], queryParams);
  }
}
