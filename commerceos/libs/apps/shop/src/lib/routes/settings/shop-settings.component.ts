import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeAlertDialogService } from '@pe/alert-dialog';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from '../../components';
import { PebShopsApi } from '../../services/abstract.shops.api';
import { ShopEnvService } from '../../services/shop-env.service';


@Component({
  selector: 'peb-shop-settings',
  templateUrl: './shop-settings.component.html',
  styleUrls: ['./shop-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebShopSettingsComponent implements OnInit {
  openedShop;
  shopList;
  isLive: boolean;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] : AppThemeEnum.default;

  onSavedSubject$ = new BehaviorSubject(null);
  @Output() closeEvent = new EventEmitter<boolean>();

  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: 'shop-app.settings.payever_domain',
    },
    connectExisting: {
      component: PeSettingsConnectExistingComponent,
      header: 'shop-app.settings.connect_existing',
    },
    connectPersonal: {
      component: PeSettingsConnectExistingComponent,
      header: 'shop-app.settings.personal_domain',
    },
    createApp: {
      component: PeSettingsCreateAppComponent,
      header: 'shop-app.actions.create_new',
    },
    cusomerPrivacy: {
      component: PeSettingsCustomerPrivacyComponent,
      header: 'shop-app.actions.customer_privacy'//Customer privacy',
    },
    facebookPixel: {
      component: PeSettingsFacebookPixelComponent,
      header: 'shop-app.actions.facebook_pixel'//Facebook Pixel',
    },
    googleAnalytics: {
      component: PeSettingsGoogleAnalyticsComponent,
      header: 'shop-app.actions.google_analytics',
    },
    passwordProtection: {
      component: PeSettingsPasswordProtectionComponent,
      header: 'shop-app.settings.password_protection',
    },
    personalDomain: {
      component: PeSettingsPersonalDomainComponent,
      header: 'shop-app.settings.personal_domain',
    },
    socialImage: {
      component: PeSettingsSocialImageComponent,
      header: 'shop-app.settings.social_image',
    },
    spamProtection: {
      component: PeSettingsSpamProtectionComponent,
      header: 'shop-app.settings.spam_protection'//Spam protection',
    },
  }

  constructor(
    private shopApi: PebShopsApi,
    private route: ActivatedRoute,
    private router: Router,
    private overlay: PeOverlayWidgetService,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private translateService: TranslateService,
    @Inject(EnvService) private envService: ShopEnvService,
    private destroy$: PeDestroyService,
    private alertDialog: PeAlertDialogService,
  ) {
  }

  toggleShopLive(e) {
    this.shopApi.patchIsLive(this.openedShop.id, e).subscribe((data: any) => {
      this.openedShop.accessConfig = data;
      this.isLive = data.isLive;
    })
    this.cdr.markForCheck();
  }



  ngOnInit() {
    this.getShopList().subscribe()
    this.onSavedSubject$.asObservable().pipe(
      tap((data) => {
        if (data?.updateShopList) {
          this.getShopList().subscribe();
        }
        if (data?.openShop) {
          this.route.snapshot.parent.parent.data = { ...this.route.snapshot?.parent?.parent?.data, shop: data.shop };
          this.messageBus.emit('shop.navigate.dashboard', data.shop.id);
        }
        if (data?.connectExisting) {
          this.openOverlay(this.components.connectPersonal);
        }
      }),
      takeUntil(this.destroy$),

    ).subscribe();
  }

  onShopClick(shop) {
    if (shop.isDefault) {
      return;
    }
    this.shopApi.markShopAsDefault(shop.id).pipe(switchMap(data => this.getShopList())).subscribe(() => {

    })
  }

  getShopList() {
    return this.shopApi.getShopsList().pipe(
      tap((shops) => {
        this.shopList = shops;
        shops.map((shop) => {
          if (shop.id === this.route.snapshot.params.shopId) {
            this.openedShop = shop;
            this.isLive = shop.accessConfig.isLive;
          }
        })
        this.cdr.markForCheck();
      }),
    )
  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ? itemData : this.openedShop;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSaved$: this.onSavedSubject$, closeEvent: this.closeEvent },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate(item.header),
        backBtnTitle: this.translateService.translate('shop-app.actions.cancel'),
        theme: this.theme,
        backBtnCallback: () => {
          this.showConfirmationDialog();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {
          this.showConfirmationDialog();
        },
        doneBtnTitle: this.translateService.translate('shop-app.actions.done'),
        doneBtnCallback: () => { },
        removeContentPadding: true,
      },
      backdropClick: () => {
        this.showConfirmationDialog();
      },
    }

    this.overlay.open(config);
  }

  private showConfirmationDialog() {
    const dialogRef = this.alertDialog.open({
      data: {
        title: this.translateService.translate('shop-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('shop-app.dialogs.window_exit.label'),
        actions: [
          {
            label: this.translateService.translate('shop-app.dialogs.window_exit.confirm'),
            bgColor: '#eb4653',
            callback: () => Promise.resolve({ exit: true }),
          },
          {
            label: this.translateService.translate('shop-app.dialogs.window_exit.decline'),
            callback: () => Promise.resolve({ exit: false }),
          },
        ],
      },
    });

    dialogRef.afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result.exit) {
          this.closeEvent.emit(true);
          this.overlay.close();
        }
        this.router.navigate(['.'], { relativeTo: this.route });
      });
  }

}
