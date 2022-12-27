import { Inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { BehaviorSubject,  Observable, of, Subject } from 'rxjs';
import {
  map,
  startWith,
  switchMap,
  take,
  tap,
} from 'rxjs/operators';
import io from 'socket.io-client';


import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { BusinessState } from '@pe/business';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';

import { MessageNameEnum } from '../emums';
import {
  WidgetInfoInterface,
  WidgetTutorialInterface,
} from '../interfaces';

import { EditWidgetsApiService } from './widgets-api.service'

@Injectable()
export class EditWidgetsService {
  @SelectSnapshot(BusinessState.businessUuid) businessUuid: string;

  @Select(BusinessState.businessUuid) businessUuid$: Observable<string>;
  @Select(BusinessState.businessData) businessData$: Observable<any>;
  widgetsSocket: SocketIOClient.Socket;

  public updateList$: Subject<any> = new Subject();
  protected updateTutorials$: Subject<any> = new Subject();
  protected busy$: Subject<any> = new Subject();

  widgetsSubject$ = new Subject<WidgetInfoInterface[]>()
  transactionsDailySubject$ = new BehaviorSubject([])
  transactionsMonthlySubject$ = new BehaviorSubject([])
  invoiceDailySubject$ = new BehaviorSubject([])
  invoiceMonthlySubject$ = new BehaviorSubject([])
  productsWeeklySubject$ = new BehaviorSubject([])
  productsMonthlySubject$ = new BehaviorSubject([])
  connectSubject$ = new BehaviorSubject([])
  mediaSubject$ = new BehaviorSubject([])
  defaultCheckoutSubject$ = new BehaviorSubject(null)
  defaultShopSubject$ = new BehaviorSubject(null)
  defaultSiteSubject$ = new BehaviorSubject(null)
  defaultContactsSubject$ = new BehaviorSubject(null)
  defaultAppointmentsSubject$ = new BehaviorSubject(null)
  blogSubject$ = new BehaviorSubject(null)
  defaultMessageSubject$ = new BehaviorSubject(null)
  defaultSocialSubject$ = new BehaviorSubject(null)
  defaultCouponsSubject$ = new BehaviorSubject(null)
  defaultSubscriptionSubject$ = new BehaviorSubject(null)
  defaultShippingSubject$ = new BehaviorSubject(null)
  defaultSettingsSubject$ = new BehaviorSubject(null)
  defaultPosSubject$ = new BehaviorSubject(null)
  widgetlist:any[]

  widgets$: Observable<WidgetInfoInterface[]> = this.widgetsSubject$.asObservable();

  widgetTutorialsSubject$ = new BehaviorSubject([])

  widgetTutorials$: Observable<WidgetTutorialInterface[]> = this.widgetTutorialsSubject$.asObservable();

  installedWidgets$: Observable<WidgetInfoInterface[]>;

  uninstalledWidgets$: Observable<WidgetInfoInterface[]>;
  connectIntegrations$ = this.connectSubject$.asObservable();

  private requestAttempts: number;

  constructor(
    private authService: PeAuthService,
    private widgetsApiService: EditWidgetsApiService,
    private envService: CosEnvService,
    private router: Router,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {}

  disconnect(){
    const TRANSACTIONS_LAST_DAILY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_TRANSACTIONS_LAST_DAILY
      : MessageNameEnum.BUSINESS_TRANSACTIONS_LAST_DAILY;

    const TRANSACTIONS_LAST_MONTHLY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_TRANSACTIONS_LAST_MONTHLY
      : MessageNameEnum.BUSINESS_TRANSACTIONS_LAST_MONTHLY;

    const INVOICE_LAST_DAILY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_INVOICE_LAST_DAILY
      : MessageNameEnum.BUSINESS_INVOICE_LAST_DAILY;

    const INVOICE_LAST_MONTHLY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_INVOICE_LAST_MONTHLY
      : MessageNameEnum.BUSINESS_INVOICE_LAST_MONTHLY;

    this.widgetsSocket.off(TRANSACTIONS_LAST_DAILY);
    this.widgetsSocket.off(TRANSACTIONS_LAST_MONTHLY);
    this.widgetsSocket.off(INVOICE_LAST_DAILY);
    this.widgetsSocket.off(INVOICE_LAST_MONTHLY);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_WIDGETS);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_STUDIO_APP_LAST);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_PRODUCTS_POPULAR_MONTH_RANDOM);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_PRODUCTS_POPULAR_WEEK_RANDOM);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_CHECKOUT_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_WIDGET_TUTORIAL);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_SHOP_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_SITE_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_CONTACTS_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_BLOGS);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_APPOINTMENT_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_MESSAGE_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_SOCIAL_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_COUPON_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_SETTINGS_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_SHIPPING_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_SUBSCRIPTION_DATA);
    this.widgetsSocket.off(MessageNameEnum.BUSINESS_DEFAULT_POS_TERMINAL_DATA);
    this.widgetsSocket.off(MessageNameEnum.CONNECT_INTEGRATION_NON_INSTALLED);
    this.widgetsSocket.off(MessageNameEnum.ONBOARDING_STATUS);
  }

  connect(){
    this.requestAttempts = 0;

    this.widgetsSocket = io(this.env.backend.widgetsWs, {
      path: '/ws',
      transports: ['websocket'],
      query: {
        token: this.authService.token,
      },
    });

    this.widgetsSocket.on('authenticated', (result) => {
      this.widgetsEvent();

      this.handleDashboardWidget();
      this.handleTransaction();
      this.handleInvoice();
      this.handleStudioWidget();
      this.handleProductsWidget();
      this.handleCheckoutWidget();
      this.handleWidgetTutorial();
      this.handleShopWidget();
      this.handleSiteWidget();
      this.handleContactsWidget();
      this.handleBlogsWidget();
      this.handleAppointmentWidget();
      this.handleMessageWidget();
      this.handleSocialWidget();
      this.handleCouponWidget();
      this.handleSettingsWidget();
      this.handleShippingWidget();
      this.handleSubscriptionWidget();
      this.handlePOSWidget();
      this.handleNonInstalled();
      this.handleOnBoardingStatus();
    });

    this.installedWidgets$ = this.widgets$.pipe(map(list => list.filter(w => w.installed)));
    this.uninstalledWidgets$ = this.widgets$.pipe(map(list => list.filter(w => !w.installed)));
  }

  emitEventWithInterceptor(event, data = {}) {
    this.widgetsSocket.emit(event, {
      token: this.authService.token,
      id: this.businessUuid,
      ...data,
    })
  }

  handleDashboardWidget() {
    const event = this.envService.isPersonalMode ? MessageNameEnum.PERSONAL_WIDGETS : MessageNameEnum.BUSINESS_WIDGETS;
    this.widgetsSocket.on(event, (data) => {
      const installed = data.widgets.filter(w => w.installed);
      this.widgetsSubject$.next(installed.length ? data.widgets : []);
      this.widgetlist = installed.length ? data.widgets : [];
    });
  }

  handleTransaction() {
    const TRANSACTIONS_LAST_DAILY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_TRANSACTIONS_LAST_DAILY
      : MessageNameEnum.BUSINESS_TRANSACTIONS_LAST_DAILY;

    const TRANSACTIONS_LAST_MONTHLY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_TRANSACTIONS_LAST_MONTHLY
      : MessageNameEnum.BUSINESS_TRANSACTIONS_LAST_MONTHLY;

    this.widgetsSocket.on(TRANSACTIONS_LAST_DAILY, (data) => {
      this.transactionsDailySubject$.next(data.transactions);
    });

    this.widgetsSocket.on(TRANSACTIONS_LAST_MONTHLY, (data) => {
      this.transactionsMonthlySubject$.next(data.transactions);
    });
  }

  handleInvoice() {
    const INVOICE_LAST_DAILY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_INVOICE_LAST_DAILY
      : MessageNameEnum.BUSINESS_INVOICE_LAST_DAILY;

    const INVOICE_LAST_MONTHLY = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_INVOICE_LAST_MONTHLY
      : MessageNameEnum.BUSINESS_INVOICE_LAST_MONTHLY;

    this.widgetsSocket.on(INVOICE_LAST_DAILY, (data) => {
      this.invoiceDailySubject$.next(data.invoices);
    });

    this.widgetsSocket.on(INVOICE_LAST_MONTHLY, (data) => {
      this.invoiceMonthlySubject$.next(data.invoices);
    });
  }

  handleStudioWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_STUDIO_APP_LAST, (data) => {
      this.mediaSubject$.next(data.media);
    });
  }

  handleProductsWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_PRODUCTS_POPULAR_MONTH_RANDOM, (data) => {
      this.productsMonthlySubject$.next(data.products);
    });

    this.widgetsSocket.on(MessageNameEnum.BUSINESS_PRODUCTS_POPULAR_WEEK_RANDOM, (data) => {
      this.productsWeeklySubject$.next(data.products);
    });
  }

  handleCheckoutWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_CHECKOUT_DATA, (data) => {
      this.defaultCheckoutSubject$.next({
        checkoutId: data.checkoutId,
        checkoutName: data.checkoutName,
        linkChannelSetId: data.linkChannelSetId,
      });
    });
  }

  handleWidgetTutorial() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_WIDGET_TUTORIAL, (data) => {
      this.widgetTutorialsSubject$.next(data.tutorialList);
    });
  }

  handleShopWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_SHOP_DATA, (data) => {
      this.defaultShopSubject$.next({ shopId: data.shopId, shopLogo: data.shopLogo, shopName: data.shopName });
    });
  }

  handleSiteWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_SITE_DATA, (data) => {
      this.defaultSiteSubject$.next({ siteId: data.siteId, siteLogo: data.siteLogo, siteName: data.siteName });
    });
  }

  handleContactsWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_CONTACTS_DATA, (data) => {
      this.defaultContactsSubject$.next({ data });
    });
  }

  handleBlogsWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_BLOGS, (data) => {
      const mappedData = data.blogs.map((blog) => ({
        title : blog.name,
        logo : blog.picture,
        _id : blog._id,
      }));

      this.blogSubject$.next(mappedData);
    });
  }

  handleAppointmentWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_APPOINTMENT_DATA, (data) => {
      const mappedData = data.appointments.map((item) => ({
        title : item?.note,
        subtitle : item.date.toString(),
        imgSrc : '#icon-commerceos-appointments',
      }));

      this.defaultAppointmentsSubject$.next(mappedData);
    });
  }

  handleMessageWidget() {
    const DEFAULT_MESSAGE_DATA = this.envService.isPersonalMode
      ? MessageNameEnum.PERSONAL_DEFAULT_MESSAGE_DATA
      : MessageNameEnum.BUSINESS_DEFAULT_MESSAGE_DATA;
    this.widgetsSocket.on(DEFAULT_MESSAGE_DATA, (data) => {
      const msgData = data.chats?.map((message) => ({
        imgSrc : message.photo,
        title : message.name,
        id : message._id,
      }));
      this.defaultMessageSubject$.next(msgData);
    });
  }

  handleSocialWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_SOCIAL_DATA, (data) => {
      const socialData = data.channelSet.map((social) => ({
        title : social?.type,
      }));
      this.defaultSocialSubject$.next(socialData);
    });
  }

  handleCouponWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_COUPON_DATA, (data) => {
      this.defaultCouponsSubject$.next({ code: data.coupon?.code, description: data.coupon?.description });
    });
  }

  handleSettingsWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_SETTINGS_DATA, (data) => {
      this.defaultSettingsSubject$.next({ data });
    });
  }

  handleShippingWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_SHIPPING_DATA, (data) => {
      this.defaultShippingSubject$.next({ data });
    });
  }

  handleSubscriptionWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_SUBSCRIPTION_DATA, (data) => {
      this.defaultSubscriptionSubject$.next({ data });
    });
  }

  handlePOSWidget() {
    this.widgetsSocket.on(MessageNameEnum.BUSINESS_DEFAULT_POS_TERMINAL_DATA, (data) => {
      this.defaultPosSubject$.next({
        terminalId: data.terminalId,
        terminalLogo: data.terminalLogo,
        terminalName: data.terminalName,
      });
    });
  }

  handleNonInstalled() {
    this.widgetsSocket.on(MessageNameEnum.CONNECT_INTEGRATION_NON_INSTALLED, (data) => {
      this.connectSubject$.next(data.integrations);
    });
  }

  handleOnBoardingStatus() {
    this.widgetsSocket.on(MessageNameEnum.ONBOARDING_STATUS, (data) => {
      if (data.result) {
        this.requestAttempts = 0;
      } else {
        if (this.requestAttempts < 50) {
          this.requestAttempts = this.requestAttempts + 1;
          this.onboardingStatusEvent();
        } else {
          this.requestAttempts = 0;
          this.disconnect();
        }
      }
    });
  }

  reloadWidgets(): Observable<WidgetInfoInterface> {
    this.busy$ = new Subject();
    this.updateList$.next({});
    this.installedWidgets$.pipe(take(1)).subscribe();

    return this.busy$.pipe(startWith(true));
  }

  onboardingStatusEvent() {
    this.emitEventWithInterceptor(MessageNameEnum.ONBOARDING_STATUS);
  }

  widgetsEvent() {
    const event = this.envService.isPersonalMode ? MessageNameEnum.PERSONAL_WIDGETS : MessageNameEnum.BUSINESS_WIDGETS;

    if (!this.envService.isPersonalMode) {
      this.widgetsSocket.emit(MessageNameEnum.BUSINESS_ROOM_JOIN,
        this.envService.isPersonalMode ? this.authService.getUserData()?.uuid : this.businessUuid,
        () => {
          this.onboardingStatusEvent();
        });

      this.emitEventWithInterceptor(MessageNameEnum.BUSINESS_WIDGET_TUTORIAL);
    }

    this.widgetsSocket.emit(event);
  }

  install(id: string): Observable<WidgetInfoInterface[]> {
    return this.businessUuid$.pipe(
      take(1),
      switchMap(businessUuid => {
        if (!businessUuid || !id) {
          return of([]);
        }

        return this.widgetsApiService.installWidget(businessUuid, id);
      }),
      tap(() => {
        this.updateList$.next({});
      }),
    );
  }

  uninstall(id: string): Observable<WidgetInfoInterface[]> {
    return this.businessUuid$.pipe(
      take(1),
      switchMap(businessUuid => {
        if (!businessUuid || !id) {
          return of([]);
        }

        return this.widgetsApiService.uninstallWidget(businessUuid, id);
      }),
      tap(() => {
        this.updateList$.next({});
      }),
    );
  }

  tutorialWatched(id: string): Observable<WidgetInfoInterface[]> {
    return this.businessUuid$.pipe(
      take(1),
      switchMap(businessUuid => {
        if (!businessUuid || !id) {
          return of([]);
        }

        return this.widgetsApiService.watchedTutorialWidget(businessUuid, id);
      }),
      tap(() => {
        this.updateTutorials$.next({});
      }),
    );
  }
}
