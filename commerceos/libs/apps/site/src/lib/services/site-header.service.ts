import { Injectable, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { PePlatformHeaderService } from '@pe/platform-header';

@Injectable()
export class PeSiteHeaderService extends BaseHeaderService {


  constructor(
    protected platformHeaderService: PePlatformHeaderService,
    protected injector: Injector,
    private messageBus: MessageBus,
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
    this.setShopHeaderConfig();
  }

  onSidebarToggle = () => {
    this.messageBus.emit('site.toggle.sidebar', '')
  }


  /**
   * Header buttons handlers. In case of lazy-loaded micro left items handlers could be defined here.
   * Otherwise should be defined inside micro to make router works correct
   */
  setShopHeaderConfig(): void {

    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/statistics` : '',
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

  destroy(){
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
  }
}
