import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Select } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { SetTokensInterface } from '@pe/auth';
import { PeDestroyService } from '@pe/common';
import { PeUser, UserState } from '@pe/user';

@Component({
  selector: 'social-login',
  template: '',
  providers: [PeDestroyService],
})
export class SocialLoginComponent {
  @Select(UserState.user) user$: Observable<PeUser>;
  tokenRequest: Observable<any>;
  spinnerStrokeWidth = 2;
  spinnerDiameter = 18;

  constructor(
    private activatedRoute: ActivatedRoute,
    private readonly destroy$: PeDestroyService,
  ) {
    this.activatedRoute.queryParams
      .pipe(
        tap(({ accessToken, refreshToken, register, error }) => {
          this.closePopup(of({ accessToken, refreshToken, register, error }));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private closePopup(tokens: Observable<SetTokensInterface>): void {
    try {
      if (window.opener.peClosePopUpOfSocial) {
        window.opener.peClosePopUpOfSocial(tokens);
      }
    } catch (e) {
      window.close();
    }
  }
}
