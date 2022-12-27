import { Injectable, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';

@Injectable()
export class PeInvoiceHeaderService extends BaseHeaderService {

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
    this.setInvoiceHeaderConfig();
  }

  onSidebarToggle = () => {
    this.messageBus.emit('invoice.toggle.sidebar', '')
  }

  setInvoiceHeaderConfig(): void {
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/invoice` : '',
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
