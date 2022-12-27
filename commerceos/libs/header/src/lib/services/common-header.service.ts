import { Injectable, Injector } from '@angular/core';

import { BaseHeaderService } from './base-header.service';


@Injectable()
export class PeCommonHeaderService extends BaseHeaderService {
  constructor(protected injector: Injector) {
    super(injector);
  }

  init(path: string, title: string, icon: string): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      mainDashboardUrl: this.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/${path}` : '',
      isShowShortHeader: null,
      mainItem: {
        title: title,
        icon: icon,
        iconType: 'vector',
        iconSize: '18px',
        onClick: this.onMainItemClick,
      },
      isShowMainItem: true,
      closeItem: null,
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: null,
      isShowBusinessItemText: null,
      leftSectionItems: [],
    });
  }
}
