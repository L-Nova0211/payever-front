import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { ApiService } from '@pe/api';
import { MessageBus } from '@pe/common'
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig } from '@pe/platform-header';

import { PebShippingSidebarService } from './sidebar.service';



@Injectable()
export class PeShippingHeaderService extends BaseHeaderService {
  constructor(
    protected router: Router,
    protected mediaUrlPipe: MediaUrlPipe,
    protected apiService: ApiService,
    protected injector: Injector,
    private messageBus: MessageBus,
    private translateService: TranslateService,
    private sidebarService: PebShippingSidebarService,
  ) {
    super(injector);
  }

  initialize() {
    if (this.isInitialized) {
      return;
    }

    this.initHeaderObservers();
    this.isInitialized = true;
    this.setHeaderConfig(this.getHeaderConfig());
  }

  onSidebarToggle = (close?) => {
    this.sidebarService.toggleSidebar(close);
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig(this.getHeaderConfig());
  }

  getHeaderConfig(leftSectionItems?): PePlatformHeaderConfig {
    const logo = this.businessData?.logo || null;

    return {
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/message` : '',
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.messageBus.emit('shipping.app.toggle.sidebar', false);
        },
      },
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: this.translateService.translate('dashboard.header.closeButtonText'),
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'message-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: leftSectionItems,
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
