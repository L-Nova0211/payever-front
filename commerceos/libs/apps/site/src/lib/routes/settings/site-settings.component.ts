import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  OnInit,
  Output,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';


import { PeAlertDialogService } from '@pe/alert-dialog';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
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
import { SiteEnvService } from '../../services/site-env.service';
import { PebSitesApi } from '../../services/site/abstract.sites.api';


@Component({
  selector: 'peb-site-settings',
  templateUrl: './site-settings.component.html',
  styleUrls: ['./site-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebSiteSettingsComponent implements OnInit {
  openedSite;
  siteList;
  isLive: boolean;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] : AppThemeEnum.default

  onSavedSubject$ = new BehaviorSubject(null)
  @Output() closeEvent = new EventEmitter<boolean>();

  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: 'site-app.settings.payever_domain',
    },
    connectExisting: {
      component: PeSettingsConnectExistingComponent,
      header: 'site-app.settings.connect_existing',
    },
    connectPersonal: {
      component: PeSettingsConnectExistingComponent,
      header: 'site-app.settings.personal_domain',
    },
    createApp: {
      component: PeSettingsCreateAppComponent,
      header: 'site-app.settings.create_new',
    },
    cusomerPrivacy: {
      component: PeSettingsCustomerPrivacyComponent,
      header: 'site-app.settings.customer_privacy',
    },
    facebookPixel: {
      component: PeSettingsFacebookPixelComponent,
      header: 'site-app.settings.facebook_pixel',
    },
    googleAnalytics: {
      component: PeSettingsGoogleAnalyticsComponent,
      header: 'site-app.settings.google_analytics',
    },
    passwordProtection: {
      component: PeSettingsPasswordProtectionComponent,
      header: 'site-app.settings.password_protection',
    },
    personalDomain: {
      component: PeSettingsPersonalDomainComponent,
      header: 'site-app.settings.personal_domain',
    },
    socialImage: {
      component: PeSettingsSocialImageComponent,
      header: 'site-app.settings.social_image',
    },
    spamProtection: {
      component: PeSettingsSpamProtectionComponent,
      header: 'site-app.settings.payever_domain',
    },
  }

  constructor(
    private siteApi: PebSitesApi,
    private route: ActivatedRoute,
    private overlay: PeOverlayWidgetService,
    private translateService: TranslateService,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    @Inject(EnvService) private envService: SiteEnvService,
    private destroy$: PeDestroyService,
    private alertDialog: PeAlertDialogService,
  ) {
  }

  toggleSiteLive(e) {
    this.siteApi.patchIsLive(this.openedSite.id, e).subscribe((data: any) => {
      this.openedSite.accessConfig = data;
      this.isLive = data.isLive
    })
    this.cdr.markForCheck()
  }



  ngOnInit() {
    this.getSiteList().subscribe()
    this.onSavedSubject$.asObservable().pipe(
      tap((data) => {
        if (data?.updateSiteList) {
          this.getSiteList().subscribe()
        }
        if (data?.openSite) {
          this.route.snapshot.parent.parent.data = { ...this.route.snapshot?.parent?.parent?.data, site: data.site };
          this.messageBus.emit('site.navigate.dashboard', data.site.id);
        }
        if (data?.connectExisting) {
          this.openOverlay(this.components.connectPersonal)
        }
      }),
      takeUntil(this.destroy$),

    ).subscribe()
  }

  onSiteClick(site) {
    if (site.isDefault) {
      return;
    }
    this.siteApi.markSiteAsDefault(site.id).pipe(switchMap(data => this.getSiteList())).subscribe(() => {

    })
  }

  getSiteList() {
    return this.siteApi.getSiteList().pipe(

      tap((sites) => {
        this.siteList = sites;
        sites.map((site) => {
          if (site.id === this.route.snapshot.params.siteId) {
            this.openedSite = site
            this.isLive = site.accessConfig.isLive
          }
        })
        this.cdr.markForCheck()
      }),

    )

  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ? itemData : this.openedSite;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSaved$: this.onSavedSubject$, closeEvent: this.closeEvent },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate(item.header),
        backBtnTitle: 'Cancel',
        theme: this.theme,
        backBtnCallback: () => {
          this.onCloseWindow();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {
          this.onCloseWindow();
        },
        doneBtnTitle: 'Done',
        doneBtnCallback: () => { },
      },
      backdropClick: () => {
      },
    }

    this.overlay.open(
      config,
    );
  }

  private onCloseWindow() {
    this.alertDialog.open({
      data: {
        title: this.translateService.translate('site-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('site-app.dialogs.window_exit.label'),
        actions: [
          {
            label: this.translateService.translate('site-app.dialogs.window_exit.confirm'),
            bgColor: '#eb4653',
            callback: () => {
              this.closeEvent.emit(true);
              this.overlay.close();

              return Promise.resolve();
            },
          },
          {
            label: this.translateService.translate('site-app.dialogs.window_exit.decline'),
            callback: () => Promise.resolve(),
          },
        ],
      },
    });
  }

}
