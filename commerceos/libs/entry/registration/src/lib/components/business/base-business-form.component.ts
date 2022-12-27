import { ChangeDetectorRef, Directive, EventEmitter, Injector, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { combineLatest, Observable, of } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { ApiService, PartnerService, TrafficSourceInterface } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { CreateBusinessFormInterface } from '@pe/business-form';
import { PeDestroyService } from '@pe/common';
import { RegistrationService } from '@pe/shared/registration';
import { TrafficSourceService } from '@pe/shared/traffic-service';
import { SnackbarService } from '@pe/snackbar';
import { PeUser, UserLoaded, UserState } from '@pe/user';
import { WelcomeScreenService } from '@pe/welcome-screen';

enum RegisterStep {
  Account = 'account',
  Business = 'business',
  Personal = 'personal',
  Partner = 'partner',
  Admin = 'admin',
}

@Directive({
  providers: [
    PeDestroyService,
  ],
})
export abstract class BaseBusinessFormComponent implements OnInit {
  @SelectSnapshot(UserState.user) user: PeUser;

  @Input() businessRegistrationData: any;

  @Output() unableMessage = new EventEmitter<string>();

  registerStep = RegisterStep;
  userData: any;
  businessData: CreateBusinessFormInterface;
  errorBag: any = {};
  partnerData: any;

  currentStep = RegisterStep.Account;
  isLoading = false;
  formValid = true;
  allowValidation = false

  afterRegistrationMethods = {}



  readonly businessId: string = uuid();

  protected destroyed$: PeDestroyService = this.injector.get(PeDestroyService);
  private apiService: ApiService = this.injector.get(ApiService);
  private authService: PeAuthService = this.injector.get(PeAuthService);
  private trafficSourceService: TrafficSourceService = this.injector.get(TrafficSourceService);
  private changeDetectorRef: ChangeDetectorRef = this.injector.get(ChangeDetectorRef);
  private router: Router = this.injector.get(Router);
  private route: ActivatedRoute = this.injector.get(ActivatedRoute);
  private welcomeScreen: WelcomeScreenService = this.injector.get(WelcomeScreenService);
  private partnerService: PartnerService = this.injector.get(PartnerService);
  private registrationService: RegistrationService = this.injector.get(RegistrationService);
  private store: Store = this.injector.get(Store);
  private snackbarService: SnackbarService = this.injector.get(SnackbarService);

  abstract prepareBusinessData(): any;

  constructor(
    protected injector: Injector,
  ) {
  }

  ngOnInit() {

    this.userData = this.authService.getUserData().email;

    this.partnerData = this.partnerService.getPartnerFromLocalStorage();
    if (this.partnerData) {
      Object.values(this.registerStep).forEach((value) => {
        this.afterRegistrationMethods[value] =
          this.partnerData.afterRegistration.filter(val => val.registerSteps.find(step => step === value));
      });

      this.afterRegistrationActions(RegisterStep.Account, '', '').pipe(takeUntil(this.destroyed$)).subscribe();
    }
  }

  navigate() {
    this.router.navigate(['./login'])
  }

  onFormDataReceive(data: any): void {
    this.businessData = data;
  }

  onFormErrorReceive(hasErrors: boolean): void {
    this.formValid = !hasErrors;
  }

  validateAndCreateBusiness() {
    const userEmail = this.authService.getUserData().email;

    if (this.userData === userEmail) {
      this.createBusiness();
    } else {
      this.unableMessage.emit('Unable to create Business. Please relaod the page.');
    }
  }

  createBusiness() {
    this.allowValidation = true;
    if (!this.formValid) { return }

    this.isLoading = true;

    this.apiService.registerUuid(this.businessId).subscribe((res) => {
      this.authService.setToken(res.accessToken).subscribe(() => {
        this.addCompany(this.businessId);
      });
    });
  }

  private addCompany(businessId: string) {
    const trafficSource: TrafficSourceInterface = this.trafficSourceService.getSource();
    const createCompanyData = this.prepareBusinessData();

    if (trafficSource) {
      createCompanyData['trafficSource'] = trafficSource;
    }

    this.apiService.createCompany(createCompanyData).subscribe(
      (responseBusinessData: any) => {
        const user = Object.assign({}, this.user);
        user.hasUnfinishedBusinessRegistration = false
        this.store.dispatch(new UserLoaded(user));
        this.isLoading = false;
        this.apiService.enableBusiness(responseBusinessData._id).pipe(
          switchMap(tokens =>
            this.authService.setToken(tokens.accessToken).pipe(
              switchMap(() => {
                combineLatest([
                  this.partnerService.actionController,
                ]).pipe(
                  tap(() => {
                    this.trafficSourceService.removeSource();
                    //@TODO remove when new settings app will be ready
                    localStorage.removeItem('pe_opened_business');
                    localStorage.removeItem('pe_active_business');

                    const invitationRedirectUrl = this.route.snapshot.queryParams.invitationRedirectUrl;
                    if (invitationRedirectUrl) {
                      this.router.navigate([invitationRedirectUrl, businessId]);
                    } else {
                      this.registrationService.justRegistered = true;
                      this.router
                        .navigate([`/business/${responseBusinessData._id}/info/overview`])
                        .then(() => this.welcomeScreen.show());
                    }
                  }),
                  takeUntil(this.destroyed$),
                ).subscribe();

                const re = /:businessId/g;

                return this.afterRegistrationActions(RegisterStep.Business, businessId, re);
              }),
            ),
          ),
          takeUntil(this.destroyed$),
        ).subscribe();
      }, (errors: any) => {
        this.isLoading = false;
        if (errors.errorBag.name) {
          this.showSnackbar(errors.errorBag.name);
        }
        this.changeDetectorRef.detectChanges();
      });
  }

  private afterRegistrationActions(step, id, re): Observable<unknown> {
    if (this.afterRegistrationMethods[step]) {
      return this.partnerService.runAfterActions(this.afterRegistrationMethods[step], id, this.partnerData.name, re);
    }
    this.partnerService.actionController.next();

    return of(null);
  }


  private showSnackbar(notify: string): void {
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconSize: 24,
    });
  }
}
