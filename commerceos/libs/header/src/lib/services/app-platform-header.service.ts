import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { cloneDeep, assign } from 'lodash-es';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { find, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessInterface, BusinessState } from '@pe/business';
import { TranslateService } from '@pe/i18n-core';
import { MediaUrlPipe } from '@pe/media';
import {
  PePlatformHeaderConfig,
  PePlatformHeaderService,
  PePlatformHeaderItem,
  PeMobileSidenavItem,
} from '@pe/platform-header';



@Injectable({
  providedIn: 'platform',
})
export class PlatformHeaderService extends PePlatformHeaderService {
  @Select(BusinessState.businessData) businessData$: Observable<BusinessInterface>;
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  config$: Observable<PePlatformHeaderConfig> = null;
  routeChanged$: Subject<string> = new Subject<string>();
  closeButtonClicked$: Subject<void> = new Subject<void>();
  previousUrlForBackChanged$: Subject<string> = new Subject<string>();

  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';

  previousUrl: string;

  private configData$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject(null);

  private authService: PeAuthService = this.injector.get(PeAuthService);
  // private headerService: HeaderService = this.injector.get(HeaderService);
  private mediaUrlPipe: MediaUrlPipe = this.injector.get(MediaUrlPipe);
  private router: Router = this.injector.get(Router);
  private translateService: TranslateService = this.injector.get(TranslateService)

  constructor(private injector: Injector) {
    super();

    this.config$ = this.configData$;
    this.previousUrlForBackChanged$
      .asObservable()
      .pipe(
        tap((url) => {
          this.previousUrl = url;
        }),
      )
      .subscribe();
  }

  get config(): PePlatformHeaderConfig {
    return this.configData$.getValue();
  }

  /** @deprecated use setConfig(...) instead */
  set config(config: PePlatformHeaderConfig) {
    this.configData$.next(config);
  }

  setConfig(config: PePlatformHeaderConfig): void {
    this.configData$.next(config);
  }

  assignConfig(config: PePlatformHeaderConfig): void {
    const data = cloneDeep(this.configData$.getValue()) ?? null;
    assign(data, config);
    this.configData$.next(data);
  }

  assignSidenavItem(mobileSidenavItem: PeMobileSidenavItem): void {
    const data = cloneDeep(this.configData$.getValue()) ?? null;

    if (data?.mobileSidenavItems?.find(item => item.name === mobileSidenavItem.name)) {
      return;
    }

    data.mobileSidenavItems = [
      ...data?.mobileSidenavItems ?? [],
      mobileSidenavItem,
    ];
    this.configData$.next(data);
  }

  toggleSidenavActive(name: string, active: boolean): void {
    const data = cloneDeep(this.configData$.getValue()) ?? null;
    if (data?.mobileSidenavItems?.length) {
      const sidenav = data.mobileSidenavItems.find(item => item.name === name);

      if (sidenav) {
        sidenav.active = active;
      }
    }
    this.configData$.next(data);
  }

  removeSidenav(name: string): void {
    const data = cloneDeep(this.configData$.getValue()) ?? null;
    if (data?.mobileSidenavItems?.length) {
      data.mobileSidenavItems = data.mobileSidenavItems.filter(item => item.name !== name);
    }
    this.configData$.next(data);
  }

  updateSidenav(name: string, title: string): void {
    const data = cloneDeep(this.configData$.getValue()) ?? null;
    if (data?.mobileSidenavItems?.length) {
      const sidenav = data.mobileSidenavItems.find(item => item.name === name);

      if (sidenav) {
        sidenav.item.title = title;
      }
    }
    this.configData$.next(data);
  }

  setShortHeader(shortHeaderTitleItem: PePlatformHeaderItem): void {
    const config: PePlatformHeaderConfig = this.config;
    config.shortHeaderTitleItem = shortHeaderTitleItem;
    config.isShowShortHeader = true;
    config.currentMicroBaseUrl = this.previousUrl || config.currentMicroBaseUrl;
    this.configData$.next({ ...config });
  }

  setFullHeader(): void {
    const config: PePlatformHeaderConfig = this.configData$.getValue();
    // config.shortHeaderTitleItem = null;
    // config.isShowShortHeader = false;
    // this.configData$.next({ ...config });
  }


  onSearchClick = () => {

  };

  onNotificationsClick = () => {
  };

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  openPersonalProfile = () => {
    this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  onContactClick = () => {
    window.open(this.contactHref);
  };

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  };

  assignAppPlatformMenu(businessData?: BusinessInterface): void {
    const logo = businessData?.logo || null;
    const config: Partial<PePlatformHeaderConfig> = {
      mainDashboardUrl: businessData ? `/business/${businessData._id}/info/overview` : '',
      closeItem: {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
      },
      isShowCloseItem: true,
      rightSectionItems: [
        {
          icon: '#icon-menu-search',
          iconSize: '14px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-n-bell-32',
          iconSize: '14px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-hamburger-16',
          iconSize: '14px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch-block-16',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Profile',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-person-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-n-launch',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-contact-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-star-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
            {
              icon: '#icon-logout-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
          ],
        },
      ],
      businessItem: {
        title: businessData?.name || '',
        icon: logo ? this.mediaUrlPipe.transform(logo, 'images') : '#icon-menu-avatar-24',
        iconSize: logo ? '18px' : '14px',
        iconType: logo ? 'raster' : 'vector',
        onClick: () => {
          this.router.navigateByUrl(`business/${this.businessId}/settings/info`)
        },
      },
      isShowBusinessItem: true,
    };

    this.assignConfig(config as PePlatformHeaderConfig);
  }
}
