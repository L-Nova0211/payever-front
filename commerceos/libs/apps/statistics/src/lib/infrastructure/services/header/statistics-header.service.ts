import { Injectable, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Subject } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { TranslateService } from '@pe/i18n-core';
import { MediaUrlPipe } from '@pe/media';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { PeHeaderMenuService } from '../../../misc/components/header-menu/header-menu.service';

@Injectable({ providedIn: 'root' })
export class StatisticsHeaderService {
  businessData: any;
  contactHref = 'mailto:support@payever.de?subject=Contact%20payever';
  feedbackHref = 'mailto:support@payever.de?subject=Feedback%20for%20the%20payever-Team';
  isShowBusinessItemText = true;
  isSubheaderMode = false;
  editMenuSubject$ = new BehaviorSubject(null);
  editMenu$ = this.editMenuSubject$.asObservable();

  destroyed$: Subject<void> = new Subject<void>();
  isInitialized = false;
  theme = 'dark';

  get businessLogo(): string {
    if (!this.businessData) {
      return;
    }

    return this.mediaUrlPipe.transform(this.businessData.logo, 'images');
  }

  isSidebarActiveStream$: BehaviorSubject<boolean> = new BehaviorSubject(true);
  isSidebarActive$ = this.isSidebarActiveStream$.asObservable();

  public get isSidebarActive(): boolean {
    return this.isSidebarActiveStream$.value;
  }

  public set isSidebarActive(v: boolean) {
    this.isSidebarActiveStream$.next(v);
  }

  constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private authService: PeAuthService,
    private translateService: TranslateService,
    private headerMenu: PeHeaderMenuService,
    @Optional() private platformHeaderService: PePlatformHeaderService,
  ) {}

  init(): void {
    this.setHeaderConfig();
  }

  setHeaderConfig(): void {
    const config: PePlatformHeaderConfig = {
      isShowSubheader: false,
      mainDashboardUrl: 'statistics/list',
      currentMicroBaseUrl: 'statistics',
      isShowShortHeader: true,
      isShowDataGridToggleComponent: true,
      showDataGridToggleItem: {
        onClick: this.onToggleSidebar.bind(this),
      },
      isShowMainItem: false,
      mainItem: {
        title: `Statistics`,
      },
      isShowCloseItem: true,
      closeItem: {
        title: 'Back to apps',
        icon: '#icon-apps-apps',
        showIconBefore: true,
        iconType: 'vector',
        iconSize: '14px',
      },
      leftSectionItems: [
        {
          icon: '#icon-header-menu',
          iconSize: '25px',
          iconType: 'vector',
          onClick: (e) => {
            e.preventDefault();
            e.stopPropagation();

            const data = {
              option: [
                {
                  title: this.translateService.translate('statistics.action.edit'),
                  icon: '#icon-edit-pencil-24',
                  list: [
                    {
                      label: this.translateService.translate('statistics.action.add_widget'),
                      value: 'add_widget',
                    },
                    {
                      label: this.translateService.translate('statistics.action.exit_full_screen_zoom'),
                      value: 'full_screen',
                    },
                  ],
                },
              ],
            };

            const dialogRef = this.headerMenu.open({ data, theme: this.theme });
            dialogRef.afterClosed.subscribe((d) => {
              if (d === 'add_widget') {
                this.editMenuSubject$.next('add-widget');
              }
              if (d === 'full_screen') {
                this.editMenuSubject$.next('full-screen');
              }
            });
          },
        },
      ],
      rightSectionItems: [
        {
          icon: '#icon-apps-header-notification',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onNotificationsClick,
        },
        {
          icon: '#icon-apps-header-search',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          onClick: this.onSearchClick,
        },
        {
          icon: '#icon-apps-header-hamburger',
          iconSize: this.isSubheaderMode ? '28px' : '24px',
          iconType: 'vector',
          children: [
            {
              icon: '#icon-switch_profile',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Switch Business',
              onClick: this.onSwitchBusinessClick,
            },
            {
              icon: '#icon-commerceos-user-20',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Personal Information',
              onClick: this.openPersonalProfile,
            },
            {
              icon: '#icon-add-business',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Add Business',
              onClick: this.onAddBusinessClick,
            },
            {
              icon: '#icon-log_out',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Log Out',
              onClick: this.onLogOut,
            },
            {
              icon: '#icon-contact',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Contact',
              onClick: this.onContactClick,
            },
            {
              icon: '#icon-feedback',
              iconSize: '20px',
              iconType: 'vector',
              title: 'Feedback',
              onClick: this.onFeedbackClick,
            },
          ],
        },
      ],
      businessItem: {
        title: this.businessData?.name || '',
        icon: this.businessData?.logo || '#icon-account-circle-24',
        iconSize: '16px',
        iconType: 'vector',
      },
      isShowBusinessItem: true,
      isShowBusinessItemText: true,
    };

    this.platformHeaderService.setConfig(config);
  }

  onToggleSidebar() {
    this.isSidebarActiveStream$.next(!this.isSidebarActiveStream$.value);
  }

  onSearchClick = () => {
    console.warn('No such method, check CommerceOs');
  }

  onNotificationsClick = () => {
    console.warn('No such method, check CommerceOs');
  }

  onSwitchBusinessClick = () => {
    this.router.navigate(['switcher/profile']);
  }

  onLogOut = () => {
    this.authService.logout().subscribe();
  }

  onAddBusinessClick = () => {
    this.router.navigate(['switcher/add-business']);
  }

  openPersonalProfile = () => {
    this.router.navigate(['/personal']);
  }

  onContactClick = () => {
    window.open(this.contactHref);
  }

  onFeedbackClick = () => {
    window.open(this.feedbackHref);
  }

  onMainItemClick = () => {
    console.warn('No such method, check CommerceOs');
  }
}
