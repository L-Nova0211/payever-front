import { Injectable, Injector } from '@angular/core';
import { Store } from '@ngxs/store';
import { tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { MessageBus, NavigationService } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { UserModes, UserState } from '@pe/user';

@Injectable()
export class PeTransactionsHeaderService extends BaseHeaderService {

  unreadMessages!: string;
  path = this.router.url.split('/')[1];

  constructor(
    protected mediaUrlPipe: MediaUrlPipe,
    protected platformHeaderService: PePlatformHeaderService,
    protected navigationService: NavigationService,
    protected envService: CosEnvService,
    protected injector: Injector,
    private messageBus: MessageBus,
    private translateService: TranslateService,
    private store: Store,
  ) {
    super(injector);
  }

  init(): void {
    this.initHeaderObservers();
    this.store.select(UserState.userData(this.path as UserModes)).pipe(
      tap( data => this.setHeaderConfig(this.getHeaderConfig(data))),
    ).subscribe();
  }

  getHeaderConfig(userData): PePlatformHeaderConfig {
    const path = this.router.url.split('/')[1];
    const logo = userData?.logo || null;
    const mainDashboardUrl = userData ? `/${path}/${userData._id}/info/overview` : '';
    const currentMicroBaseUrl = userData ? `/${path}/${userData._id}/transactions` : '';

    return {
      mainDashboardUrl,
      currentMicroBaseUrl,
      isShowShortHeader: false,
      mainItem: null,
      isShowMainItem: false,
      showDataGridToggleItem: {
        onClick: () => {
          this.messageBus.emit('transactions.toggle.sidebar','')
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
        class: 'connect-header',
        showIconBefore: true,
      },
      isShowCloseItem: true,
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
      businessItem: {
        title: this.businessData?.name || '',
        icon:
          logo
            ? this.mediaUrlPipe.transform(logo, 'images')
            : '#icon-account-circle-24',
        iconSize: logo ? '18px' : '16px',
        iconType: logo ? 'raster' : 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: false,
    }
  }
}

