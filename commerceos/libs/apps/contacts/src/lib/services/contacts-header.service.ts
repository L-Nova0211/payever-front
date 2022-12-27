import { Injectable, Injector } from '@angular/core';

import { MessageBus } from '@pe/common';
import { BaseHeaderService } from '@pe/header';

@Injectable()
export class PeContactsHeaderService extends BaseHeaderService {
  constructor(
    protected injector: Injector,
    private messageBus: MessageBus,
  ) {
    super(injector);
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      businessItem: null,
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/contacts` : '',
      isShowCloseItem: true,
      isShowBusinessItem: false,
      isShowBusinessItemText: null,
      isShowDataGridToggleComponent: true,
      isShowShortHeader: null,
      isShowMainItem: false,
      leftSectionItems: [],
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      showDataGridToggleItem: {
        onClick: this.onSidebarToggle,
      },
    });
  }

  private onSidebarToggle = () => {
    this.messageBus.emit('contacts-app.grid-sidenav.toggle', null);
  }
}
