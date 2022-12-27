import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, ReplaySubject, Subject, throwError } from 'rxjs';
import { mergeMap, catchError, takeUntil, tap, filter } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { entryLogo } from '@pe/base';
import { PeDestroyService } from '@pe/common';
import { LoginFormService } from '@pe/entry/login';
import { TranslateService } from '@pe/i18n';
import { AccountType, CreatePersonalFormEvent, CreatePersonalFormEventType } from '@pe/personal-form';
import { RegistrationService } from '@pe/shared/registration';

enum ModeEnum {
  loading = 1,
  login = 2,
  register = 3,
  none = 4
}

@Component({
  selector: 'entry-verification',
  templateUrl: './verification.component.html',
  styleUrls: ['./verification.component.scss'],
})
export class VerificationComponent implements OnInit, OnDestroy {
  entryLogo = entryLogo;

  termsLink: string;
  privacyLink: string;

  readonly errorBag$ = new Subject<any>();

  public mode$: BehaviorSubject<ModeEnum> = new BehaviorSubject<ModeEnum>(ModeEnum.loading);

  public email: string;
  public errorText: string = null;
  public isLoading = true;
  public userData;
  public businessData: any;
  public readonly ModeEnum = ModeEnum;

  private token: string;
  private tokenData;

  protected destroyed$ = new ReplaySubject<boolean>();

  constructor(
    private activatedRoute: ActivatedRoute,
    private apiService: ApiService,
    private router: Router,
    private loginFormService: LoginFormService,
    private destroy$: PeDestroyService,
    private registrationService: RegistrationService,
    private authService: PeAuthService,
    private translateService: TranslateService
  ) {
  }

  ngOnInit() {
    const snapshot = this.activatedRoute.snapshot;

    this.token = snapshot.queryParamMap.get('token') || '';
    this.email = snapshot.queryParamMap.get('email') || '';

    try {
      this.tokenData = JSON.parse(atob(this.token.split('.')[1]));
    } catch (e) {
      this.router.navigate(['login']);

      return;
    }

    this.apiService.verifyEmployee(this.token).pipe(
      mergeMap(() => this.apiService.inviteDataEmployee(this.tokenData.businessId, this.tokenData.id).pipe(
        tap(({ isRegistered, isVerifiedToBusiness }) => {
          this.isLoading = false;
          if (isVerifiedToBusiness && isRegistered) {
            this.router.navigate(['login']);

            return;
          }
          this.mode$.next(isRegistered ? ModeEnum.login : ModeEnum.register);
        }),
        catchError((error) => {
          this.errorText = error.error && error.error.message
            ? error.error.message
            : this.translateService.translate('forms.error.unknown_error');
          this.mode$.next(ModeEnum.none);

          return throwError(error);
        })
      )),
      catchError((err) => {
        this.errorText = this.translateService.translate('forms.error.token_expired');
        this.mode$.next(ModeEnum.none);

        return throwError(err);
      })
    ).subscribe();



    this.loginFormService.addAfterLoginActions(() => {
      if (!this.destroy$.isStopped) {
        this.apiService.confirmBusinessForEmployee(this.tokenData.businessId, this.tokenData.id).pipe(
          takeUntil(this.destroyed$)
        ).subscribe(); // TODO Add error handler
      }
    });
  }

  onSuccessLogin() {
    this.loginFormService.executeAfterLoginActions();
    this.router.navigate([`business/${this.tokenData.businessId}/info/overview`]);
  }

  onSecondFactorCode(): void {
    const queryParams = { queryParams: { returnUrl: `business/${this.tokenData.businessId}/info/overview` } };
    this.router.navigate(['second-factor-code'], queryParams);
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onFormEvent(e: CreatePersonalFormEvent): void {
    switch (e.event) {
      case CreatePersonalFormEventType.EmployeeIsCreated:
        this.router.navigate([`business/${e.data?.businessId}/info/overview`]);
        break;
      case CreatePersonalFormEventType.UserIsCreated:
        if (e.data === AccountType.personal) {
          this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
        } else {
          this.registrationService.registrationStep$.next(2);
        }
        break;
      case CreatePersonalFormEventType.NavigateToLogin:
        this.router.navigate(['/login']);
        break;
    }
  }
}
