import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PePlatformHeaderService } from './abstract.platform-header.service';
import { PeMobileSidenavItem, PePlatformHeaderConfig, PePlatformHeaderItem } from '../platform-header.types';

@Injectable({
  providedIn: 'platform',
})
export class PlatformHeaderFakeService extends PePlatformHeaderService {
  configData$: BehaviorSubject<PePlatformHeaderConfig> = new BehaviorSubject({
    mainDashboardUrl: null,
    currentMicroBaseUrl: null,
    isShowShortHeader: true,
    mainItem: null,
    isShowMainItem: false,
    closeItem: {
      title: 'Close',
      onClick: 'closed',
    },
    isShowCloseItem: true,
    businessItem: null,
    isShowBusinessItem: false,
    isShowBusinessItemText: false,
  });
  config$ = this.configData$.asObservable();

  routeChanged$: Subject<string> = new Subject<string>();
  closeButtonClicked$: Subject<void> = new Subject<void>();
  previousUrlForBackChanged$: Subject<string> = new Subject<string>();

  /** Used to change current micro base url
   * If user clicks on something that need to show short header
   * This changing previousUrl so user could come back to the right place if he clicks 'Close"
   */
  previousUrl: string;

  constructor() {
    super();

    this.previousUrlForBackChanged$
      .asObservable()
      .pipe(
        tap(url => {
          this.previousUrl = url;
        }),
        take(1),
      )
      .subscribe();
  }

  get config(): PePlatformHeaderConfig {
    return this.configData$.getValue();
  }

  setConfig(config: PePlatformHeaderConfig) {
    this.configData$.next(config);
  }

  assignConfig(config: PePlatformHeaderConfig) {
    const data = this.configData$.getValue();
    Object.assign(data, config);
    this.configData$.next(data);
  }

  assignSidenavItem(mobileSidenavItem: PeMobileSidenavItem) {
    const data = this.configData$.getValue();

    data.mobileSidenavItems = [
      ...data?.mobileSidenavItems ?? [],
      mobileSidenavItem,
    ];
    this.configData$.next(data);
  }

  toggleSidenavActive(name: string, active: boolean): void {
    const data = this.configData$.getValue();
    if (data.mobileSidenavItems?.length) {
      const sidenav = data.mobileSidenavItems.find(item => item.name === name);
      sidenav.active = active;
    }

    this.configData$.next(data);
  }

  removeSidenav(name: string): void {
    const data = this.configData$.getValue();
    if (data.mobileSidenavItems?.length) {
      data.mobileSidenavItems = data.mobileSidenavItems.filter(item => item.name !== name);
    }
    this.configData$.next(data);
  }

  updateSidenav(name: string, title: string): void {
    const data = this.configData$.getValue();
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
    config.currentMicroBaseUrl = this.previousUrl;
    this.configData$.next({ ...config });
  }

  setFullHeader(): void {
    const config: PePlatformHeaderConfig = this.configData$.getValue();
    config.shortHeaderTitleItem = null;
    config.isShowShortHeader = false;
    this.configData$.next({ ...config });
  }
}
