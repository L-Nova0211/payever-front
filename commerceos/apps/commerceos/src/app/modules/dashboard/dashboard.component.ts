import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { BusinessInterface, BusinessState } from '@pe/business';
import { PeDestroyService } from '@pe/common';
import { ThemeSwitcherService } from '@pe/theme-switcher';
import { PeUser, UserState } from '@pe/user';
import { WallpaperService } from '@pe/wallpaper';

import { notificationsTransition } from '../../animations/dashboard.animation';

@Component({
  selector: 'user-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [notificationsTransition],
  providers: [PeDestroyService],
})
export class DashboardComponent implements OnInit {

  @Select(UserState.user) user$: Observable<PeUser>;
  @Select(UserState.loading) loading$: Observable<boolean>;
  @Select(BusinessState.businesses) businesses$: Observable<{businesses: BusinessInterface[], total: number}>;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  headerMenuItems = [];

  get theme() {
    return this.themeSwitcherService.theme;
  }

  constructor(
    private wallpaperService: WallpaperService,
    private authService: PeAuthService,
    private themeSwitcherService: ThemeSwitcherService,
    private router: Router,
    private readonly destroyed$: PeDestroyService,
  ) {
    this.wallpaperService.backgroundImage = this.businessData?.currentWallpaper?.wallpaper
      || this.wallpaperService.defaultBackgroundImage;
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
      'dashboard',
      'notification',
    ]);

    const userData = this.authService.getUserData();
    this.authService.refreshLoginData = {
      activeBusiness: this.authService.refreshLoginData.activeBusiness,
      email: userData?.email,
    };

    this.businesses$.pipe(
      takeUntil(this.destroyed$),
      tap((businesses) => {
        this.reloadMenuItems(businesses.total);
      })
    ).subscribe();
  }

  reloadMenuItems(totalBusinesses: number) {
    this.headerMenuItems = [
      {
        translateTitle: 'header.menu.switch_business',
        icon: '#icon-switch-block-16',
        onClick: () => {
          this.router.navigate(['switcher']);
        },
        show: totalBusinesses > 1,
      },
      {
        translateTitle: 'header.menu.personal_information',
        icon: '#icon-person-20',
        onClick: () => {
          this.router.navigate([`personal/${this.authService.getUserData().uuid}`]);
        },
        show: true,
      },
    ];
  }
}
