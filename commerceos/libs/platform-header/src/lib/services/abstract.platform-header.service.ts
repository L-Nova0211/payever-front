import { Observable, Subject } from 'rxjs';

import { PeMobileSidenavItem, PePlatformHeaderConfig, PePlatformHeaderItem } from '../platform-header.types';

export abstract class PePlatformHeaderService {
  abstract config$: Observable<PePlatformHeaderConfig>;
  abstract readonly config: PePlatformHeaderConfig;
  abstract routeChanged$: Subject<any>;
  abstract closeButtonClicked$: Subject<any>;
  abstract previousUrlForBackChanged$: Subject<any>;
  abstract setConfig(config: PePlatformHeaderConfig): void;
  abstract assignConfig(config: PePlatformHeaderConfig): void;
  abstract assignSidenavItem(item: PeMobileSidenavItem): void;
  abstract toggleSidenavActive(name: string, active: boolean): void;
  abstract removeSidenav(name: string,): void;
  abstract updateSidenav(name: string, title: string): void;
  abstract setShortHeader(titleItem?: PePlatformHeaderItem): void;
  abstract setFullHeader(): void;
}
