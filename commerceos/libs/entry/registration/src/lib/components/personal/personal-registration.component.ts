import { DOCUMENT } from '@angular/common';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { AbstractComponent, entryLogo } from '@pe/base';
import { EMAIL_VALIDATOR, InputPasswordValidator } from '@pe/forms';
import { LocaleConstantsService } from '@pe/i18n';
import { LocaleService, TranslateService } from '@pe/i18n-core';
import { AccountType, CreatePersonalFormEvent, CreatePersonalFormEventType } from '@pe/personal-form';
import { RegistrationService } from '@pe/shared/registration';

const blockReasons = [
  'REASON_REGISTRATION_20_MINUTES_BAN',
  'REASON_REGISTRATION_3_HOURS_BAN',
  'REASON_REGISTRATION_PERMANENT_BAN',
  'REASON_REGISTRATION_WRONG_PASSWORD',
];

@Component({
  selector: 'entry-personal-registration',
  templateUrl: './personal-registration.component.html',
  styleUrls: ['./personal-registration.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PersonalRegistrationComponent extends AbstractComponent implements OnInit{
  @Input() entryLogo = entryLogo;
  @Input() type: string;

  form: FormGroup;
  businessData: any;
  errorBag$: Subject<any> = new Subject();
  errorMessage = '';
  allowValidation = false;
  isLoading = false;

  passwordFocused$ = new BehaviorSubject<boolean>(false);

  errors = {
    email: {
      hasError: false,
      errorMessage: '',
      label: 'Email',
    },
    password: {
      hasError: false,
      errorMessage: '',
      label: 'Password',
    },
    lastName: {
      hasError: false,
      errorMessage: '',
      label: 'Last name',
    },
    firstName: {
      hasError: false,
      errorMessage: '',
      label: 'First name',
    },
  };

  termsLink: string;
  privacyLink: string;

  industryIcon = entryLogo;

  constructor(
    private apiService: ApiService,
    private authService: PeAuthService,
    private formBuilder: FormBuilder,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private localeConstantsService: LocaleConstantsService,
    private router: Router,
    private route: ActivatedRoute,
    private registrationService: RegistrationService,
    private localeService: LocaleService,
    @Inject(DOCUMENT) private document: Document,
  ) {
    super();
    this.handleErrors = this.handleErrors.bind(this);
    this.form = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      email: ['', [Validators.required, this.emailValidator]],
      password: ['', [Validators.required, InputPasswordValidator.default]],
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      if (this.allowValidation) {
        this.checkErrors();
      }
    });

    this.localeService.currentLocale$.pipe(
      tap(() => {
        this.termsLink = this.translateService.translate('forms.error.validator.termlink');
        this.privacyLink = this.translateService.translate('forms.error.validator.privacylink');
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  ngOnInit() {
    this.industryIcon = this.registrationService.loadIndustryIcon(this.route.snapshot?.params.industry, entryLogo);
  }

  onFormDataReceive(data: any, needNextStep: boolean = false): void {
    if (needNextStep) {
      this.registerPersonalAccount();
    }
  }

  navigate() {
    this.router.navigate(['./login']);
  }

  emailValidator(control: AbstractControl): { [key: string]: boolean } | null {
    return !EMAIL_VALIDATOR(control.value) ? { email: true } : null;
  }

  checkErrors() {
    for (let control in this.form.controls) {
      if (this.form.controls[control].invalid) {
        this.errors[control].hasError = true;
        if (this.form.controls[control].errors.required) {
          this.errors[control].errorMessage = this.errors[control].label + ' is required';
        }
        if (this.form.controls[control].errors.email) {
          this.errors[control].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');
        }
        if (this.form.controls[control].errors.minlength) {
          this.errors[control].errorMessage = this.translateService.translate(
            'forms.error.validator.password.minlength',
          );
        }
      } else {
        this.errors[control].hasError = false;
      }
    }
  }

  registerPersonalAccount(): void {
    this.allowValidation = true;
    this.checkErrors();
    if (this.form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService
      .register({
        email: this.form.value.email,
        first_name: this.form.value.firstName,
        last_name: this.form.value.lastName,
        password: this.form.value.password,
        language: this.localeConstantsService.getLang(),
      })
      .pipe(
        tap({
          next: () => {
            this.apiService
              .createUserAccount({
                hasUnfinishedBusinessRegistration: this.type === AccountType.business ? true : false,
                registrationOrigin: {
                  url: this.document.URL,
                  account: this.type === AccountType.personal ? AccountType.personal : AccountType.merchant,
                },
              })
              .subscribe(() => {
                this.isLoading = false;
                if (this.type === AccountType.personal) {
                  this.router.navigate(['/personal']);
                } else {
                  this.registrationService.registrationStep$.next(2);
                }
              }, this.handleErrors);
          },
          error: this.handleErrors,
        }),
      )
      .subscribe();
  }

  private handleErrors(errors: any) {
    this.isLoading = false;
    if (errors.raw && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(errors.raw.reason) >= 0) {
      this.form.addControl('recaptchaToken', new FormControl('', [Validators.required]));
    }
    if (
      (errors.raw && errors.raw.reason && blockReasons.indexOf(errors.raw.reason) >= 0) ||
      !errors.errorBag ||
      Object.keys(errors.errorBag).length === 0
    ) {
      this.errorMessage = errors.raw?.reason
        ? this.translateService.translate(`forms.login.error_reasons.${errors.raw.reason}`)
        : errors.message || 'Unknown error';
    }
    if (errors.raw && errors.raw?.statusCode === 400) {
      for (let err in errors.errorBag) {
        if (this.errors[err]) {
          this.errors[err].errorMessage = errors.errorBag[err];
          this.errors[err].hasError = true;
        }
      }
    }
    if (
      errors.raw.statusCode === 401 &&
      errors.raw.message &&
      ['REASON_EMAIL_BAN_LOGIN', 'REASON_EMAIL_BAN_REGISTER'].indexOf(errors.raw.message) >= 0
    ) {
      this.errorMessage = this.translateService.translate(`forms.login.error_reasons.${errors.raw.message}`);
    }
    this.cdr.detectChanges();
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  checkField(field, blurred) {
    if (field === 'password') {
      this.passwordFocused$.next(!blurred);
    }

    if (!this.allowValidation) {
      const form = this.form.get(field);
      if (form.errors?.email && blurred) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');

        return true;
      }
      if (field === 'password' && form.errors && blurred && !form.errors.required) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.password.invalid');

        return true;
      }
      this.errors[field].hasError = false;
    }
  }

  scrollTo(el: HTMLElement) {
    el.scrollIntoView();
  }

  onFormEvent(e: CreatePersonalFormEvent): void {
    switch (e.event) {
      case CreatePersonalFormEventType.EmployeeIsCreated:
        this.router.navigate([`business/${e.data?.businessId}/info/overview`]);
        break;
      case CreatePersonalFormEventType.UserIsCreated:
        if (e.data.type === AccountType.personal) {
          this.router.navigate([`personal/${e.data.userId}`]);
        } else {
          this.registrationService.registrationStep$.next(2);
        }
        break;
      case CreatePersonalFormEventType.NavigateToLogin:
        const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
        const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;
        this.router.navigate(['login'], queryParams);
        break;
    }
  }
}
