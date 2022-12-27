import { Injectable, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n';

@Injectable()
export class PeCouponsHeaderService extends BaseHeaderService {

  constructor(
    protected injector: Injector,
    private messageBus: MessageBus,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  onSidebarToggle = () => {
    this.messageBus.emit('coupons-app.grid-sidenav.toggle', null);
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData
        ? `/business/${this.businessData._id}/info/overview`
        : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/coupons` : '',
      isShowShortHeader: null,
      mainItem: null,
      closeItem: {
        title: 'Back to apps',
        icon:'#icon-apps-header',
        showIconBefore: true,
        iconType: 'vector',
        iconSize:'22px',
      },
      showDataGridToggleItem: {
        iconSize: '24px',
        iconType: 'vector',
        onClick: this.onSidebarToggle,
        isActive: true,
        isLoading: true,
        showIconBefore: true,
      },
      isShowDataGridToggleComponent:true,
      isShowMainItem: false,
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: null,
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
}
