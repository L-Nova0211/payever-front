
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, Observable, ReplaySubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { v4 as uuid } from 'uuid';

import { ApiService, PartnerService, TrafficSourceInterface } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { BusinessApiService, DefaultBusinessesLoaded, LoadBusinesses } from '@pe/business';
import { CreateBusinessFormInterface } from '@pe/business-form';
import { AddressService, TransformDateService } from '@pe/forms';
import { LocaleConstantsService, SimpleLocaleConstantsService } from '@pe/i18n';
import { PeOverlayWidgetService, PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { TrafficSourceService } from '@pe/shared/traffic-service';
import { PeUser, UserState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';
import { WelcomeScreenService } from '@pe/welcome-screen';

@Component({
  selector: 'pe-add-business',
  templateUrl: 'add-business-overlay.component.html',
  styleUrls: ['./add-business-overlay.component.scss'],
  providers: [
    AddressService,
    TransformDateService,
    FormBuilder,
    LocaleConstantsService,
    SimpleLocaleConstantsService,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddBusinessOverlayComponent implements OnInit {
  @Select(UserState.user) user$: Observable<PeUser>;
  userData: any;
  businessData: CreateBusinessFormInterface;
  allowValidation=false
  businessRegistrationData = this.appData.businessRegistrationData;
  errorBag$ = new BehaviorSubject<any>({
    businessStatus: {
      hasError: false,
      errorMessage: '',
      label: 'Business Type',
    },
    name: {
      hasError: false,
      errorMessage: '',
      label: 'Company Name'    },
    status: {
      hasError: false,
      errorMessage: '',
      label: 'Status'    },
    salesRange: {
      hasError: false,
      errorMessage: '',
      label: 'Annual Sales'    },
    industry: {
      hasError: false,
      errorMessage: '',
      label: 'Industry'    },
    countryPhoneCode: {
      hasError: false,
      errorMessage: '',
      label: 'Country Code'    },
    phoneNumber: {
      hasError: false,
      errorMessage: '',
      label: 'Phone Number'    },
  });

  isLoading = false;
  formValid = true;

  protected destroyed$: ReplaySubject<boolean> = new ReplaySubject();

  constructor(
    private apiService: ApiService,
    private authService: PeAuthService,
    private trafficSourceService: TrafficSourceService,
    private changeDetectorRef: ChangeDetectorRef,
    private partnerService: PartnerService,
    private router: Router,
    private apmService: ApmService,
    @Inject(PE_OVERLAY_DATA) public appData: any,
    private welcomeScreen: WelcomeScreenService,
    private overlay: PeOverlayWidgetService,
    private store:Store,
    private wallpaperService: WallpaperService,
    private businessApiService: BusinessApiService,
    @Inject(PE_OVERLAY_CONFIG) public config: any,
  ) {

  }

  ngOnInit() {
    this.config.doneBtnCallback = () => {
      this.createBusiness()
    }

    this.user$.pipe(
      tap((data) => {
        this.userData = data;
      })
    ).subscribe();
  }

  ngOnDestroy(): void {
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  onFormDataReceive(data: any): void {
    this.businessData = data;
  }

  onFormErrorReceive(hasErrors: boolean): void {
    this.formValid = !hasErrors;
  }

  private createBusiness() {
    this.allowValidation = true;
    this.errorBag$.next(this.errorBag$.value);
    if (!this.formValid) { return }
    const businessId: string = uuid();
    this.config.doneBtnTitle = 'Loading...';
    this.config.isLoading = true;
    this.isLoading = true;

    this.apiService.registerUuid(businessId).pipe(switchMap((res) => {
      this.wallpaperService.backgroundImage = this.wallpaperService.defaultBackgroundImage;
      if (res?.accessToken) {
        return this.authService.setToken(res?.accessToken).pipe(tap(() => {
          this.addCompany(businessId);
        }));
      } else {
        this.apmService.apm.captureError(`Couldn't create business cos token null`)

        return EMPTY;
      }
    })).subscribe();
  }

  private enable(businessId: string): Observable<any>{
    return this.businessApiService
    .enableBusiness(businessId)
    .pipe(
      switchMap(res => this.authService.setTokens({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
      })),
    );
  }

  private addCompany(businessId: string) {
    const trafficSource: TrafficSourceInterface = this.trafficSourceService.getSource();
    const createCompanyData = {
      id: businessId,
      name: this.businessData.name,
      companyAddress: {
        country: this.businessData.countryPhoneCode.split(':')[0],
      },
      companyDetails: {
        businessStatus: this.businessData.businessStatus,
        status: this.businessData.status,
        salesRange: this.businessData.salesRange,
        product: this.businessData.industry.productCode,
        industry: this.businessData.industry.value,
        phone: this.businessData.countryPhoneCode.split(':')[1] + this.businessData.phoneNumber,
      },
    };

    if (trafficSource) {
      createCompanyData['trafficSource'] = trafficSource;
    }

    this.apiService.createCompany(createCompanyData)
      .pipe(
        tap(
          (responseBusinessData: any) => {
            this.enable(businessId).pipe(tap(() => {
              if (this.userData) {
                const re = /:businessId/g;
                const onboardingDefaultData = 'business';
                this.partnerService.getPartnerData({
                  industry: this.userData?.registrationOrigin?.source || onboardingDefaultData,
                }).pipe(
                  switchMap(partnerData => this.partnerService.runAfterActions(
                    partnerData.afterRegistration,
                    businessId,
                    partnerData.name,
                    re,
                  )),
                ).subscribe();
              } else {
                this.partnerService.actionController.next();
              }
              this.isLoading = false;
              this.config.isLoading = false;
              this.config.doneBtnTitle = 'Done';
              this.trafficSourceService.removeSource();
              this.store.dispatch(new LoadBusinesses())
              this.store.dispatch(new DefaultBusinessesLoaded(responseBusinessData));
              if (responseBusinessData) {
                localStorage.setItem('pe_active_business', JSON.stringify(responseBusinessData))
              }
            })).subscribe();
          },
          (errors: any) => {
            this.isLoading = false;
            this.config.isLoading = false;
            this.config.doneBtnTitle = 'Done';

            const errorBag = this.errorBag$.value;

          Object.keys(errors.errorBag).forEach((key) => {
            const value = errors.errorBag[key];

              if (errorBag[key]) {
                errorBag[key].errorMessage = value;
                errorBag[key].hasError = true;
              }
            });

            this.errorBag$.next(errorBag);
          },
        ),
      ).subscribe();

      this.partnerService.actionController.pipe(takeUntil(this.destroyed$)).subscribe(() => {
        this.router.navigate([`/business/${businessId}`]).then(() => this.welcomeScreen.show());
        this.overlay.close();
      });
  }
}
