import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { PeMenuService } from '@pe/ui';

export enum EventList {
  TOGGLE_SIDEBAR = 'toggle-sidebar',
  EDIT_OPEN = 'edit-open'
}

@Injectable()
export class PeStatisticsHeaderService extends BaseHeaderService {


  constructor(
    protected router: Router,
    protected mediaUrlPipe: MediaUrlPipe,
    protected platformHeaderService: PePlatformHeaderService,
    protected injector: Injector,
    private messageBus: MessageBus,
    private menu: PeMenuService,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  /**
   * Initializing service subscriptions
   */
  initialize() {
    if (this.isInitialized) {
      return;
    }
    /**
     * Changing current route to highlist selected item in header;
     * Handling popstate browser button
     */
    this.initHeaderObservers();
    this.isInitialized = true;
    const config = this.getHeaderConfig();
    this.setHeaderConfig(config);
  }

  close = () => {
    this.router.navigate([this.platformHeaderService.config.mainDashboardUrl])
  }

  onSidebarToggle = () => {
    this.messageBus.emit(EventList.TOGGLE_SIDEBAR, '');
  }

  /**
   * Header buttons handlers. In case of lazy-loaded micro left items handlers could be defined here.
   * Otherwise should be defined inside micro to make router works correct
   */
  getHeaderConfig(): PePlatformHeaderConfig {
    const logo = this.businessData?.logo || null;

    return {
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/statistics` : '',
      isShowShortHeader: false,
      mainItem: {},
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: this.onSidebarToggle,
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'products-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: [
        {
          title: this.translateService.translate('statistics.action.edit'),
          class: 'statistics__header-button',
          onClick: (e) => {
            this.messageBus.emit(EventList.EDIT_OPEN, '');
          },
        },
      ],
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
          class: 'products-header-hamburger-icon',
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
