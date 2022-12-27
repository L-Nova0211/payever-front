import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, Injector, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { forEach } from 'lodash-es';
import { BehaviorSubject, combineLatest, forkJoin, Observable, of } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';

import { widgetCustomElements } from '@pe/finexp-app';
import { PaymentOptionsInterface } from '@pe/finexp-app/finexp-editor/src/interfaces';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { CustomWidgetConfigInterface, defaultCustomWidgetConfig, WidgetTypeEnum } from '@pe/payment-widgets-sdk';
import { WidgetConfigPaymentInterface } from '@pe/payment-widgets-sdk/types/config';
import { PaymentMethodEnum } from '@pe/payment-widgets-sdk/types/payment-method.enum';

import {
  ChannelsAppsType,
  CustomChannelInterface,
  CustomChannelTypeEnum,
  IntegrationCategory,
  IntegrationInfoInterface,
} from '../../../interfaces';
import { NotAllowedChannels } from '../../../interfaces/channel.enum';
import { PosAppComponent } from '../../channel-settings/pos-app/pos-app.component';
import { QRAppComponent } from '../../channel-settings/qr-app/qr-app.component';
import { StoreAppComponent } from '../../channel-settings/store-app/store-app.component';
import { AbstractPanelComponent } from '../abstract-panel.component';

@Component({
  // tslint:disable-next-line component-selector
  selector: 'panel-channels',
  templateUrl: './channels.component.html',
  styleUrls: ['./channels.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PanelChannelsComponent extends AbstractPanelComponent {

  readonly channelsModals: CustomChannelTypeEnum[] = [
    CustomChannelTypeEnum.Pos,
    CustomChannelTypeEnum.Shop,
    CustomChannelTypeEnum.QR,
  ];

  defaultChannels: CustomChannelInterface[] = [
    {
      icon: '#icon-credit-cards-24',
      key: CustomChannelTypeEnum.DirectLink,
      nameButton: 'actions.edit',
      order: 40,
      title: 'channelsList.payByLink',
    },
    {
      icon: '#icon-link2-16',
      key: 'text',
      nameButton: 'actions.edit',
      order: 30,
      title: 'channelsList.textLink',
      url: 'text',
    },
    {
      icon: '#icon-ep-button-16',
      key: 'button',
      nameButton: 'actions.edit',
      order: 20,
      title: 'channelsList.button',
      url: 'button',
    },
    {
      icon: '#icon-b-layout-32',
      key: 'dropdownCalculator',
      nameButton: 'actions.edit',
      order: 10,
      title: 'channelsList.calculator',
      url: 'dropdownCalculator',
    },
    {
      icon: '#icon-b-layout-32',
      key: 'twoFieldsCalculator',
      nameButton: 'actions.edit',
      order: 0,
      title: 'channelsList.two-field-calculator',
      url: 'twoFieldsCalculator',
    },
  ];

  channelsReady = false;
  channels$ = combineLatest(
    this.storageService.getCategoryInstalledIntegrationsInfo(IntegrationCategory.Applications),
    this.storageService.getCategoryInstalledIntegrationsInfo(IntegrationCategory.ShopSystems),
    this.storageService.getCategoryInstalledIntegrationsInfo(IntegrationCategory.Messaging),
  ).pipe(
    map(([applications, shopSystems, messaging]) => {
      return [].concat(
        applications?.filter(item => !Object.values(NotAllowedChannels).find(
          val => val === item.integration.name
        )) || [],
        shopSystems || [],
        messaging || []
      );
    }),
    filter(d => !!d), takeUntil(this.destroyed$),
    tap((a) => {
      this.channelsReady = true;
    })
  );

  customChannelsReady = true;
  customChannelList$: Observable<CustomChannelInterface[]> = of(this.defaultChannels);

  openedAppType: ChannelsAppsType;
  dialogRef: PeOverlayRef;

  availableIntegrations: IntegrationInfoInterface[];
  paymentsOptions: PaymentOptionsInterface[] = [];

  defaultWidgetConfig: CustomWidgetConfigInterface = {
    ...defaultCustomWidgetConfig,
    amountLimits: {
      min: 0,
      max: 10000,
    },
    maxWidth: 500,
    checkoutId: this.checkoutUuid,
  };

  theme = 'dark';
  widgetsSettings: CustomWidgetConfigInterface[] = [];

  enabledChannelsIntegrations: string[] = [];
  openingIntegration$: BehaviorSubject<IntegrationInfoInterface> = new BehaviorSubject(null);

  constructor(
    injector: Injector,
    private route: ActivatedRoute,
    private location: Location,
    private overlayService: PeOverlayWidgetService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    super.ngOnInit();
    this.getWidgetSettings();
    forkJoin(
      this.apiService.getBusiness(this.storageService.businessUuid),
      this.storageService.getCheckoutByIdOnce(this.checkoutUuid)
    ).subscribe(([business, currentCheckout]) => {
      if (business && business.companyAddress && business.companyAddress.country === 'DK') {
        this.defaultChannels.map((channel: CustomChannelInterface) => {
          return channel.key === CustomChannelTypeEnum.Calculator
            ? { ...channel, title: 'channelsList.banner' }
            : channel;
        });
      }
      this.theme = business?.themeSettings?.theme && business?.themeSettings?.theme !== 'default'
      ? business.themeSettings.theme : 'dark';
      this.route.url.subscribe((url) => {
        this.openedAppType = Object.values(ChannelsAppsType).find(app => url[0].path === app);
        if (this.openedAppType) {
          this.initModal();
        }
      });
    });

    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      this.storageService.getChannelSets().pipe(takeUntil(this.destroyed$),
      filter(d => !!d)).subscribe((channelSets) => {
        const enabled: string[] = [];
        forEach(channelSets, (channelSet) => {
          if (channelSet.checkout === currentCheckout._id) {
            enabled.push(channelSet.type);
          }
        });
        this.enabledChannelsIntegrations = enabled;
      });
    });
  }

  onCustomChannelListClickButton(channel: CustomChannelInterface) {
    if (channel.url) {
      const userChannelSettings = this.widgetsSettings.find(settings => settings.type === channel.key);
      if (userChannelSettings?._id) {
        this.router.navigate(
          [`business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/channels/${userChannelSettings._id}`]
        );
      } else {
        const data = this.defaultWidgetConfig;
        data.type = channel.key as WidgetTypeEnum;
        delete data.widgetId;
        delete data.business;
        delete data.channelSet;
        delete data.cart;
        delete data.amount;
        delete data.reference;
        this.initPayments().subscribe((payments) => {
          data.payments = payments;
          this.apiService.createWidgetSettings(this.storageService.businessUuid, data)
            .subscribe((settings) => {
              this.router.navigate(
                [`business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/channels/${settings._id}`]
              );
            });
        });
      }
    } else if (channel.key === CustomChannelTypeEnum.DirectLink) {
      this.router.navigate([`business/${this.storageService.businessUuid}/checkout/${this.checkoutUuid}/panel-checkout`]);
    } else {
      console.error('Not implemented for', channel);
    }
  }

  onToggleChannelSet(integration: IntegrationInfoInterface, event: { checked: boolean }) {
    // TODO Show animation
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).subscribe((currentCheckout) => {
      this.storageService.getChannelSetsOnce().subscribe((channelSets) => {
        const channelSet = channelSets.find(c => c.type === integration.integration.name);
        if (channelSet) {
          if (event.checked) {
            this.storageService.attachChannelSetToCheckout(channelSet.id, currentCheckout._id).subscribe(() => {
              return;
            });
          } else {
            console.error('Not possible to reset checkout for channel set');
          }
        } else {
          console.error('Channel set not found to toggle');
        }
      });
    });
  }

  onOpenChannelSet(integration: IntegrationInfoInterface) {
    if (this.channelsModals.indexOf(integration.integration.name as CustomChannelTypeEnum) >= 0) {
      this.openedAppType = integration.integration.name + '-app' as ChannelsAppsType;
      this.initModal();
    } else {
      this.clickedIntegrationOpenButton(integration);
      if (!this.openingIntegration$.getValue()) {
        this.openingIntegration$.next(integration);
        this.clickedIntegrationOpenButton(integration);
      }
    }
  }

  private getWidgetSettings() {
    this.apiService.getWidgets(this.storageService.businessUuid, this.checkoutUuid)
      .subscribe(widgets => this.widgetsSettings = widgets);
  }

  private initPayments(): Observable<WidgetConfigPaymentInterface[]> {
    return this.storageService.getIntegrationsInfoOnce()
      .pipe(map((integrations) => {
          return integrations.filter((integration) => {
            return integration.installed
              && integration.enabled
              && Object.keys(widgetCustomElements).some(method => method === integration.integration.name);
          });
        }),
        switchMap((integrations) => {
          return this.storageService.getPaymentOptions(null).pipe(
            filter(i => !!i),
            map((options) => {
                if (integrations?.length) {
                  const paymentOptions = options
                    .find(option => option?.payment_method === integrations[0]?.integration?.name);

                  return [{
                    paymentMethod: integrations[0].integration.name as PaymentMethodEnum,
                    amountLimits: {
                      min: paymentOptions?.min || 0,
                      max: paymentOptions?.max || 0,
                    },
                    isBNPL: false,
                    enabled: true,
                  }] as WidgetConfigPaymentInterface[];
                } else {
                  return [];
                }
              }
            )
          );
        })
      );
  }

  private initModal() {
    const config: PeOverlayConfig = {
      data: {
        theme: this.theme,
        checkoutUuid: this.checkoutUuid,
      },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      headerConfig: {
        title: '',
        backBtnTitle: this.translateService.translate('actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('create_checkout.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
      },
      component: null,
    };
    switch (this.openedAppType) {
      case ChannelsAppsType.QR:
        config.headerConfig.title = this.translateService.translate('directLinkEditing.actions.qr');
        config.component = QRAppComponent;
        break;
      case ChannelsAppsType.POS:
        config.headerConfig.title = this.translateService.translate('channelsList.pos');
        config.component = PosAppComponent;
        break;
      case ChannelsAppsType.SHOP:
        config.headerConfig.title = this.translateService.translate('channelsList.shop');
        config.component = StoreAppComponent;
        break;
    }
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed.subscribe(() => {
      if (!this.openedAppType || this.openedAppType === ChannelsAppsType.QR) {
        this.location.back();
      } else {
        this.openedAppType = null;
      }
    });
  }
}
