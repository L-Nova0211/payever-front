import {
  AfterViewInit,
  ChangeDetectionStrategy,
  Component,
  Directive,
  ElementRef,
  EventEmitter,
  HostListener,
  Injector,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Output,
  SimpleChanges,
  ViewEncapsulation
} from '@angular/core';
import { Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, EMPTY, Observable, Subject } from 'rxjs';
import { filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { AuthTokenPayload, PeAuthService } from '@pe/auth';
import { CosEnvService, LoaderService } from '@pe/base';
import { BusinessApiService, BusinessInterface } from '@pe/business';
import { FormAbstractComponent, FormFieldType, FormScheme, FormSchemeField } from '@pe/forms';
import { InputType } from '@pe/forms-core';
import { PlatformService } from '@pe/platform';
import { WallpaperService } from '@pe/wallpaper';
import { WindowService } from '@pe/window';
import { LoginFormService } from '@pe/entry/login';

const CODE_LENGTH = 6;

@Directive({
  selector: '[autoFocus]',
})
export class AutofocusDirective implements AfterViewInit, OnChanges {
  @Input() public autoFocus: boolean;

  constructor(private el: ElementRef) {}

  ngOnChanges(changes: SimpleChanges) {
    if (changes.autoFocus && this.autoFocus) {
      this.setFocus();
    }
  }

  public ngAfterViewInit() {
    if (this.autoFocus) {
      this.setFocus();
    }
  }

  private setFocus() {
    const inputNode = this.el.nativeElement.querySelector('input');
    if (inputNode) {
      setTimeout(() => {
        inputNode.focus();
      }, 100);
    } else {
      console.warn('AutoFocus directive: the input node not found');
    }
  }
}

@Component({
  selector: 'login-second-factor-code',
  templateUrl: './login-second-factor-code.component.html',
  styleUrls: ['./login-second-factor-code.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class LoginSecondFactorCodeComponent extends FormAbstractComponent<any> implements OnInit, OnDestroy {
  activeBusiness: BusinessInterface;
  email = '';
  returnUrl: string;
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  formScheme: FormScheme;
  codeInvalid$: Subject<boolean> = new Subject();
  busy$: Subject<boolean> = new Subject();
  busySendCode$: Subject<boolean> = new Subject();
  currentActive$: BehaviorSubject<number> = new BehaviorSubject(0);

  @Input() emitOnSuccessLogin = false;
  @Input() hideLanguageSwitcher = false;
  @Output() onSuccessLoginDone: EventEmitter<void> = new EventEmitter<void>();

  isMobile$: Observable<boolean> = this.windowService.isMobile$.pipe(
    takeUntil(this.destroyed$),
    filter(isMobile => !!isMobile),
  );

  protected formStorageKey: string = null;

  constructor(
    injector: Injector,
    private activatedRoute: ActivatedRoute,
    private wallpaperService: WallpaperService,
    private platformService: PlatformService,
    private authService: PeAuthService,
    private router: Router,
    private loaderService: LoaderService,
    private apiService: BusinessApiService,
    private loginFormService: LoginFormService,
    private windowService: WindowService,
    private envService: CosEnvService,
    private route: ActivatedRoute,
  ) {
    super(injector);
  }

  ngOnInit() {
    this.envService.secondFactorAuthPassed = true;
    const payload: AuthTokenPayload = this.authService.getRefershTokenData();
    this.email = this.hideEmail(payload.email || '');
    this.platformService.profileMenuChanged = {
      firstName: payload.firstName,
      lastName: payload.lastName,
    };
    // this.headerService.setTwoFactorPageHeader();
    this.returnUrl = this.activatedRoute.snapshot.queryParams['returnUrl'];
    this.wallpaperService.showDashboardBackground(false);
    this.loaderService.hideLoader();
  }

  ngOnDestroy() {
    this.envService.secondFactorAuthPassed = true;
    // this.headerService.loggedIn = true;
  }

  @HostListener('document:keypress', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.onSendCode();
    }
  }

  onSuccessLogin(): void {
    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
    const queryParams = invitationRedirectUrl ? { queryParams: { invitationRedirectUrl } } : undefined;

    if (this.emitOnSuccessLogin) {
      this.onSuccessLoginDone.emit();
    } else if (this.returnUrl) {
      const fullUrlRegexp = /^(http(s)?:\/\/.).*/;
      if (fullUrlRegexp.test(this.returnUrl)) {
        // use windows instead of router because we can authenticate from external sites
        window.location.replace(this.returnUrl);
      } else {
        // TODO fix wrong returnUrl
        if (this.returnUrl.includes('second-factor-code')) {
          this.forkForNextSteepAfterIdentification(queryParams, invitationRedirectUrl);
        } else {
          this.router.navigateByUrl(this.returnUrl);
        }
      }
    } else {
      this.forkForNextSteepAfterIdentification(queryParams, invitationRedirectUrl);
    }
  }

  enterToDashboard(businesses, invitationRedirectUrl) {
    const businessesId = businesses.businesses ? businesses.businesses[0]._id : businesses[0]._id;
    if (invitationRedirectUrl) {
      this.router.navigate([invitationRedirectUrl, businessesId]);
    } else {
      const url = `business/${businessesId}/info/overview`;
      this.router.navigate([url]);
    }
  }

  forkForNextSteepAfterIdentification(queryParams, invitationRedirectUrl) {
    this.apiService.getBusinessesList().pipe(
      switchMap((businesses) => {
        if (!businesses?.total) {
          return this.loginFormService.getUserBusiness().pipe(
            tap((businessData) => {
              if (businessData.businesses.length) {
                this.enterToDashboard(businessData.businesses, invitationRedirectUrl);
              } else {
                this.router.navigate([`/personal/${this.authService.getUserData().uuid}`], queryParams);
              }
            }),
          );
        }

        if (businesses.total === 1) {
          this.enterToDashboard(businesses, invitationRedirectUrl);

          return EMPTY;
        }

        this.router.navigate(['switcher'], queryParams);

        return EMPTY;
      }),
    ).subscribe();
  }

  onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Backspace') {
      this.currentActive$.next(this.currentActive$.value - 1);
    }
  }

  onValueChange(value: string, controlNumber: number) {
    // if user makes copy/paste the code
    if (!value) {
      return;
    }

    if (value && value.length === CODE_LENGTH) {
      Object.keys(this.form.controls).forEach((key, index) => {
        this.form.get(key).setValue(value[index]);
      });
    } else {
      if (value && value.length > 1) {
        this.form.get(`code${controlNumber + 1}`).setValue(value[value.length - 1], { emitEvent: false });
      } else {
        this.form.get(`code${controlNumber + 1}`).setValue(value, { emitEvent: false });
      }

      if (controlNumber < CODE_LENGTH) {
        this.currentActive$.next(controlNumber + 1);
      }
    }

    if (controlNumber === CODE_LENGTH - 1) {
      if (this.checkCodeReady()) {
        this.isLoading$.next(true);
        this.onSendCode();
      }
    }

    this.codeInvalid$.next(false);
  }

  get code(): string {
    const values: string[] = Object.keys(this.form.value).map(key => this.form.value[key] || '');

    return values.join('');
  }

  checkCodeReady(): boolean {
    let code = '';
    if (this.form.valid) {
      code = this.code;

      if (code.length === CODE_LENGTH) {
        return true;
      }
    }

    return false;
  }

  onSendCode() {
    if (!this.checkCodeReady()) {
      this.codeInvalid$.next(true);
    } else {
      this.onSubmit();
      this.busy$.next(true);
    }
  }

  onReSendCode() {
    this.busySendCode$.next(true);
    this.authService.repeatSendCode().subscribe(
      () => this.busySendCode$.next(false),
      () => this.router.navigate(['login']),
    );
  }

  isShowSkip(): boolean {
    // This one is only for local development
    return window.location.hostname === 'localhost' && window.location.port === '8888';
  }

  protected createForm(): void {
    const groupSettings = {};
    const fieldsets: FormSchemeField[] = [];

    for (let iNumber = 1; iNumber <= CODE_LENGTH; iNumber++) {
      const controlName = `code${iNumber}`;
      groupSettings[controlName] = ['', Validators.required];
      fieldsets.push({
        name: controlName,
        type: FormFieldType.Input,
        fieldSettings: {
          classList: `col-xs-12 col-sm-12 form-fieldset-field-padding-24`,
          required: true,
        },
        inputSettings: {
          placeholder: '',
          type: InputType.Number,
          nameAttribute: controlName,
        },
      });
    }
    this.form = this.formBuilder.group(groupSettings);

    this.formScheme = {
      fieldsets: {
        code: fieldsets,
      },
    };
    this.changeDetectorRef.detectChanges();
  }

  protected onSuccess(): void {
    this.authService.secondFactorCode(this.code).subscribe(
      () => {
        window['pe_isSecondFactorJustPassedAsTemporary'] = true; // TODO Remove this hack after ng-kit update
        this.onSuccessLogin();
      },
      () => {
        this.isLoading$.next(false);
        this.codeInvalid$.next(true);
        this.busy$.next(false);
      },
    );
  }

  protected onUpdateFormData(formValues: any): void {
    return;
  }

  private hideEmail(email: string): string {
    if (!email) {
      return email;
    }
    let result: string = email;
    const reg = /(^.{3})(.+)@/g;

    const substr = (reg.exec(email) as Array<string>) || [];
    if (substr && substr.length > 2) {
      result = result.replace(substr[2], '******');
    } else {
      // TODO Remove log
    }

    return result;
  }
}
