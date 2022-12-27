import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';

import { EnvService } from '@pe/common';
import { BaseHeaderService } from '@pe/header';
import { MediaUrlPipe } from '@pe/media';
import { PeMessageService } from '@pe/message';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { BehaviorSubject, Subject } from 'rxjs';

import { PE_SOCIAL_CONTAINER } from '../constants';

@Injectable()
export class PeSocialHeaderService extends BaseHeaderService {
  public mobileTitle$ = new BehaviorSubject<string>('');
  public showMobileTitle$ = new BehaviorSubject<boolean>(true);
  public readonly toggleSidebar$ = new Subject<void>();

  constructor(
    protected injector: Injector,
    protected router: Router,

    protected envService: EnvService,
    protected mediaUrlPipe: MediaUrlPipe,
    private peMessageService: PeMessageService,
    protected platformHeaderService: PePlatformHeaderService,
  ) {
    super(injector);
  }

  reassign(): void {
    const config = this.getHeaderConfig();
    delete config.showDataGridToggleItem;
    this.platformHeaderService.setConfig(config);
  }

  initialize(): void {
    this.initHeaderObservers();
    this.setHeaderConfig(this.getHeaderConfig());
    this.peMessageService.app = PE_SOCIAL_CONTAINER;
  }

  private onSidebarToggle = () => {
    this.toggleSidebar$.next();
  }

  getHeaderConfig(): PePlatformHeaderConfig {
    const logo = this.businessData?.logo || null;

    return {
      mainDashboardUrl: this.envService.businessData ? `/business/${this.businessData._id}/info/overview` : '',
      currentMicroBaseUrl: this.envService.businessData ? `/business/${this.businessData._id}/social` : '',
      isShowShortHeader: false,
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
      isShowDataGridToggleComponent: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-header',
        iconType: 'vector',
        iconSize: '22px',
        isActive: true,
        class: 'social-header-close',
        showIconBefore: true,
      },
      isShowCloseItem: true,
      leftSectionItems: [],
      businessItem: {
        title: this.businessData?.name || '',
        icon:
          logo
            ? this.mediaUrlPipe.transform(logo, 'images')
            : '#icon-account-circle-24',
        iconSize: logo ? '18px' : '16px',
        iconType: logo ? 'raster' : 'vector',
        onClick: () => {
          this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`)
        },
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: false,
    }
  }
}
