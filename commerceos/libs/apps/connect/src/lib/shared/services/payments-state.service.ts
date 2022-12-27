import { Injectable, Injector } from '@angular/core';
import { Params, Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { delay, filter, flatMap, take, map } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n';
import { SnackbarService } from '@pe/snackbar';

import {
  VariantListItemInterface,
  BusinessInterface,
  PaymentOptionExInterface,
  PaymentWithVariantInterface,
  BusinessOptionConditionsInterface,
  PaymentPayloadInterface,
  StepEnum,
  UserBusinessInterface,
  PaymentMethodEnum,
  STEP_UPLOAD_TYPES,
  STEP_UPLOAD_TYPE_TO_OPTION_KEY,
  STEP_UPLOAD_TYPE_TO_BUSINESS_KEY,
  IntegrationInfoWithStatusInterface, IntegrationShortStatusInterface,
} from '../interfaces';
import { IntegrationsStateService } from '../services/integrations-state.service';

import { PaymentsApiService } from './payments-api.service';

@Injectable()
export class PaymentsStateService {

  readonly externalRegPrefix = 'pe_connectapp_externalregfilled_';

  private businessSubject: BehaviorSubject<BusinessInterface> = new BehaviorSubject<BusinessInterface>(null);
  private businessProcessed = false;
  private lastBusinessUuid: string;

  private conditions: {
    [key: string]: {
      subject: BehaviorSubject<BusinessOptionConditionsInterface>,
      processed: boolean
    }
  } = {};

  private paymentPayloads: {
    [key: string]: {
      subject: BehaviorSubject<PaymentPayloadInterface>,
      processed: boolean
    }
  } = {};

  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private paymentsApiService: PaymentsApiService = this.injector.get(PaymentsApiService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private router: Router = this.injector.get(Router);

  constructor(private injector: Injector) {
  }

  get snackBarService(): SnackbarService {
    return this.injector.get(SnackbarService);
  }

  getBusinessUuid(): string {
    const data = window.location.pathname.split('/'); // TODO get via activatedRoute.

    return data[2];
  }

  getUserBusiness(businessSlug: string, reset: boolean = false): Observable<BusinessInterface> {
    if (!this.businessProcessed || reset || this.lastBusinessUuid !== businessSlug) {
      this.businessProcessed = true;
      this.businessSubject.next(null);
      this.lastBusinessUuid = businessSlug;

      this.paymentsApiService.getUserBusiness(businessSlug).subscribe(
        (data: BusinessInterface) => this.businessSubject.next(data),
        () => {
          this.businessSubject.next({} as any);
          this.businessProcessed = false;
        }
      );
    }

    return this.businessSubject.asObservable();
  }

  saveDocument(payment: PaymentWithVariantInterface, paymentMethod: PaymentMethodEnum,
    type: StepEnum, blobName: string, fileName: string): Observable<void> {
    const businessUuid: string = this.getBusinessUuid();
    if (STEP_UPLOAD_TYPES.indexOf(type) < 0) {
      throw new Error('Invalid step for uploading!');
    }
    let document = STEP_UPLOAD_TYPE_TO_OPTION_KEY[type];
    if (!document) {
      document = STEP_UPLOAD_TYPE_TO_BUSINESS_KEY[type];
    }
    const result = this.paymentsApiService.saveBusinessDocument(businessUuid, document, blobName);

    const documentName = this.translateService.translate(`categories.payments.documents.${type}`);

    return result.pipe(flatMap(() => {
      const payload = { documents: [] };
      payload.documents.push({ type: document, blobName, fileName: fileName, name: documentName });

      return combineLatest([
        this.saveConnectPaymentPayload(paymentMethod, payload),
        // this.getPaymentsWithVariant(true),
      ]).pipe(map(() => null));
    }));
  }

  getConnectPaymentPayload(paymentMethod: PaymentMethodEnum, reset: boolean = false):
  Observable<PaymentPayloadInterface> {
    if (!this.paymentPayloads[paymentMethod]) {
      this.paymentPayloads[paymentMethod] = {
        subject: new BehaviorSubject<PaymentPayloadInterface>(null),
        processed: false,
      };
    }
    if (!this.paymentPayloads[paymentMethod].processed || reset) {
      this.paymentPayloads[paymentMethod].processed = true;
      this.paymentPayloads[paymentMethod].subject.next(null);

      this.paymentsApiService.getConnectPaymentPayload(this.getBusinessUuid(),
      paymentMethod).subscribe((data: PaymentPayloadInterface) => {
        this.paymentPayloads[paymentMethod].subject.next(data);
      });
    }

    return this.paymentPayloads[paymentMethod].subject.asObservable();
  }

  saveConnectPaymentPayload(paymentMethod: PaymentMethodEnum,
    data: PaymentPayloadInterface): Observable<PaymentPayloadInterface> {
    return this.paymentsApiService.saveConnectPaymentPayload(this.getBusinessUuid(), paymentMethod, data).pipe(
      flatMap(() => {
        return this.getConnectPaymentPayload(paymentMethod, true).pipe(filter(d => !!d), take(1));
      })
    );
  }

  isExternalAuthSuccess(params: Params): boolean {
    return this.paymentsApiService.isExternalAuthSuccess(params);
  }


  getConditions(variant: VariantListItemInterface, reset: boolean = false):
  Observable<BusinessOptionConditionsInterface> {
    if (!this.conditions[variant.id]) {
      this.conditions[variant.id] = {
        subject: new BehaviorSubject<BusinessOptionConditionsInterface>(null),
        processed: false,
      };
    }
    if (!this.conditions[variant.id].processed || reset) {
      this.conditions[variant.id].processed = true;
      this.conditions[variant.id].subject.next(null);
    }

    return this.conditions[variant.id].subject.asObservable();
  }

  saveUserBusinesses(paymentMethod: PaymentMethodEnum, data: UserBusinessInterface,
    sendApplicationOnSave: boolean): Observable<void> {
    return this.integrationsStateService.saveUserBusinesses(data).pipe(
      delay(300), // Rabbit is too slow sometimes
      flatMap(() => {
        if (sendApplicationOnSave) {
          return this.saveConnectPaymentPayload(paymentMethod, { application_sent: true }).pipe(
            map(() => null)
          );
        } else {
          return of(null);
        }
      })
    );
  }

  isSectionExternalRegisterFilled(option: PaymentOptionExInterface): boolean {
    return !!localStorage.getItem(this.externalRegPrefix + option.payment_method) && false;
  }

  setSectionExternalRegisterFilled(option: PaymentOptionExInterface, filled: boolean = true): void {
    if (filled) {
      localStorage.setItem(this.externalRegPrefix + option.payment_method, 'true');
    } else {
      localStorage.removeItem(this.externalRegPrefix + option.payment_method);
    }
  }

  openInstalledIntegration(integration: IntegrationInfoWithStatusInterface,
    queryParams: object = {}): void { // TODO Should not be here but can't find better place
    const businessId = this.integrationsStateService.getBusinessId();
    this.router.navigate([
    `business/${businessId}/connect/${integration.category}/configure/${integration.name}`], { queryParams });
  }

  installIntegrationAndGoToDone(install: boolean , integration: IntegrationInfoWithStatusInterface):
  Observable<IntegrationShortStatusInterface> { // TODO Should not be here but can't find better place
    return this.integrationsStateService.installIntegration(integration.name, install);
  }

  handleError(error: any, showSnack?: boolean): void { // TODO Should not be here but can't find better place
    if (!error.message) {
      error.message = this.translateService.translate('errors.unknown_error');
    }
    if (error.status === 403 || error.statusCode === 403 || error.code === 403) {
      error.message = this.translateService.translate('errors.forbidden');
    }
    if (showSnack) {
      this.snackBarService.toggle(true, error.message || this.translateService.translate('errors.unknown_error'), {
        data: {
          duration: 5000,
          iconId: 'icon-alert-24',
          iconSize: 24,
        },
      });
    }
  }
}
