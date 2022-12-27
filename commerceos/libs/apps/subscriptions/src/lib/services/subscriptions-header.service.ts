import { Injectable, Injector } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';

import { BaseHeaderService } from '@pe/header';

@Injectable()
export class PeSubscriptionsHeaderService extends BaseHeaderService {
  public mobileTitle$ = new BehaviorSubject<string>('');
  public showMobileTitle$ = new BehaviorSubject<boolean>(true);
  public readonly toggleSidebar$ = new Subject<void>();

  constructor(
    protected injector: Injector,
  ) {
    super(injector);
  }

  public initialize(): void {
    this.initHeaderObservers();
    this.setHeaderConfig({
      businessItem: null,
      currentMicroBaseUrl: this.businessData ? `/business/${this.businessData._id}/subscriptions` : '',
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
    this.toggleSidebar$.next();
  }
}
