import { Injectable, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';

@Injectable()
export class PeStudioHeaderService extends BaseHeaderService {
  constructor(
    protected injector: Injector,
    private messageBus: MessageBus,
  ) {
    super(injector);
  }

  initialize() {
    if (this.isInitialized) {
      return;
    }

    this.initHeaderObservers();
    this.isInitialized = true;
    this.setStudioHeaderConfig();
  }

  onSidebarToggle = () => {
    this.messageBus.emit('app.studio.sidebarToggle', '');
  };

  setStudioHeaderConfig(): void {
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/studio` : '',
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
}
