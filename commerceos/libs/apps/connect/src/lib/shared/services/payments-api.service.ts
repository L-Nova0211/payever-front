import { HttpClient } from '@angular/common/http';
import { Inject, Injectable, Injector } from '@angular/core';
import { Params } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';

import { ResponseErrorsInterface } from '../http-interceptors';
import {
  BusinessInterface, VariantListItemInterface,
  PaymentWithVariantInterface,
  PaymentPayloadInterface, PaymentMethodEnum,
} from '../interfaces';

@Injectable()
export class PaymentsApiService {
  constructor(
    private http: HttpClient,
    protected injector: Injector,
    @Inject(PE_ENV) private envConfig: EnvInterface
  ) { }

  // TODO Not sure that right place
  getUserBusiness(businessId: string): Observable<BusinessInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<BusinessInterface>(`${config.users}/api/business/${businessId}`);
  }

  // TODO BE Should return updated value. Now returns nothing
  saveCredentials<T>(data: T, payment: PaymentWithVariantInterface,
    variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(
    `${config.thirdParty}/api/business/${payment.businessUuid}/payments/${payment.option.payment_method}/${variant.id}/credentials/set`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      // TODO Transform error.errors
      console.error(error);

      return throwError(error);
    }));
  }

  resetCredentails(payment: PaymentWithVariantInterface, variant: VariantListItemInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(
    `${config.thirdParty}/api/business/${payment.businessUuid}/payments/${payment.option.payment_method}/${variant.id}/credentials/reset`,
      {}
    );
  }

  enableExternalPaymentMethod(payment: PaymentWithVariantInterface): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(
    `${config.thirdParty}/api/business/${payment.businessUuid}/payments/${payment.option.payment_method}/enable`, {});
  }

  isExternalAuthSuccess(params: Params): boolean {
    return params['enable'] === 'true';
  }

  saveBusinessDocument(business: string, name: string, blobName: string): Observable<void> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;
    const data = {};
    data[name] = blobName;

    return this.http.patch<void>(`${config.users}/api/business/${business}`, {
      documents: data,
    });
  }

  getConnectPaymentPayload(business: string, paymentMethod: PaymentMethodEnum): Observable<PaymentPayloadInterface> {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.get<PaymentPayloadInterface>(
      `${config.connect}/api/business/${business}/payments/${paymentMethod}/payload`,
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      console.error(error);

      return throwError(error);
    }));
  }

  saveConnectPaymentPayload(business: string, paymentMethod: PaymentMethodEnum,
    data: PaymentPayloadInterface): Observable<void> { // TP
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return this.http.patch<void>(
      `${config.connect}/api/business/${business}/payments/${paymentMethod}/payload`,
      data
    ).pipe(catchError((error: ResponseErrorsInterface) => {
      console.error(error);

      return throwError(error);
    }));
  }
}
