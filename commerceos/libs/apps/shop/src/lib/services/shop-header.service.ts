import { Inject, Injectable, Injector } from '@angular/core';

import { EnvService, MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { PeMessageService } from '@pe/message';
import { PePlatformHeaderService } from '@pe/platform-header';

import { ShopEnvService } from '../services';

@Injectable()
export class PeShopHeaderService extends BaseHeaderService {

  constructor(
    protected platformHeaderService: PePlatformHeaderService,
    protected injector: Injector,
    private messageBus: MessageBus,
    private peMessageService: PeMessageService,
    @Inject(EnvService) private envService: ShopEnvService,
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

    this.initHeaderObservers();
    this.isInitialized = true;
    this.setShopHeaderConfig();
    this.peMessageService.appId = this.envService.shopId;
  }

  onSidebarToggle = () => {
    this.messageBus.emit('shop.toggle.sidebar', '')
  }

  setShopHeaderConfig(): void {
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/shop` : '',
      isShowShortHeader: null,
      mainItem: {},
      isShowMainItem: false,
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
    });
  }

  destroy() {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
  }
}
