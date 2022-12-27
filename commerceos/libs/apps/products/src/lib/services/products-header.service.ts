import { Injectable, Injector } from '@angular/core';

import { BaseHeaderService } from '@pe/header';

@Injectable()
export class PeProductsHeaderService extends BaseHeaderService {
  constructor(protected injector: Injector) {
    super(injector);
  }

  init(): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      businessItem: null,
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/products` : '',
      isShowCloseItem: true,
      isShowBusinessItem: false,
      isShowBusinessItemText: null,
      isShowDataGridToggleComponent: true,
      isShowShortHeader: null,
      isShowMainItem: false,
      leftSectionItems: [],
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      showDataGridToggleItem: {
        onClick: () => { },
      },
    });
  }
}
