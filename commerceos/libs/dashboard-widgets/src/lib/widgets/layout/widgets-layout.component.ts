import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, combineLatest, EMPTY, Observable, of, Subject, timer } from 'rxjs';
import { filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { AppLauncherService } from '@pe/app-launcher';
import { PeAuthService } from '@pe/auth';
import { CosEnvService } from '@pe/base';
import { DashboardDataService } from '@pe/base-dashboard';
import { BusinessInterface, BusinessState } from '@pe/business';
import { AppSetUpStatusEnum, AppThemeEnum, MicroAppInterface, MicroRegistryService } from '@pe/common';
import { DockerState, SetDockerItems } from '@pe/docker';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { EditWidgetsService } from '@pe/shared/widget';
import { PeStepperService } from '@pe/stepper';
import { Widget, WidgetType } from '@pe/widgets';

import { WidgetInfoInterface, WidgetTypeEnum } from '../../interfaces/widget-info.interface';
import { EditMode } from '../edit-overlay/edit-mode.enum';
import { EditOverlayComponent } from '../edit-overlay/edit-overlay.component';

@Component({
  selector: 'widgets-layout',
  templateUrl: './widgets-layout.component.html',
  styleUrls: ['./widgets-layout.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WidgetsLayoutComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @Select(DockerState.dockerItems) apps;
  readonly WidgetTypeEnum: typeof WidgetTypeEnum = WidgetTypeEnum;

  apps$: Observable<any[]>;
  widgets$: Observable<Widget[]>;
  loaded$ = new BehaviorSubject<boolean>(false);

  private destroyed$: Subject<void> = new Subject<void>();

  constructor(
    private authService: PeAuthService,
    private envService: CosEnvService,
    private editWidgetsService: EditWidgetsService,
    private router: Router,
    private apiService: ApiService,
    private microRegistryService: MicroRegistryService,
    private peStepperService: PeStepperService,
    private appLauncherService: AppLauncherService,
    private overlay: PeOverlayWidgetService,
    private store: Store,
    private translateService: TranslateService,
    private dashboardDataService: DashboardDataService,
  ) {
    this.editWidgetsService.connect();

    if (this.envService.isPersonalMode) {
      this.apps$ = this.dashboardDataService.apps$;
    } else {
      this.apps$ = this.apps;
    }
  }

  ngOnInit(): void {
    this.widgets$ = combineLatest([
      this.editWidgetsService.widgets$,
      this.apps$,
    ]).pipe(
      map(([widgets, micros]) => {
        this.loaded$.next(false);

        return widgets
          .map((widget: any) => {
            const micro = micros?.find((m: MicroAppInterface) => m.code === widget.type);

            if (widget.type !== 'apps' && !micro) {
              return null;
            }

            return {
              ...widget,
              installed: micro ? widget.installed && micro.installed : widget.installed,
              setupStatus: micro ? micro.setupStatus : widget.setupStatus,
              installedApp: false,
              defaultApp: (micro && micro.default) || false,
              onInstallAppClick: (appName: string) => {
                return this.onInstallAppClick(appName);
              },
            };
          }).filter((widget: WidgetInfoInterface) => !!widget);
      }),
      map((widgets) => {
        return widgets.filter(w => w.type != 'ads' && w.type != 'marketing' && w.installed);
      }),
      map(widgets => this.fillWidgetsConfigs(widgets)),
      switchMap(widgets => this.handleThemeChanging(widgets)),
      switchMap(widgets => this.handleNotifications(widgets)),
      map(widgets => widgets as Widget[]),
      tap((list) => {
        if (list.length) {
          this.loaded$.next(true);
        }
      }),
      takeUntil(this.destroyed$),
    ) as Observable<Widget[]>;
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
    this.editWidgetsService.disconnect()
  }

  onInstallAppClick(appName: string): Observable<void> {
    const subject = new BehaviorSubject(false);
    const result = subject.asObservable().pipe(
      filter(a => !!a),
      map(() => null),
    );

    const micro = <MicroAppInterface> this.microRegistryService.getMicroConfig(appName);
    if (appName) {
      this.install(appName)
        .pipe(take(1))
        .subscribe(() => {
          if (micro && [AppSetUpStatusEnum.Completed, AppSetUpStatusEnum.Started].indexOf(micro.setupStatus) >= 0) {
            this.appLauncherService.launchApp(appName).subscribe(() => {
              subject.next(true);
              this.editWidgetsService.updateList$.next({});
            });
          } else {
            subject.next(true);
            this.navigateToWelcomeScreen(appName);
          }
        });
    } else {
      subject.next(true);
    }

    return result;
  }

  onOpenButtonClick(appName: WidgetTypeEnum, appUrlPath?: string): Observable<any> {
    appUrlPath = appUrlPath || '';
    const micro: MicroAppInterface = this.microRegistryService.getMicroConfig(appName) as MicroAppInterface;
    if ((micro && micro.setupStatus === AppSetUpStatusEnum.Completed) || this.envService.isPersonalMode) {
      return this.appLauncherService.launchApp(appName, appUrlPath);
    } else {
      const url = `business/${this.businessData._id}/welcome/${appName}`;
      this.router.navigate([url]);

      return EMPTY;
    }
  }

  openEditAppsBox() {
    const onSaveSubject$ = new BehaviorSubject<any>(null);
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: EditOverlayComponent,
      data: {
        mode: EditMode.apps,
      },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        theme: AppThemeEnum[this.businessData?.themeSettings?.theme] || AppThemeEnum.default,
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => { this.overlay.close(); },
        title: this.translateService.translate('edit_apps.title'),
        doneBtnTitle: this.translateService.translate('actions.done'),
        doneBtnCallback: () => { this.overlay.close(); },
        onSaveSubject$,
      },
    };

    const overlayRef: PeOverlayRef = this.overlay.open(config);

    overlayRef.afterClosed.subscribe(() => {
      const apps = onSaveSubject$.value?.apps;
      if (apps) {
        this.store.dispatch(new SetDockerItems(apps));
        this.dashboardDataService.apps(apps);
      }

      const widgets = onSaveSubject$.value?.widgets;
      if (widgets) {
        this.editWidgetsService.widgetsSubject$.next(widgets);
      }
    });

    return of(null);
  }

  private navigateToWelcomeScreen(appName: string): void {
    const micro = <MicroAppInterface> this.microRegistryService.getMicroConfig(appName);
    timer(100).subscribe(() => {
      if (
        micro.setupStatus === AppSetUpStatusEnum.Started &&
        micro.code === 'shop' &&
        this.peStepperService.currentStep
      ) {
        return;
      }
      if (this.envService.isPersonalMode) {
        const url: string[] = [`personal/${this.authService.getUserData().uuid}/${appName}`];
        this.router.navigate(url);
      } else {
        const url: string[] = [`business/${this.businessData._id}/${appName}`];
        this.router.navigate(url);
      }
    });
  }

  private install(appName: string): Observable<any> {
    const micro = <MicroAppInterface> this.microRegistryService.getMicroConfig(appName);
    if (micro) {
      micro.installed = true;
      if (this.envService.isPersonalMode) {
        return this.apiService.userToggleInstalledApp(
          micro._id,
          { installed: true, setupStatus: AppSetUpStatusEnum.Completed },
        );
      } else {
        const businessId: string = this.businessData._id;

        return this.apiService.toggleInstalledApp(businessId, micro._id, { installed: true });
      }
    }

    return EMPTY;
  }

  private fillWidgetsConfigs(widgets: WidgetInfoInterface[]): Widget[] {
    return widgets
      .map((widget) => {
        switch (widget.type) {
          case WidgetTypeEnum.Apps:
            return this.initAppsWidget(widget);
          case WidgetTypeEnum.Appointments:
            return this.initAppointmentsWidget(widget);
          case WidgetTypeEnum.Transactions:
            return this.initTransactionsWidget(widget);
          case WidgetTypeEnum.Shop:
            return this.initStoreWidget(widget);
          case WidgetTypeEnum.Site:
            return this.initSiteWidget(widget);
          case WidgetTypeEnum.Blog:
            return this.initBlogWidget(widget);
          case WidgetTypeEnum.Message:
            return this.initMessageWidget(widget);
          case WidgetTypeEnum.Coupons:
            return this.initCouponsWidget(widget);
          case WidgetTypeEnum.Social:
            return this.initSocialWidget(widget);
          case WidgetTypeEnum.Invoice:
            return this.initInvoiceWidget(widget);
          case WidgetTypeEnum.Subscriptions:
            return this.initSubscriptionsWidget(widget);
          case WidgetTypeEnum.Shipping:
            return this.initShippingWidget(widget);
          case WidgetTypeEnum.Pos:
            return this.initPosWidget(widget);
          case WidgetTypeEnum.Checkout:
            return this.initCheckoutWidget(widget);
          case WidgetTypeEnum.Ads:
            return this.initAdsWidget(widget);
          case WidgetTypeEnum.Connect:
            return this.initConnectWidget(widget);
          case WidgetTypeEnum.Contacts:
            return this.initContactsWidget(widget);
          case WidgetTypeEnum.Marketing:
            return this.initMarketingWidget(widget);
          case WidgetTypeEnum.Products:
            return this.initProductsWidget(widget);
          case WidgetTypeEnum.Settings:
            return this.initSettingsWidget(widget);
          case WidgetTypeEnum.Studio:
            return this.initStudioWidget(widget);
          case WidgetTypeEnum.Tutorial:
            return this.initTutorialWidget(widget);
          default:
            return null;
        }
      })
      .filter(Boolean);
  }

  private handleThemeChanging(widgets: Widget[]): Observable<Widget[]> {
    return of(
      widgets.map((widget) => {
        widget.notificationsIcon =
          `icons-apps-notifications/${widget.appName}-${
          this.businessData?.themeSettings?.theme === 'light' ? 'black.png' : 'white.png'
        }`;

        return widget;
      }),
    );
  }

  private handleNotifications(widgets: Widget[]): Observable<Widget[]> {
    return of(widgets);
  }

  private initTransactionsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Text,
      appName: WidgetTypeEnum.Transactions,
      title: 'widgets.transactions.title',
      icon: '#icon-commerceos-transactions',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Transactions),
    };
  }

  private initAppsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Icons,
      appName: WidgetTypeEnum.Apps,
      title: this.envService.isPersonalMode ? 'widgets.apps.title-personal' : 'widgets.apps.title-business',
      icon: '#icon-commerceos-apps',
      data: [],
      showInstallAppButton: false,
      openButtonLabel: 'widgets.actions.edit',
      openButtonFn: () => this.openEditAppsBox(),
    };
  }

  private initStoreWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Shop,
      title: 'widgets.store.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.store.subtitle`,
        'widgets.store.install-app'
      ),
      icon: '#icon-commerceos-shop',
      data: [],
      noDataTitle: 'widgets.store.no-shops',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Shop, 'shop/dashboard'),
    };
  }

  private initSiteWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Site,
      title: 'widgets.site.site',
      subTitle: this.checkIsTranslateExist(
        `widgets.site.subtitle`,
        'widgets.site.install-app'
      ),
      icon: '#icon-commerceos-site',
      data: [],
      noDataTitle: 'widgets.site.no-site',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Site, 'site/dashboard'),
    }
  }

  private initAppointmentsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Appointment,
      appName: WidgetTypeEnum.Appointments,
      title: 'widgets.appointments.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.appointments.subtitle`,
        'widgets.appointments.install-app'
      ),
      icon: '#icon-commerceos-appointments',
      data: [],
      noDataTitle: 'widgets.appointments.no-appointments',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Appointments, 'appointments/dashboard'),
    }
  }

  private initBlogWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.ImageTable,
      appName: WidgetTypeEnum.Blog,
      title: 'widgets.blog.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.blog.subtitle`,
        'widgets.blog.install-app'
      ),
      icon: '#icon-commerceos-blog',
      data: [],
      noDataTitle: 'widgets.blog.no-blog',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Blog, 'blog/dashboard'),
    };
  }

  private initMessageWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Avatars,
      appName: WidgetTypeEnum.Message,
      title: 'widgets.message.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.message.subtitle`,
        'widgets.message.install-app'
      ),
      icon: '#icon-commerceos-message',
      data: [],
      noDataTitle: 'widgets.message.no-message',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Message, 'message/dashboard'),
    };
  }

  private initSocialWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Social,
      appName: WidgetTypeEnum.Social,
      title: 'widgets.social.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.social.subtitle`,
        'widgets.social.install-app'
      ),
      icon: '#icon-commerceos-social',
      data: [],
      noDataTitle: 'widgets.social.no-social',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Social, 'social/dashboard'),
    };
  }

  private initCouponsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Coupon,
      appName: WidgetTypeEnum.Coupons,
      title: 'widgets.coupons.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.coupons.subtitle`,
        'widgets.coupons.install-app'
      ),
      icon: '#icon-commerceos-coupons',
      data: [],
      noDataTitle: 'widgets.coupons.no-coupons',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Coupons, 'coupons/dashboard'),
    };
  }

  private initInvoiceWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Text,
      appName: WidgetTypeEnum.Invoice,
      title: 'widgets.invoice.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.invoice.subtitle`,
        'widgets.invoice.install-app'
      ),
      icon: '#icon-commerceos-invoice',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Invoice, 'invoice/dashboard'),
    };
  }

  private initSubscriptionsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Column,
      appName: WidgetTypeEnum.Subscriptions,
      title: 'widgets.subscription.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.subscription.subtitle`,
        'widgets.subscription.install-app'
      ),
      icon: '#icon-commerceos-subscriptions',
      data: [],
      noDataTitle: 'widgets.subscriptions.no-subscriptions',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Subscriptions, 'subscriptions/dashboard'),
    };
  }

  private initShippingWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Column,
      appName: WidgetTypeEnum.Shipping,
      title: 'widgets.shipping.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.shipping.subtitle`,
        'widgets.shipping.install-app'
      ),
      icon: '#icon-commerceos-shipping',
      data: [],
      noDataTitle: 'widgets.shipping.no-shipping',
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Shipping, 'shipping/dashboard'),
    };
  }

  private initPosWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Pos,
      title: 'widgets.pos.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.pos.subtitle`,
        'widgets.pos.install-app'
      ),
      icon: '#icon-commerceos-pos',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Pos),
    };
  }

  private initCheckoutWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Checkout,
      title: 'widgets.checkout.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.checkout.subtitle`,
        'widgets.checkout.actions.add-new'
      ),
      icon: '#icon-commerceos-checkout',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => this.onOpenButtonClick(WidgetTypeEnum.Checkout),
    };
  }

  private initAdsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Ads,
      title: 'widgets.ads.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.ads.subtitle`,
        'widgets.ads.install-app'
      ),
      icon: '#icon-commerceos-ads',
      data: [],
      showInstallAppButton: false,
    };
  }

  private initConnectWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Connect,
      title: 'widgets.connect.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.connect.subtitle`,
        'widgets.connect.install-app'
      ),
      icon: '#icon-commerceos-connect',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Connect);
      },
    };
  }

  private initContactsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Contacts,
      appName: WidgetTypeEnum.Contacts,
      title: 'widgets.contacts.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.contacts.subtitle`,
        'widgets.contacts.install-app'
        ),
      icon: '#icon-commerceos-contacts',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Contacts);
      },
    };
  }

  private initMarketingWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Custom,
      appName: WidgetTypeEnum.Marketing,
      title: 'widgets.marketing.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.marketing.subtitle`,
        'widgets.marketing.install-app'
      ),
      icon: '#icon-commerceos-marketing',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Marketing);
      },
    };
  }

  private initProductsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Grid,
      appName: WidgetTypeEnum.Products,
      title: 'widgets.products.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.products.subtitle`,
        'widgets.products.actions.add-new'
      ),
      icon: '#icon-commerceos-products',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Products);
      },
    };
  }

  private initSettingsWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Button,
      appName: WidgetTypeEnum.Settings,
      title: 'widgets.settings.title',
      icon: '#icon-commerceos-settings',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Settings);
      },
    };
  }

  private initStudioWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Grid,
      appName: WidgetTypeEnum.Studio,
      title: 'widgets.studio.title',
      subTitle: this.checkIsTranslateExist(
        `widgets.studio.subtitle`,
        'widgets.studio.install-app'
      ),
      icon: '#icon-commerceos-studio',
      data: [],
      showInstallAppButton: true,
      openButtonFn: () => {
        return this.onOpenButtonClick(WidgetTypeEnum.Studio);
      },
    };
  }

  private initTutorialWidget(widget: WidgetInfoInterface): Widget {
    return {
      ...widget,
      type: WidgetType.Table,
      appName: WidgetTypeEnum.Tutorial,
      title: 'widgets.tutorial.title',
      icon: '#icon-commerceos-tutorial',
      data: [],
      installedApp: true,
      defaultApp: true,
      installed: true,
      showInstallAppButton: false,
      onInstallAppClick: () => {
        return EMPTY;
      },
    };
  }

  checkIsTranslateExist(currentKey, defaultKey) {
    return this.translateService.hasTranslation(`widgets.${this.businessData.industry}`) && this.translateService.hasTranslation(currentKey)
      ? this.translateService.translate(currentKey).replace('{{ industry }}', this.translateService.translate(`widgets.${this.businessData.industry}`))
      : this.translateService.translate(defaultKey);
  }
}
