import { HttpClient } from '@angular/common/http';
import {  Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, combineLatest, Observable, of, throwError } from 'rxjs';
import { take, catchError, flatMap, map, filter, tap } from 'rxjs/operators';

import { PE_ENV, EnvironmentConfigInterface as EnvInterface } from '@pe/common';
import { FinexpStorageAbstractService } from '@pe/finexp-app';
import { SantanderDkProductInterface, PaymentOptionsInterface } from '@pe/finexp-app/finexp-editor/src/interfaces';
import { SnackbarService } from '@pe/snackbar';
import { TranslateService } from '@pe/i18n';

import {
  IntegrationCategory,
  CheckoutChannelSetInterface,
  CheckoutInterface,
  CheckoutSettingsInterface,
  InstalledConnectionInterface,
  CheckoutConnectionInterface,
  IntegrationInfoInterface,
  SectionAvailableInterface,
  BusinessInterface,
  BusinessNotificationSettingsInterface,
} from '../interfaces';

import { ApiService, UserBusinessInterface } from './api.service';


interface InstalledConnectionsStateInterface {
  subject: BehaviorSubject<InstalledConnectionInterface[]>;
  processed: boolean;
}

@Injectable()
export class StorageService implements FinexpStorageAbstractService { // TODO Cleanup

  // activeModalPanelName$: BehaviorSubject<PanelType> = new BehaviorSubject<PanelType>(null);
  // $checkoutData: BehaviorSubject<AllCheckoutsDataInterface> = new BehaviorSubject<AllCheckoutsDataInterface>(null);
  // $activeLanguages: BehaviorSubject<LanguageInterface[]> = new BehaviorSubject<LanguageInterface[]>([]);

  private checkoutsSubject: BehaviorSubject<CheckoutInterface[]> = new BehaviorSubject<CheckoutInterface[]>(null);
  private checkoutsProcessed = false;
  private checkoutsBusinessUuid: string = null;

  private checkoutUpdateSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  public readonly checkoutUpdate$ = this.checkoutUpdateSubject.asObservable();

  private integrationsInfoSubject: BehaviorSubject<IntegrationInfoInterface[]> =
  new BehaviorSubject<IntegrationInfoInterface[]>(null);

  private integrationsInfoProcessed = false;
  private integrationsInfoBusinessUuid: string = null;

  private businessConnectionsSubject: BehaviorSubject<CheckoutConnectionInterface[]> =
  new BehaviorSubject<CheckoutConnectionInterface[]>(null);

  private businessConnectionsProcessed = false;
  private businessConnectionsBusinessUuid: string = null;

  private installedConnectionsSubject: BehaviorSubject<InstalledConnectionInterface[]> =
  new BehaviorSubject<InstalledConnectionInterface[]>(null);

  private installedConnectionsProcessed = false;
  private installedConnectionsBusinessUuid: string = null;

  private installedCheckoutConnections: { [key: string]: InstalledConnectionsStateInterface } = {};

  private channelSetsSubject: BehaviorSubject<CheckoutChannelSetInterface[]> =
  new BehaviorSubject<CheckoutChannelSetInterface[]>(null);

  private channelSetsProcessed = false;
  private channelSetsBusinessUuid: string = null;

  private businessInfoSubject: BehaviorSubject<BusinessInterface> = new BehaviorSubject<BusinessInterface>(null);
  private businessInfoProcessed = false;
  private businessInfoBusinessUuid: string = null;

  private currencySubject: BehaviorSubject<string> = new BehaviorSubject<string>(null);
  private currencyProcessed = false;

  private paymentsOptionsSubject: BehaviorSubject<PaymentOptionsInterface[]> =
  new BehaviorSubject<PaymentOptionsInterface[]>(null);

  private paymentsOptionsProcessed = false;
  private paymentsOptionsCurrency: string = null;

  private phoneNumbersSubject: BehaviorSubject<string[]> = new BehaviorSubject<string[]>([]);

  private enabledIntergrations: {
    [key: string]: {
      businessUuid: string,
      subject: BehaviorSubject<string[]>,
      processed: boolean
    }
  } = {};

  private apiService: ApiService = this.injector.get(ApiService);
  private http: HttpClient = this.injector.get(HttpClient);
  private router: Router = this.injector.get(Router);
  private translateService: TranslateService = this.injector.get(TranslateService);
  // tslint:disable-next-line
  private snackBarService: SnackbarService = this.injector.get(SnackbarService);
  private env: EnvInterface = this.injector.get(PE_ENV);

  constructor(
    protected injector: Injector
  ) {
  }

  resetCache(): void {

    this.checkoutsSubject = new BehaviorSubject<CheckoutInterface[]>(null);
    this.checkoutsProcessed = false;

    this.integrationsInfoSubject = new BehaviorSubject<IntegrationInfoInterface[]>(null);
    this.integrationsInfoProcessed = false;

    this.businessConnectionsSubject = new BehaviorSubject<CheckoutConnectionInterface[]>(null);
    this.businessConnectionsProcessed = false;

    this.installedConnectionsSubject = new BehaviorSubject<InstalledConnectionInterface[]>(null);
    this.installedConnectionsProcessed = false;

    this.installedCheckoutConnections = {};

    this.channelSetsSubject = new BehaviorSubject<CheckoutChannelSetInterface[]>(null);
    this.channelSetsProcessed = false;

    this.businessInfoSubject = new BehaviorSubject<BusinessInterface>(null);
    this.businessInfoProcessed = false;

    this.currencySubject = new BehaviorSubject<string>(null);
    this.currencyProcessed = false;

    this.paymentsOptionsSubject = new BehaviorSubject<PaymentOptionsInterface[]>(null);
    this.paymentsOptionsProcessed = false;

    this.phoneNumbersSubject = new BehaviorSubject<string[]>([]);

    this.enabledIntergrations = {};
  }

  get businessUuid() {
    const businessUuid = window.location.pathname.split('/')[2];
    if (businessUuid) {
      // We have to use that hack because something is wrong with angular redirects. If we open this link:
      // https://cosf-1182.test.devpayever.com/business/27fbce35-bd45-4b27-a142-14238d88cff5/checkout
      // It calls BaseCurrentCheckoutResolver.canActivate() for empty path. As result we don't have businessId
      window['pe_checkoutApp_lastBusinessId'] = businessUuid;
    }

    return businessUuid || window['pe_checkoutApp_lastBusinessId'];
  }

  get phoneNumbers$(): Observable<string[]> {
    return this.phoneNumbersSubject.asObservable();
  }

  emitUpdateCheckoutSubject() {
    this.checkoutUpdateSubject.next(true);
  }

  getHomeUrl(checkoutUuid: string): string {
    return `business/${this.businessUuid}/checkout/${checkoutUuid}/panel-checkout`;
  }

  getHomeSettingsUrl(checkoutUuid: string): string {
    return `business/${this.businessUuid}/checkout/${checkoutUuid}/panel-settings`;
  }

  getHomeChannelsUrl(checkoutUuid: string): string {
    return `business/${this.businessUuid}/checkout/${checkoutUuid}/panel-channels`;
  }

  getConnectAppUrl(): string {
    return `business/${this.businessUuid}/connect`;
  }

  /*
  fetchAllCheckoutsData(): Observable<AllCheckoutsDataInterface> {
    // return this.http.get<AllCheckoutsDataInterface>(this.urlBackend + this.businessUuid)
    return this.apiService.fetchAllCheckoutsData(this.businessUuid)
      .pipe(tap(checkoutData => {
        this.$checkoutData.next(checkoutData);
      }));
  }*/

  getCheckouts(reset: boolean = false): Observable<CheckoutInterface[]> {
    if (!this.checkoutsProcessed || this.businessUuid !== this.checkoutsBusinessUuid || reset) {
      this.checkoutsBusinessUuid = this.businessUuid;
      this.checkoutsProcessed = true;
      this.checkoutsSubject.next(null);

      this.apiService.getCheckouts(this.businessUuid).pipe(
        catchError((error: any) => {
          return of([]);
        })
      ).subscribe((data: CheckoutInterface[]) => this.checkoutsSubject.next(data));
    }

    return this.checkoutsSubject.asObservable();
  }

  getCheckoutSectionsAvailable(checkoutUuid: string): Observable<SectionAvailableInterface[]> {
    return this.apiService.getCheckoutSectionsAvailable(this.businessUuid, checkoutUuid);
  }

  getUserBusiness(): Observable<UserBusinessInterface> {
    return this.apiService.getUserBusiness(this.businessUuid);
  }

  getGlobalSections(): Observable<any> {
    // TODO Move .get() to API service
    return this.http.get<any>(`${this.env.backend.checkout}/api/sections`);
  }

  getCheckoutById(id: string, reset: boolean = false): Observable<CheckoutInterface> {
    return this.getCheckouts(reset).pipe(
      map((checkouts) => {
        const result = checkouts ? (checkouts.find(checkout => checkout._id === id)) : null;
        if (!result && checkouts) {
          console.warn('Cant find checkout in list', id, checkouts);
        }

        return result;
      })
    );
  }

  getCheckoutByChannelSetId(channelSetId: string): Observable<CheckoutInterface> {
    return combineLatest(
      this.getChannelSets().pipe(filter(channelSets => !!channelSets)),
      this.getCheckouts().pipe(filter(checkouts => !!checkouts))
    )
      .pipe(map(([channelSets, checkouts]) => {
        let checkout: CheckoutInterface;
        if (channelSets && checkouts) {
          const channelSet: CheckoutChannelSetInterface = (channelSets as CheckoutChannelSetInterface[])
            .find(_channelSet => _channelSet.id === channelSetId);
          if (channelSet) {
            checkout = (checkouts as CheckoutInterface[]).find(_checkout => _checkout._id === channelSet.checkout);
          }
        }

        return checkout;
      }));
  }

  getCheckoutByChannelSetIdOnce(channelSetId: string): Observable<CheckoutInterface> {
    return this.getCheckoutByChannelSetId(channelSetId).pipe(
      filter(checkout => !!checkout), take(1)
    );
  }

  getDefaultCheckout(reset: boolean = false): Observable<CheckoutInterface> {
    return this.getCheckouts(reset).pipe(
      map(checkouts => checkouts ? (checkouts.find(checkout => checkout.default) || checkouts[0]) : null)
    );
    /*
    const data: AllCheckoutsDataInterface = this.$checkoutData.value;
    if (data) {
      const checkoutList = data.hasOwnProperty('checkoutList');
      if (checkoutList) {
        if (data.checkoutList.length === 1) {
          // this.checkoutUuid = data.checkoutList[0]._id;
          return data.checkoutList[0];
        } else {
          return data.checkoutList.find(checkout => {
            // this.checkoutUuid = checkout._id;
            return checkout.active === true;
          });
        }
      }
    }*/
  }

  getDefaultCheckoutOnce(reset: boolean = false): Observable<CheckoutInterface> {
    return this.getDefaultCheckout(reset).pipe(filter(d => !!d), take(1));
  }

  getIntegrationsInfoOnce(reset: boolean = false): Observable<IntegrationInfoInterface[]> {
    return this.getIntegrationsInfo(reset).pipe(filter(d => !!d), take(1));
  }

  getIntegrationInfoOnce(name: string, reset: boolean = false): Observable<IntegrationInfoInterface> {
    return this.getIntegrationInfo(name, reset).pipe(filter(d => !!d), take(1));
  }

  getCheckoutByIdOnce(id: string, reset: boolean = false): Observable<CheckoutInterface> {
    return this.getCheckoutById(id, reset).pipe(this.catchErrorPipe(), filter(d => !!d), take(1));
  }

  getCheckoutsOnce(reset: boolean = false): Observable<CheckoutInterface[]> {
    return this.getCheckouts(reset).pipe(filter(d => !!d), take(1));
  }

  getCheckoutEnabledIntegrationsOnce(checkoutId: string): Observable<string[]> {
    return this.getCheckoutEnabledIntegrations(checkoutId).pipe(filter(d => !!d), take(1));
  }

  fetchPhoneNumbers(reset: boolean = false): Observable<string[]> {
    const integrationName = 'twilio'; // TODO For now only Twilio but in future can be more

    return this.getInstalledConnections(reset).pipe(filter(d => !!d), take(1), flatMap((connections) => {
      const connection = connections.find(c => c.integration === integrationName);

      return !connection ? [] : this.apiService.fetchPhoneNumbersAction(
      this.businessUuid, connection._id, integrationName
      )
        .pipe(
          tap((numbers: string[]) => this.phoneNumbersSubject.next(numbers))
        );
    }));
  }

  /*
  getInstalledCommunicationIntegration(): InstalledAppsIntegrationInterface {
    const data: AllCheckoutsDataInterface = this.$checkoutData.value;
    if (data) {
        // only one sms provider can be installed once by requirements
      const communications = data.installedIntegrations.filter((x: any) => x.integrationCategory === 'communications');
      if (communications.length) {
        return communications[0];
      }
    }
    return null;
  }

  getShopList() {
    const businessUuid = this.businessUuid;
    const url = `${this.getConfig().shops}/api/stores/${businessUuid}`; // TODO Not fully sure that it's good idea to take from other BE
    return this.http.get(url);
  }

  getPosList() {
    const businessUuid = this.businessUuid;
    const url = `${this.getConfig().pos}/api/terminals/${businessUuid}`; // TODO Not fully sure that it's good idea to take from other BE
    return this.http.get(url);
  }

  updateTerminal(terminalUuid: string, terminalData: PosTerminalInterface): Observable<PosTerminalInterface> {
    const businessUuid = this.businessUuid;
    const url: string = `${this.getConfig().pos}/api/terminals/${businessUuid}/${terminalUuid}`;
    return this.http.patch<PosTerminalInterface>(url, terminalData);
  }

  updateStore(storeUuid: string, storeData: StoreInterface): Observable<StoreInterface> {
    const businessUuid = this.businessUuid;
    const url: string = `${this.getConfig().shops}/api/stores/${businessUuid}/${storeUuid}`;
    return this.http.patch<StoreInterface>(url, storeData);
  }

  updatePayment(element: CheckoutPaymentInterface) {
    // this.getDefaultCheckout();
    const businessUuid = this.businessUuid;
    const elementId = element.uuid;
    return this.http.patch(`${this.urlBackend + businessUuid}/${this.checkoutUuid}/payment/${elementId}`, element);
  }

  updateIntegration(element: CheckoutPaymentInterface) {
    // this.getDefaultCheckout();
    const businessUuid = this.businessUuid;
    const elementId = element.uuid;
    return this.http.patch(`${this.urlBackend + businessUuid}/${this.checkoutUuid}/integration/${elementId}`, element);
  }

  updateCheckoutProfile(element: CheckoutInterface) {
    const businessUuid = this.businessUuid;
    const homeUrl = this.getHomeUrl();
    const elementId = element._id;
    return this.http.patch(`${this.urlBackend + businessUuid}/checkout/${elementId}`, element);
    // .subscribe(() => {
    //   // this.router.navigate([`${homeUrl}`]); // TODO weired navigation
    // });
  }*/

  makeCreateCheckoutLink(channelSetId: string, locale: string): string {
    return `${this.env.frontend.checkoutWrapper}/${locale}/pay/create-flow/channel-set-id/${channelSetId}`;
  }

  saveCheckout(checkoutId: string, data: CheckoutInterface): Observable<CheckoutInterface> {
    const businessUuid = this.businessUuid;

    return this.apiService.saveCheckout(businessUuid, checkoutId, data).pipe(
      this.catchErrorPipe(),
      flatMap((newData) => {
        return combineLatest(
          this.getCheckoutsOnce(true),
          this.getIntegrationsInfoOnce(true),
          this.getChannelSetsOnce(true)
        ).pipe(map(() => {
          return newData;
        }));
      })
    );
  }

  saveCheckoutSettings(checkoutId: string, data: CheckoutSettingsInterface): Observable<CheckoutInterface> {
    return this.saveCheckout(checkoutId, { settings: data });
  }

  saveCheckoutSections(checkoutId: string, sections: any): Observable<CheckoutInterface> { // TODO Replace any
    // this.getDefaultCheckout();
    // const businessUuid: string = this.businessUuid;
    // return this.http.put(`${this.urlBackend + businessUuid}/${this.checkoutUuid}/sections`, sections);
    return this.saveCheckout(checkoutId, { sections: sections });
  }

  setDefaultCheckout(checkoutId: string): Observable<void> {
    const businessUuid = this.businessUuid;

    return this.apiService.setDefaultCheckout(businessUuid, checkoutId).pipe(this.catchErrorPipe(), flatMap((data) => {
      return this.getCheckoutsOnce(true).pipe(map(() => {
        return null;
      }));
    }));
  }

  /*
  deleteCheckoutProfile(uuid: string): Observable<any> { // TODO specify interface
    // const homeUrl = this.getHomeUrl();
    // const data = this.$checkoutData.value;
    // const checkoutList = data.checkoutList;
    // const index = checkoutList.findIndex(checkout => checkout._id === uuid);
    return this.http.delete(`${this.urlBackend + this.businessUuid}/checkout/${uuid}`);
    // .subscribe(() => {
    //   checkoutList.splice(index, 1);
    //   if (checkoutList.length >= 1) {
    //     this.router.navigate([`${homeUrl}/switch-checkout`]);
    //   } else {
    //     this.router.navigate([`${homeUrl}/create-checkout`]);
    //   }
    // });
  }*/

  addNewCheckout(newCheckout: CheckoutInterface): Observable<CheckoutInterface> {
    const businessUuid = this.businessUuid;

    return this.apiService.addNewCheckout(businessUuid, newCheckout).pipe(this.catchErrorPipe(), flatMap((data) => {
      return combineLatest(this.getCheckoutsOnce(true),
      this.getIntegrationsInfoOnce(true), this.getChannelSetsOnce(true)).pipe(map(() => {
        return data;
      }));
    }));
  }

  deleteCheckout(checkoutId: string): Observable<void> {
    const businessUuid = this.businessUuid;

    return this.apiService.deleteCheckout(businessUuid, checkoutId).pipe(this.catchErrorPipe(), flatMap((data) => {
      return combineLatest(this.getCheckoutsOnce(true),
      this.getIntegrationsInfoOnce(true), this.getChannelSetsOnce(true)).pipe(map(() => {
        return null;
      }));
    }));
  }

  getIntegrationsInfo(reset: boolean = false): Observable<IntegrationInfoInterface[]> {
    if (!this.integrationsInfoProcessed || this.businessUuid !== this.integrationsInfoBusinessUuid || reset) {
      this.integrationsInfoBusinessUuid = this.businessUuid;
      this.integrationsInfoProcessed = true;
      this.integrationsInfoSubject.next(null);

      this.apiService.getIntegrationsInfo(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: IntegrationInfoInterface[]) => this.integrationsInfoSubject.next(data));
    }

    return this.integrationsInfoSubject.asObservable();
  }

  getCategoryInstalledIntegrationsInfo(
    category: IntegrationCategory | IntegrationCategory[],
    reset: boolean = false
  ): Observable<IntegrationInfoInterface[]> {
    const categories = category instanceof Array ? category : [category];

    return this.getIntegrationsInfo(reset).pipe(map((data) => {
      if (data) {
        data = data.filter(item => item.installed && categories.indexOf(item.integration.category) >= 0);
      }

      return data;
    }));
  }

  getIntegrationInfo(name: string, reset: boolean = false): Observable<IntegrationInfoInterface> {
    return this.getIntegrationsInfo(reset).pipe(map((data) => {
      let result: IntegrationInfoInterface = null;
      if (data) {
        result = data.find(item => item.integration.name === name);
      }

      return result;
    }));
  }

  getCheckoutEnabledIntegrations(checkoutId: string, reset: boolean = false): Observable<string[]> {
    if (!this.enabledIntergrations[checkoutId]) {
      this.enabledIntergrations[checkoutId] = {
        businessUuid: null,
        subject: new BehaviorSubject<string[]>(null),
        processed: false,
      };
    }
    const ref = this.enabledIntergrations[checkoutId];
    if (!ref.processed || reset || ref.businessUuid !== this.businessUuid) {
      ref.businessUuid = this.businessUuid;
      ref.processed = true;
      ref.subject.next(null);

      this.apiService.getCheckoutEnabledIntegrations(this.businessUuid, checkoutId).subscribe((data) => {
        ref.subject.next(data);
      });
    }

    return ref.subject.asObservable();
  }

  toggleCheckoutIntegration(checkoutId: string, integrationName: string, enable: boolean): Observable<void> {
    const businessUuid = this.businessUuid;

    return this.apiService.toggleCheckoutIntegration(
      businessUuid, checkoutId, integrationName, enable
    ).pipe(this.catchErrorPipe(), flatMap((data) => {
      return this.getCheckoutEnabledIntegrations(checkoutId, true).pipe(filter(d => !!d), take(1), map(() => {
        return null;
      }));
    }));
  }

  getInstalledConnections(reset: boolean = false): Observable<InstalledConnectionInterface[]> {
    if (!this.installedConnectionsProcessed || this.businessUuid !== this.installedConnectionsBusinessUuid || reset) {
      this.installedConnectionsBusinessUuid = this.businessUuid;
      this.installedConnectionsProcessed = true;
      this.installedConnectionsSubject.next(null);

      this.apiService.getInstalledConnections(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutConnectionInterface[]) => {
          this.installedConnectionsSubject.next(data);
        });
    }

    return this.installedConnectionsSubject.asObservable();
  }

  getInstalledCheckoutConnections(checkoutId: string, reset: boolean = false):
  Observable<InstalledConnectionInterface[]> {
    if (!this.installedCheckoutConnections[checkoutId]) {
      this.installedCheckoutConnections[checkoutId] = {
        subject: new BehaviorSubject<InstalledConnectionInterface[]>(null),
        processed: false,
      };
    }
    const state = this.installedCheckoutConnections[checkoutId];
    if (!state.processed || reset) {
      state.processed = true;
      state.subject.next(null);

      this.apiService.getInstalledCheckoutConnections(this.businessUuid, checkoutId).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutConnectionInterface[]) => {
          state.subject.next(data);
        });
    }

    return state.subject.asObservable();
  }

  getBusinessConnections(reset: boolean = false): Observable<CheckoutConnectionInterface[]> {
    if (!this.businessConnectionsProcessed || this.businessUuid !== this.businessConnectionsBusinessUuid || reset) {
      this.businessConnectionsBusinessUuid = this.businessUuid;
      this.businessConnectionsProcessed = true;
      this.businessConnectionsSubject.next(null);

      this.apiService.getBusinessConnections(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutConnectionInterface[]) => {
          this.businessConnectionsSubject.next(data);
        });
    }

    return this.businessConnectionsSubject.asObservable();
  }

  getPaymentOptions(currency: string, reset: boolean = false): Observable<PaymentOptionsInterface[]> {
    if (!this.paymentsOptionsProcessed || currency !== this.paymentsOptionsCurrency || reset) {
      this.paymentsOptionsCurrency = currency;
      this.paymentsOptionsProcessed = true;
      this.paymentsOptionsSubject.next(null);

      this.apiService.getPaymentOptions(currency).pipe(this.catchErrorPipe())
        .subscribe((data: PaymentOptionsInterface[]) => this.paymentsOptionsSubject.next(data));
    }

    return this.paymentsOptionsSubject.asObservable();
  }

  toggleCheckoutConnection(checkoutId: string, connectionId: string, enable: boolean): Observable<void> {
    return this.apiService.toggleCheckoutConnection(
      this.businessUuid, checkoutId, connectionId, enable
    ).pipe(this.catchErrorPipe(), flatMap((data) => {
      return this.getInstalledCheckoutConnections(checkoutId, true).pipe(filter(d => !!d), take(1), map(() => {
        return null;
      }));
    }));
  }

  getCurrencyByChannelSetId(channelSetId: string, reset: boolean = false): Observable<string> {
    if (!this.currencyProcessed || reset) {
      this.currencyProcessed = true;
      this.currencySubject.next(null);

      this.apiService.getCurrencyByChannelSetId(channelSetId).pipe(this.catchErrorPipe())
        .subscribe((data: string) => this.currencySubject.next(data));
    }

    return this.currencySubject.asObservable();
  }

  getCurrencyByChannelSetIdOnce(channelSetId: string, reset: boolean = false): Observable<string> {
    return this.getCurrencyByChannelSetId(channelSetId, reset).pipe(filter(d => !!d), take(1));
  }

  getChannelSets(reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    if (!this.channelSetsProcessed || this.businessUuid !== this.channelSetsBusinessUuid || reset) {
      this.channelSetsBusinessUuid = this.businessUuid;
      this.channelSetsProcessed = true;
      this.channelSetsSubject.next(null);

      this.apiService.getChannelSets(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: CheckoutChannelSetInterface[]) => this.channelSetsSubject.next(data));
    }

    return this.channelSetsSubject.asObservable();
  }

  getChannelSetsForCheckout(checkoutId: string, reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    // TODO Better to use this.apiService.getCheckoutChannelSets() instead to avoid filtering
    return this.getChannelSets(reset).pipe(map((d) => {
      return d ? d.filter(item => item.checkout === checkoutId) : null;
    }));
  }

  getChannelSetsForCheckoutOnce(checkoutId: string, reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSetsForCheckout(checkoutId, reset).pipe(take(1));
  }

  // tslint:disable:max-line-length
  getChannelSetsForCheckoutByType(checkoutId: string, channelType: string, reset: boolean = false):
  Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSetsForCheckout(checkoutId, reset).pipe(map((d) => {
      return d ? d.filter(item => item.type === channelType) : null;
    }));
  }

  getChannelSetsOnce(reset: boolean = false): Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSets(reset).pipe(filter(d => !!d), take(1));
  }

  getChannelSetsForCheckoutByTypeOnce(checkoutId: string, channelType: string, reset: boolean = false):
  Observable<CheckoutChannelSetInterface[]> {
    return this.getChannelSetsForCheckoutByType(checkoutId, channelType, reset).pipe(filter(d => !!d), take(1));
  }

  attachChannelSetToCheckout(channelSetId: string, checkoutId: string): Observable<void> {
    return this.apiService.attachChannelSetToCheckout(
      this.businessUuid, channelSetId, checkoutId
    ).pipe(this.catchErrorPipe(), flatMap((data) => {
      return this.getChannelSets(true).pipe(filter(d => !!d), take(1), map(() => {
        return null;
      }));
    }));
  }

  patchChannelSet(channelSetId: string, policyEnabled: boolean): Observable<void> {
    // tslint:disable:max-line-length
    return this.apiService.patchChannelSet(
      this.businessUuid, channelSetId, policyEnabled
    ).pipe(this.catchErrorPipe(), flatMap((data) => {
      return this.getChannelSets(true).pipe(filter(d => !!d), take(1), map(() => {
        return null;
      }));
    }));
  }

  isChannelSetAttached(channelSets: CheckoutChannelSetInterface[],
    channelSetId: string, channelSetType: string, checkoutId: string): boolean {
    if (channelSets && channelSetId && channelSetType && checkoutId) {
      return channelSets.some((channelSet: CheckoutChannelSetInterface) => {
        return channelSet.id === channelSetId && channelSet.type ===
        channelSetType && channelSet.checkout === checkoutId;
      });
    }

    return false;
  }

  private catchErrorPipe(): any {
    return catchError((error: any) => {
      if (error.status === 403) {
        error.message = this.translateService.translate('errors.forbidden');
      }

      this.showError(error.message);

      return of(null);
    });
  }

  showError(error: string): void {
    this.snackBarService.toggle(true, {
      content: error || 'Unknown error',
      duration: 5000,
      iconId: 'icon-alert-24',
      iconSize: 24,
    });
  }

  getBusiness(reset: boolean = false): Observable<BusinessInterface> {
    if (!this.businessInfoProcessed || this.businessUuid !== this.businessInfoBusinessUuid || reset) {
      this.businessInfoBusinessUuid = this.businessUuid;
      this.businessInfoProcessed = true;
      this.businessInfoSubject.next(null);

      this.apiService.getBusiness(this.businessUuid).pipe(this.catchErrorPipe())
        .subscribe((data: BusinessInterface) => this.businessInfoSubject.next(data));
    }

    return this.businessInfoSubject.asObservable();
  }

  getSantanderDkProductsEx(channelSet: string, reset: boolean = false): Observable<SantanderDkProductInterface[]> {
    // For now we don't use cache
    return this.apiService.getSantanderDkProductsEx(this.businessUuid, channelSet);
  }

  getCheckoutNotificationSettingsOnce(): Observable<BusinessNotificationSettingsInterface[]> {
    return this.apiService.getCheckoutSettings(this.businessUuid);
  }

  saveCheckoutNotificationSettings(settings: BusinessNotificationSettingsInterface[]): Observable<void> {
    return this.apiService.patchCheckoutSettings(this.businessUuid, settings);
  }
}
