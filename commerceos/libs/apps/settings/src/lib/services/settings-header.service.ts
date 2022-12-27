import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { takeUntil } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { BusinessInterface, BusinessState, LoadBusinessData } from '@pe/business';
import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n-core';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderService } from '@pe/platform-header';


@Injectable()
export class PeSettingsHeaderService extends BaseHeaderService {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  constructor(
    protected router: Router,
    protected mediaUrlPipe: MediaUrlPipe,
    protected platformHeaderService: PePlatformHeaderService,
    protected translateService: TranslateService,
    protected envService: CosEnvService,
    protected injector: Injector,
    private messageBus: MessageBus,
    private store: Store,

  ) {
    super(injector);

    (window as any)?.PayeverStatic?.IconLoader?.loadIcons([
      'set',
    ]);
  }

  /**
   * Initializing service subscriptions
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }

    this.messageBus.listen('settings.change.logo').pipe(takeUntil(this.destroyed$)).subscribe((url: string) => {
      this.loadBusinessData(this.businessData._id).subscribe((res) => {
        this.setHeaderConfig({
          businessItem: {
            title: this.businessData ? this.businessData?.name : this.businessData?.name,
            icon: res.peBusinessState.businessData.logo
                  ? this.mediaUrlPipe.transform(url, 'images')
                  : '#icon-account-circle-24',
            iconSize: this.isSubheaderMode ? '22px' : '16px',
            iconType: (this.businessData && this.businessLogo) ? 'raster' : 'vector',
            onClick: () => {
              this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`)
            },
          },
        });
      });
    });
    this.messageBus.listen('settings.close.app').pipe(takeUntil(this.destroyed$)).subscribe((res) => {
      this.closeSettings();
    });

    this.initHeaderObservers();
    this.isInitialized = true;
    this.setSettingsHeaderConfig();
  }

  onSidebarToggle = () => {
    this.messageBus.emit('settings.toggle.sidebar', '')
  }



  setSettingsHeaderConfig(): void {
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/settings` : '',
      isShowShortHeader: null,
      mainItem: {},
      isShowMainItem: false,
      closeItem: {
        title: this.translateService.translate('dashboard.header.closeButtonText'),
        icon:'#icon-apps-apps',
        showIconBefore: true,
        iconType: 'vector',
        iconSize: this.isSubheaderMode ? '22px' : '16px',
        onClick: this.closeSettings,
      },
      showDataGridToggleItem: {
        iconSize: '24px',
        iconType: 'vector',
        onClick: this.onSidebarToggle,
        isActive: true,
        isLoading: true,
        showIconBefore: true,
      },

      isShowCloseItem: true,
      isShowDataGridToggleComponent: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: null,
      leftSectionItems: [],
      rightSectionItems: [
        {
          icon: '#icon-menu-search-24',
          iconSize: '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-menu-hamburger-24',
          iconSize: '24px',
          iconType: 'vector',
          class: 'connect-header-hamburger-icon',
          children: [
            {
              icon: '#icon-switch-block-16',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.switch_business'),
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-person-20',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.personal_information'),
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-n-launch',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.add_business'),
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-contact-20',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.contact'),
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-star-20',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.feedback'),
              onClick: this.onFeedbackClick,
            },
            {
              icon: '#icon-logout-20',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.log_out'),
              onClick: this.onLogOut,
            },
          ],
        },
      ],
    });
  }

  destroy(){
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
  }

  closeSettings = () => {
    if (this.envService.isPersonalMode) {
        this.router.navigate([
          `/personal/${this.authService.getUserData().uuid}/info/overview`,
        ]);
    } else {
      this.store.dispatch(new LoadBusinessData(this.businessData._id)).subscribe((res) => {
        if (this.platformHeaderService.config?.isShowShortHeader) {
          this.router
            .navigateByUrl(this.platformHeaderService?.config?.currentMicroBaseUrl)
            .then(() => this.platformHeaderService.setFullHeader());
        } else {
          this.router.navigate([
            this.platformHeaderService?.config?.mainDashboardUrl ||
            `/business/${this.businessData._id}/info/overview`,
          ]);
        }
      });
    }
  }

  loadBusinessData(businessId) {
    return this.store.dispatch(new LoadBusinessData(businessId));
  }
}
