import { Injectable, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { PePlatformHeaderService } from '@pe/platform-header';

@Injectable()
export class PeBlogHeaderService extends BaseHeaderService {

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

    this.initHeaderObservers();
    this.isInitialized = true;
    this.setBlogHeaderConfig();
  }

  onSidebarToggle = () => {
    this.messageBus.emit('blog.toggle.sidebar', '')
  }

  setBlogHeaderConfig(): void {
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/blog` : '',
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
