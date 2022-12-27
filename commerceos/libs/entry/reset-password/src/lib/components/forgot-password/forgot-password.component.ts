import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { cloneDeep } from 'lodash-es';
import { takeUntil } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { AbstractComponent, entryLogo } from '@pe/base';
import { PeValidators } from '@pe/forms';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';

interface IconInterface {
  icon: string;
  width?: number;
  height?: number;
}
@Component({
  selector: 'entry-forgot-password',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})

export class ForgotPasswordComponent extends AbstractComponent {
  success = false;
  email: string;
  isLoading = false;
  allowValidation = false;
  errorMessage = '';
  form;

  errors = {
    email: {
      hasError: false,
      errorMessage: '',
    },
  };

  formTranslationsScope = 'forms.login';
  protected formStorageKey: string = null;

  constructor(
    private apiService: ApiService,
    private localeConstantsService: LocaleConstantsService,
    private translateService: TranslateService,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
  ) {
    super();
    this.form = this.formBuilder.group({
      email: [
        '',
        [
          PeValidators.validEmailWithDomain(this.translateService, 'forms.error.validator.email.invalid'),
          Validators.required,
        ],
      ],
    });

    this.form.valueChanges.pipe(takeUntil(this.destroyed$)).subscribe((data) => {
      if (this.allowValidation) {this.checkErrors();}
    });
  }

  navigateToEntry(): void {
    this.router.navigate(['/login']);
  }

  onReCaptchaVerified(token: string | false): void {
    this.form.get('recaptchaToken').setValue(token || '');
    this.cdr.detectChanges();
  }

  public onSuccess(): void {
    this.allowValidation = true;
    this.errorMessage = '';
    this.checkErrors();
    if (this.form.invalid) {return;}
    this.isLoading = true;

    const payload = cloneDeep(this.form.value);
    payload.language = this.localeConstantsService.getLang();

    this.apiService.requestPasswordResetEmail(payload).subscribe(
      () => {
        this.email = this.form.get('email').value;
        this.success = true;
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
      (exception: any) => {
        this.onUpdateFormData();
        if (exception.error && ['REASON_DISPLAY_CAPTCHA', 'REASON_NO_CAPTCHA'].indexOf(exception.error.reason) >= 0) {
          this.form.addControl('recaptchaToken', new FormControl('', [Validators.required]));
          this.errorMessage = exception.error.message || 'Unknown error';
        } else {
          this.errors.email.hasError = true;
          this.errors.email.errorMessage = 'Unknown error';
        }
        this.isLoading = false;
        this.cdr.markForCheck();
        this.cdr.detectChanges();
      },
    );
  }

  checkErrors() {
    for (let control in this.form.controls) {
      if (this.form.controls[control].invalid && this.errors[control]) {
        this.errors[control].hasError = true;
        if (this.form.controls[control].errors.required) {
          this.errors[control].errorMessage = 'Email is required';
        }
        if (this.form.controls[control].errors.email) {
          this.errors[control].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');
        }
      } else if (this.errors[control]) {
        this.errors[control].hasError = false;
      }
    }
  }

  checkEmail(field, blurred) {
    if (!this.allowValidation) {
      const form = this.form.get(field);
      if (form.errors?.email && blurred) {
        this.errors[field].hasError = true;
        this.errors[field].errorMessage = this.translateService.translate('forms.error.validator.email.invalid');

        return;
      }
      this.errors[field].hasError = false;
    }
  }

  protected onUpdateFormData(): void {
    this.form.removeControl('recaptchaToken');
    this.cdr.detectChanges();
  }

  getIndustryIcon(): IconInterface {
    const industry: string = this.route.snapshot?.params.industry;
    const icon = `#icon-industries-${industry}`;

    if (industry) {
      (window as any).PayeverStatic.IconLoader.loadIcons(['industries']);
    }

    return industry ? { icon, height: 30 } : entryLogo;
  }
}
