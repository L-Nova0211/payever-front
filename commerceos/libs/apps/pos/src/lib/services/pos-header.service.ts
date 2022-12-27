import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { MessageBus,NavigationService } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

@Injectable()
export class PePosHeaderService extends BaseHeaderService {
  constructor(
    protected router: Router,
    protected mediaUrlPipe: MediaUrlPipe,
    protected platformHeaderService: PePlatformHeaderService,
    protected navigationService: NavigationService,
    protected injector: Injector,
    private messageBus:MessageBus,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  reassign() {
    const config = this.getHeaderConfig();
    delete config.showDataGridToggleItem;
    this.platformHeaderService.assignConfig(config);
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig(this.getHeaderConfig());
  }

  getHeaderConfig(): PePlatformHeaderConfig {
    const logo = this.businessData?.logo || null;

    return {
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/pos` : '',
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.messageBus.emit('pos.toggle.sidebar','')
        },
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: this.navigationService?.getReturnUrl()
          ? this.translateService.translate('actions.close')
          : this.translateService.translate('dashboard.header.closeButtonText'),
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'connect-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: [],
      rightSectionItems: [

        {
          icon: '#icon-menu-notifications-24',
          iconSize: '25px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
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
      businessItem: {
        title: this.businessData?.name || '',
        icon:
          logo
            ? this.mediaUrlPipe.transform(logo, 'images')
            : '#icon-account-circle-24',
        iconSize: logo ? '18px' : '16px',
        iconType: logo ? 'raster' : 'vector',
        onClick: () => {
          this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`)
        },
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: false,
    }
  }
}
