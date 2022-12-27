import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef, Compiler,
  Component,
  EventEmitter,
  Inject, Injector,
  Input,
  NgZone,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, from, interval, Observable, of, zip } from 'rxjs';
import {
  catchError,
  delay,
  filter,
  flatMap,
  map, mergeMap,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService, SetTokensInterface } from '@pe/auth';
import { EnvironmentConfigInterface, PeDestroyService, PE_ENV } from '@pe/common';
import { EMAIL_VALIDATOR } from '@pe/forms-core';
import { retrieveLocale, TranslateService, TranslationLoaderService } from '@pe/i18n';
import { loadEncryptionModule } from '@pe/shared/utils';
import { SnackbarService } from '@pe/snackbar';
import { LoadUser, PeUser, UserState } from '@pe/user';

import { AccountType, LoginErrorReasons } from '../enums';
import { LoginFormService } from '../login-form.service';

const BLOCK_EMAL_REASONS = [
  LoginErrorReasons.PermanentBan,
  LoginErrorReasons.ThreeHoursBan,
  LoginErrorReasons.TwentyMinutesBan,
  LoginErrorReasons.WrongPassword,
  LoginErrorReasons.EmailLoginBan,
  LoginErrorReasons.EmailRegisterBan,
];

const CAPTCHA_REASONS = [
  LoginErrorReasons.DisplayCaptcha,
  LoginErrorReasons.NoCaptcha,
];

interface LoginErrorsInterface {
  raw?: {
    reason: LoginErrorReasons;
    message?: LoginErrorReasons;
  },
  message?: string;
  errorBag?: {[key: string]: any};
}

@Component({
  selector: 'entry-login',
  templateUrl: './entry-login.component.html',
  styleUrls: ['./entry-login.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class EntryLoginComponent implements OnChanges, OnInit {
  spinnerStrokeWidth = 2;
  spinnerDiameter = 18;
  @Input() withoutCreds: boolean;
  @Input() withoutRegister: boolean;
  @Input() username: string;
  @Input() withoutForgot: boolean;
  @Input() disableSocialLogin: boolean;
  @Input() disableSignUp: boolean;
  @Input() displayLoginWithEmail = true;
  @Input() employee: boolean;

  @Output() onSuccessLogin: EventEmitter<void> = new EventEmitter<void>();
  @Output() onSecondFactorCode: EventEmitter<void> = new EventEmitter<void>();
  @Output() onRegister = new EventEmitter<void>();

  @Select(UserState.user) user$: Observable<PeUser>;

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  loader = false;
  errorMessage = '';
  allowValidation = false;
  panelState: any;
  displayLogin = false;
  facebookUrl = '';
  googleUrl = '';

  formTranslationsScope = 'forms.login';

  errors = {
    email: {
      hasError: false,
      errorMessage: '',
    },
    plainPassword: {
      hasError: false,
      errorMessage: '',
    },
  };

  googleLoading = false;
  facebookLoading = false;

  form: FormGroup;

  constructor(
    private authService: PeAuthService,
    private translateService: TranslateService,
    private snackbarService: SnackbarService,
    private translationLoaderService: TranslationLoaderService,
    private router: Router,
    private route: ActivatedRoute,
    private store: Store,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private loginFormService: LoginFormService,
    private apiService: ApiService,
    private compiler: Compiler,
    private injector: Injector,
    private zone: NgZone,
    @Inject(DOCUMENT) private document: Document,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private readonly destroy$: PeDestroyService,
  ) {
    this.form = this.formBuilder.group({
      email: [this.username || '', [this.emailValidator, Validators.required]],
      plainPassword: ['', [Validators.required, Validators.minLength(8)]],
    });

    this.form.valueChanges
      .pipe(
        tap((data) => {
          this.allowValidation &&  this.checkErrors();
        }),
        takeUntil(this.destroy$))
      .subscribe();

    this.facebookUrl = `${this.env.backend.auth}/api/social/facebook/login`;
    this.googleUrl = `${this.env.backend.auth}/api/social/google/login`;
  }

  redirectGoogleUrl() {
    this.googleLoading = true;
    this.openPopup(this.googleUrl);
  }

  redirectFacebookUrl() {
    this.facebookLoading = true;
    this.openPopup(this.facebookUrl);
  }

  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    return !EMAIL_VALIDATOR(control.value) ? { email: true } : null;
  }

  private openPopup(url: string): void {
    (window as any).peClosePopUpOfSocial = (token$: Observable<SetTokensInterface>) => {
      if (popupWindow) {
        popupWindow.close();
        popupWindow = null;
      }

      token$
        .pipe(
          switchMap((data) => {
            const { accessToken, refreshToken, error } = data;

            if (!accessToken && refreshToken) {
              this.router.navigate([`/second-factor-code`]);

              return of();
            }

            if (error || !accessToken || !refreshToken) {
              const errorMsg = `forms.login.error_reasons.${error ? error : 'UNEXPECTED_ERROR'}`;
              this.zone.run(() => {
                this.snackbarService.toggle(true, {
                  content: this.translateService.translate(errorMsg),
                  duration: 3500,
                  iconColor: 'red',
                  iconId: 'icon-alert-24',
                  iconSize: 24,
                });
              });
              this.googleLoading = false;
              this.facebookLoading = false;
              this.cdr.detectChanges();
            }

            if (!accessToken) {
              return of();
            }

            return zip(
              of(data),
              this.authService.setTokens({ accessToken, refreshToken }),
            );
          }),
          switchMap(([{ register }]) => {
            const personalPath = `/personal/${this.authService.getUserData().uuid}/info/overview`;

            if (register === true) {
              return this.apiService
                .createUserAccount({
                  hasUnfinishedBusinessRegistration: false,
                  registrationOrigin: {
                    url: this.document.URL,
                    account: AccountType.personal,
                  },
                })
                .pipe(map(() => personalPath));
            } else {
              this.activateAccountLang().toPromise();

              return this.loginFormService.getUserBusiness().pipe(
                map((businessData) => {
                  return businessData.businesses.length === 1
                    ? `/business/${businessData.businesses[0]._id}/info/overview`
                    : businessData.businesses.length > 1
                      ? 'switcher'
                      : personalPath;
                }));
            }
          }),
          tap((path) => {
            this.router.navigate([path]);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    };

    const popupWindowConfig = (): string => {
      const winWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
      const winHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
      const width = winWidth / 1.5;
      const height = winHeight - 40;
      const left = (winWidth - width) / 1.5;
      const top = (winHeight - height) / 1.1;

      return `width=${width},height=${height},left=${left},top=${top}`;
    };

    let popupWindow = window.open(url, '_blank', popupWindowConfig());

    if (popupWindow) {
      popupWindow.focus();
      const subscription = interval(1000)
        .pipe(
          filter(() => popupWindow && popupWindow.closed),
          tap(() => {
            this.facebookLoading = false;
            this.googleLoading = false;
            this.cdr.detectChanges();
            subscription.unsubscribe();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }
  }

  private checkErrors(): void {
    for (let control in this.form.controls) {
      if (this.form.controls[control].invalid && this.errors[control]) {
        this.errors[control].hasError = true;

        if (this.form.controls[control].errors.required && ['email', 'plainPassword'].includes(control)) {
          const errorMsg = `forms.error.validator.${control}.required`;
          this.errors[control].errorMessage = this.translateService.translate(errorMsg);
        }

        if (this.form.controls[control].errors.minlength) {
          this.errors[control].errorMessage = this.translateService.translate(
            'forms.error.validator.password.required',
          );
        }
      } else if (this.errors[control]) {
        this.errors[control].hasError = false;
      }
    }
  }

  ngOnChanges(): void {
    this.username && this.form.get('email').setValue(this.username);
  }

  ngOnInit(): void {
    this.route.fragment
      .pipe(
        filter((fragment: string) => fragment === 'social'),
        tap(() => {
          this.displayLoginWithEmail = false;
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  onLoginClick(e): void {
    e.preventDefault();
    if (this.withoutCreds) {
      this.activateAccountLang()
        .pipe(
          tap(() => {
            this.onSuccessLogin.emit();
          }),
          takeUntil(this.destroy$))
        .subscribe();
    } else {
      this.onSuccess();
    }
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  navigateToPassword(): void {
    this.router.navigate(['/password']);
  }

  private activateAccountLang(): Observable<boolean> {
    this.store.dispatch(new LoadUser());

    return this.user$.pipe(
      filter(user => user?._id !== null),
      take(1),
      flatMap(user => user && user.language && retrieveLocale() !== user.language
        ? this.translationLoaderService.reloadTranslations(user.language).pipe(map(() => true))
        : of(true),
      ),
    );
  }

  private onSuccess(): void {
    this.allowValidation = true;
    this.checkErrors();
    if (this.form.invalid) {
      return;
    }
    this.isLoading$.next(true);
    this.errorMessage = '';
    from(loadEncryptionModule(this.compiler, this.injector)).pipe(
      switchMap(encryptionService =>
        from(encryptionService.encryptPassWithPubKey(this.form.value.plainPassword)).pipe(
          mergeMap((encryptedPassword: string) => {
            const formData = { ...this.form.value };
            delete formData.plainPassword;

            return this.authService.login({
              ...formData,
              encryptedPassword,
            }).pipe(
              tap((accessToken: string) => {
                this.onUpdateFormData();

                if (!accessToken) {
                  this.onSecondFactorCode.emit();
                } else {
                  of(null)
                    .pipe(
                      delay(1),
                      take(1),
                      switchMap(() => this.activateAccountLang()),
                      tap(() => {
                        this.onSuccessLogin.emit();
                      }),
                      takeUntil(this.destroy$))
                    .toPromise();
                }
              }),
              catchError(this.handleErrorMessage.bind(this)),
            );
          }),
        ),
      ),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private handleErrorMessage(errors: LoginErrorsInterface) {
    this.isLoading$.next(false);
    this.onUpdateFormData();

    if (CAPTCHA_REASONS.indexOf(errors.raw?.reason) >= 0) {
      this.form.addControl('recaptchaToken', new FormControl('', [Validators.required]));
    }

    if (!this.loginErrorMessage(errors)) {
      for (let field in errors.errorBag) {
        if (this.errors[field]) {
          this.errors[field].hasError = true;
          this.errors[field].errorMessage = this.translateService.translate(
            'forms.error.validator.password.minlength',
          );
        }
      }
    }
    this.cdr.detectChanges();

    return EMPTY;
  }

  private loginErrorMessage(errors: LoginErrorsInterface): boolean {
    (BLOCK_EMAL_REASONS.indexOf(errors.raw?.reason) >= 0)
    && (this.errorMessage = this.translateService.translate(`forms.login.error_reasons.${errors.raw.reason}`));

    (CAPTCHA_REASONS.indexOf(errors.raw?.reason) >= 0 || !errors.errorBag || Object.keys(errors.errorBag).length === 0)
    && (this.errorMessage = errors.message || this.translateService.translate('forms.error.unknown_error'));

    return !!this.errorMessage;
  }

  navigate(page): void {
    const { invitationRedirectUrl } = this.route.snapshot.queryParams;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
    this.router.navigate([page], queryParams);
  }

  protected onUpdateFormData(): void {
    this.form.removeControl('recaptchaToken');
    this.cdr.detectChanges();
  }

  checkEmail(blurred): void {
    const field = 'email';

    if (!this.allowValidation && this.errors[field]) {
      const form = this.form.get(field);
      if (form.errors?.email && blurred) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');

        return;
      }
      this.errors[field].hasError = false;
    }
  }

  showLogin(): void {
    this.displayLoginWithEmail = true;
  }

  redirectSignUpUrl(): void {
    this.isLoading$.next(false);
    this.router.navigate(['/registration']);
  }
}
