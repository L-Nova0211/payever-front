import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessInterface } from '@pe/business';
import { BaseHeaderService } from '@pe/header';
import { TranslateService } from '@pe/i18n-core';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

@Injectable()
export class PeMicroHeaderService extends BaseHeaderService {
  businessData: BusinessInterface;
  currentRoute = this.router.url
    .split(';')[0]
    .split('/')
    .reverse()[0];

  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref =
    'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';

  hideBusinessItemTextMaxWidth = 729;
  subheaderMaxWidth = 620;
  isShowBusinessItemText = true;
  isSubheaderMode = false;
  prevUrl: string;
  preventSavingPrevUrl = false;

  destroyed$ = new Subject<void>();
  isInitialized = false;


  constructor(
    protected router: Router,
    protected mediaUrlPipe: MediaUrlPipe,
    protected authService: PeAuthService,
    protected platformHeaderService: PePlatformHeaderService,
    protected breakpointObserver: BreakpointObserver,
    protected injector: Injector,
    private translateService: TranslateService,
  ) {
    super(injector);
  }

  /**
   * Initializing service subscriptions
   */
  initialize(data) {
    if (this.isInitialized) {
      return;
    }



    /**
     * Listen to screen width changes to set or remove business title
     */
    this.breakpointObserver
      .observe(`(max-width: ${this.hideBusinessItemTextMaxWidth}px`)
      .pipe(
        tap((state: BreakpointState) => {
          this.isShowBusinessItemText = state.matches ? false : true;
          this.setMicroHeaderConfig(data);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to screen width changes to change header mode (subheader or one line)
     */
    this.breakpointObserver
      .observe(`(max-width: ${this.subheaderMaxWidth}px`)
      .pipe(
        tap((state: BreakpointState) => {
          this.isSubheaderMode = state.matches ? true : false;
          this.setMicroHeaderConfig(data);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe();

    /**
     * Listen to close button click. Works only for lazy-loaded micro. (Different router instances)
     */

    this.isInitialized = true;
    this.initializePosHeader(data);
  }


  onCloseClick = () => {
    this.router.navigate([this.platformHeaderService.config.mainDashboardUrl])
  }

  /**
   * Destroy service to remove it logic when switching to another app with own header
   */
  destroy(): void {
    this.isInitialized = false;
    this.platformHeaderService.setConfig(null);
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  /**
   * Retrieve data and set config
   */
  initializePosHeader(app) {
    this.setMicroHeaderConfig(app);
  }

  get businessLogo() {
    if (!this.businessData) {
      return;
    }

    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  /**
   * Header buttons handlers. In case of lazy-loaded micro left items handlers could be defined here.
   * Otherwise should be defined inside micro to make router works correct
   */

  onSearchClick = () => {
  };

  onNotificationsClick = () => {
    // this.headerService.sidebarButtonClick();
  };

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher']);
  };

  onLogOut = () => {
    this.authService.logout().subscribe();
  };

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  };

  openPersonalProfile = () => {
    this.router.navigate([`/personal/${this.authService.getUserData().uuid}`]);
  };


  setMicroHeaderConfig(app): void {
    const isShortHeader = this.platformHeaderService.config?.isShowShortHeader;
    const shortHeaderTitleItem = this.platformHeaderService.config
      ?.shortHeaderTitleItem;
    const config: PePlatformHeaderConfig = {
      isShowSubheader: this.isSubheaderMode,
      mainDashboardUrl: this.businessData?._id
        ? `/business/${this.businessData._id}/info/overview`
        : `/personal/${this.authService.getUserData().uuid}`,
      currentMicroBaseUrl:`/business/${this.businessData._id}/${app}`,
      isShowShortHeader: isShortHeader,
      mainItem: {
        title: app?.name,
        icon:app?.icon,
        iconType: 'vector',
        iconSize: '18px',
        onClick: this.onMainItemClick,
      },
      isShowMainItem: true,
      closeItem: {
        title: 'Close',
        icon: '#icon-x-24',
        iconType: 'vector',
        iconSize: '14px',
        onClick: this.onCloseClick,
      },
      isShowCloseItem: true,
      rightSectionItems: [
        {
          icon: '#icon-menu-notifications-24',
          iconSize: '25px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-menu-search-24',
          iconSize: '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-menu-hamburger-24',
          iconSize: '24px',
          iconType: 'vector',
          class: 'connect-header-hamburger-icon',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.switch_business'),
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.personal_information'),
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.add_business'),
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.log_out'),
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.contact'),
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: this.translateService.translate('header.menu.feedback'),
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],

      businessItem: {
        title: this.businessData ? this.businessData.name : this.businessData.name,
        icon: (this.businessData && this.businessLogo) ? this.businessLogo : '#icon-account-circle-24',
        iconSize: (this.businessData && this.businessLogo) ? '18px' : '14px',
        iconType: (this.businessData && this.businessLogo) ? 'raster' : 'vector',
        onClick: () => {
          this.router.navigateByUrl(`business/${this.businessData._id}/settings/info`)
        },
      },
      isShowBusinessItem: true,
      shortHeaderTitleItem,
      isShowBusinessItemText: this.isShowBusinessItemText,
    };

    this.platformHeaderService.setConfig(config);
  }
}
