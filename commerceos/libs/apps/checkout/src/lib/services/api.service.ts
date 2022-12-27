import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { mergeMap, map } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { FinexpApiAbstractService } from '@pe/finexp-app';
import { PaymentOptionsInterface, SantanderDkProductInterface, DefaultConnectionInterface } from '@pe/finexp-app';
import { CustomWidgetConfigInterface, WidgetConfigInterface, WidgetTypeEnum } from '@pe/payment-widgets-sdk';

import {
  CheckoutChannelSetInterface,
  IntegrationInfoInterface,
  IntegrationConnectInfoInterface,
  CheckoutInterface,
  SectionAvailableInterface,
  BusinessInterface,
  InstalledConnectionInterface,
  CheckoutConnectionInterface,
  BusinessNotificationSettingsInterface,
} from '../interfaces';

export interface UserBusinessInterface {
  _id: string;
  name: string;
  active: boolean;
  currency: string;
}

@Injectable()
export class ApiService implements FinexpApiAbstractService {

  private readonly finExpIntegrationCode: string = 'finance-express';

  constructor(
    @Inject(PE_ENV) private env: EnvInterface,
    private http: HttpClient
  ) {
  }

  fetchPhoneNumbersAction(businessId: string, connectionId: string, thirdPartyName: string): Observable<string[]> {
    const actionName = 'get-numbers';

    return this.http.post<string[]>(
      `${this.env.thirdParty.communications}/api/business/${businessId}/connection/${connectionId}/action/${actionName}`,
      {}
    );
  }

  /*
  fetchAllCheckoutsData(businessId: string): Observable<AllCheckoutsDataInterface> {
    return this.http.get<AllCheckoutsDataInterface>(`${this.getConfig().checkout}/api/business/${businessId}/checkout`);
  }*/
  getCheckouts(businessId: string): Observable<CheckoutInterface[]> {
    if (!businessId) {
      console.error('Invalid business id!');
      //debugger;
    }

    return this.http.get<CheckoutInterface[]>(`${this.env.backend.checkout}/api/business/${businessId}/checkout`);
  }

  getCheckoutSectionsAvailable(businessId: string, checkoutUuid: string): Observable<SectionAvailableInterface[]> {
    return this.http.get<SectionAvailableInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutUuid}/sections/available`
    );
  }

  getUserBusiness(businessId: string): Observable<UserBusinessInterface> {
    return this.http.get<UserBusinessInterface>(`${this.env.backend.users}/api/business/${businessId}`);
  }

  addNewCheckout(businessId: string, data: CheckoutInterface): Observable<CheckoutInterface> {
    return this.http.post<CheckoutInterface>(`${this.env.backend.checkout}/api/business/${businessId}/checkout`, data);
  }

  deleteCheckout(businessId: string, checkoutId: string): Observable<void> {
    return this.http.delete<void>(`${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}`);
  }

  saveCheckout(businessId: string, checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface> {
    return this.http.patch<CheckoutInterface>(`${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}`, data).pipe(map((d) => {
      return d || { ...data, _id: checkoutId }; // Small fix required because BE doesn't return result
    }));
  }

  setDefaultCheckout(businessId: string, checkoutId: string): Observable<void> {
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/default`, {});
  }

  getChannelSets(businessId: string): Observable<CheckoutChannelSetInterface[]> {
    return this.http.get<CheckoutChannelSetInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/channelSet`);
  }

  getCheckoutChannelSets(businessId: string, checkoutId: string): Observable<CheckoutChannelSetInterface[]> {
    return this.http.get<CheckoutChannelSetInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/channelSet/checkout/${checkoutId}`);
  }

  attachChannelSetToCheckout(businessId: string, channelSetId: string, checkoutId: string): Observable<void> {
    // tslint:disable:max-line-length
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/business/${businessId}/channelSet/${channelSetId}/checkout`, { checkoutId: checkoutId });
  }

  patchChannelSet(businessId: string, channelSetId: string, policyEnabled: boolean): Observable<void> {
    // tslint:disable:max-line-length
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/business/${businessId}/channelSet/${channelSetId}`, { policyEnabled: policyEnabled });
  }

  getCurrencyByChannelSetId(channelSetId: string): Observable<string> {
    return this.http.get<{ currency: string }>(
      `${this.env.backend.checkout}/api/flow/channel-set/${channelSetId}/currency`).pipe(map(data => data.currency));
  }

  patchCheckoutSettings(businessId: string, settings: BusinessNotificationSettingsInterface[]): Observable<void> {
    return this.http.patch<void>(
      `${this.env.backend['errorNotifications']}/api/business/${businessId}/settings`, settings);
  }

  getCheckoutSettings(businessId: string): Observable<BusinessNotificationSettingsInterface[]> {
    return this.http.get<BusinessNotificationSettingsInterface[]>(
      `${this.env.backend['errorNotifications']}/api/business/${businessId}/settings`);
  }

  getIntegrationsInfo(businessId: string): Observable<IntegrationInfoInterface[]> {
    return this.http.get<IntegrationInfoInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/integration`);
  }

  getCheckoutEnabledIntegrations(businessId: string, checkoutId: string): Observable<string[]> {
    return this.http.get<string[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/integration`);
  }

  toggleCheckoutIntegration(businessId: string, checkoutId: string,
    integrationName: string, enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/integration/${integrationName}/${enable ? 'install' : 'uninstall'}`,
      {}
    );
  }

  getInstalledConnections(businessId: string): Observable<CheckoutConnectionInterface[]> {
    return this.http.get<CheckoutConnectionInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/connection`);
  }

  getInstalledCheckoutConnections(businessId: string, checkoutId: string): Observable<CheckoutConnectionInterface[]> {
    return this.http.get<CheckoutConnectionInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/connection`);
  }

  getBusinessConnections(businessId: string): Observable<InstalledConnectionInterface[]> {
    return this.http.get<InstalledConnectionInterface[]>(
      `${this.env.backend.checkout}/api/business/${businessId}/connection`);
  }

  toggleCheckoutConnection(businessId: string, checkoutId: string,
    connectionId: string, enable: boolean): Observable<void> {
    return this.http.patch<void>(
      `${this.env.backend.checkout}/api/business/${businessId}/checkout/${checkoutId}/connection/${connectionId}/${enable ? 'install' : 'uninstall'}`,
      {}
    );
  }

  // FINANCE EXPRESS API

  getWidgets(businessId: string, checkoutId: string): Observable<WidgetConfigInterface[]> {
    return this.http.post<CustomWidgetConfigInterface[]>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/get-widgets`,
      { checkoutId }
    );
  }

  getWidgetSettingsByType(businessId: string, checkoutId: string,
    widgetType: WidgetTypeEnum): Observable<CustomWidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/get-widgets-by-type`,
      { checkoutId, widgetType }
    );
  }

  getWidgetSettingsById(businessId: string, checkoutId: string, widgetId: string): Observable<WidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/get-widgets-by-id`,
      { checkoutId, widgetId }
    );
  }

  createWidgetSettings(businessId: string, data: WidgetConfigInterface): Observable<WidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/widget-create`,
      data
    );
  }

  saveWidgetSettings(businessId: string, widgetId: string, data: WidgetConfigInterface): Observable<WidgetConfigInterface> {
    return this.http.post<CustomWidgetConfigInterface>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/widget-update`,
      { ...data, widgetId }
    );
  }

  deleteWidgetSettings(businessId: string, widgetId: string): Observable<void> {
    return this.http.post<void>(
      `${this.env.backend.webWidgets}/api/app/${this.finExpIntegrationCode}/business/${businessId}/action/widget-delete`,
      { widgetId }
    );
  }

  getConnectIntegrationInfo(businessId: string, integrationId: string): Observable<IntegrationConnectInfoInterface> {
    return this.http.get<IntegrationConnectInfoInterface>
    (`${this.env.backend.connect}/api/integration/${integrationId}`);
  }

  getPaymentOptions(currency: string): Observable<PaymentOptionsInterface[]> {
    return this.http.get<PaymentOptionsInterface[]>(`${this.env.custom.proxy}/api/rest/v1/payment-options`, {
      params: currency ? { _currency: currency } : {},
    });
  }

  // USER API

  getBusiness(businessId: string): Observable<BusinessInterface> {
    return this.http.get<BusinessInterface>(`${this.env.backend.users}/api/business/${businessId}`);
  }

  // Some custom functionality

  getDefaultConnection(channelSet: string, paymentType: string): Observable<DefaultConnectionInterface> {
    return this.http.get<DefaultConnectionInterface>(
      `${this.env.backend.checkout}/api/channel-set/${channelSet}/default-connection/${paymentType}`
    )
  }

  getSantanderDkProductsEx(businessId: string, channelSet: string): Observable<SantanderDkProductInterface[]> {
    return this.http.get<{_id: string}>(
      `${this.env.backend.checkout}/api/channel-set/${channelSet}/default-connection/santander_installment_dk`
    ).pipe(mergeMap((connection) => {
      return this.http.post<SantanderDkProductInterface[]>(
        `${this.env.thirdParty.payments}/api/business/${businessId}/connection/${connection._id}/action/get-products-by-connection`, {}
      );
    }));
  }
}
