import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

import { CosEnvService, appsShownWithoutRedirect } from '@pe/base';
import { BusinessState } from '@pe/business';
import { DashboardEventEnum, PlatformService } from '@pe/platform';

import { LazyAppsLoaderService } from './lazy-apps-loader.service';
import { LoaderService } from './loader.service';


@Injectable({ providedIn: 'root' })
export class AppLauncherService {
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;

  constructor(
    private envService: CosEnvService,
    private loaderService: LoaderService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    private platformService: PlatformService,

  ) { }

  launchApp(appName: string, urlPath?: string): Observable<boolean> {
    const nonMicroApps: string[] = [
      'affiliates',
      'shop',
      'blog',
      'studio',
      'contacts',
      'checkout',
      'connect',
      'social',
      'pos',
      'products',
      'settings',
      // 'transactions'
    ];
    if (nonMicroApps.indexOf(appName) >= 0) {

      if (appName === 'pos' && !urlPath) {
        urlPath = 'pos';
      }

      if (appName === 'transactions' && !urlPath) {
        urlPath = 'transactions/list';
      }

      if (appName === 'settings' && !urlPath) {
        urlPath = 'settings';
      }

      return this.lazyAppsLoaderService.runPackagedApp(appName, urlPath);
    }
    urlPath = appName;

    return this.lazyAppsLoaderService.runPackagedApp(appName, urlPath);


    let obs$: Observable<boolean>;
    if (appsShownWithoutRedirect.indexOf(appName) >= 0) {
      obs$ = this.loaderService
        .loadMicroScript(appName, this.envService.isPersonalMode ? this.businessId : undefined)
        .pipe(
          switchMap(() => this.lazyAppsLoaderService.runMicroApp(appName, urlPath)),
          switchMap(() => this.lazyAppsLoaderService.appReadyEvent$),
          map(() => true),
          take(1),
          tap(() => {
            this.lazyAppsLoaderService.isMicroAppShown = true;
            this.loaderService.appLoading = null;
          }),
        );
    } else {
      this.loaderService.appLoading = appName;

      obs$ = this.loaderService.loadMicroScript(appName, this.businessId).pipe(
        tap(() => {
          this.platformService.dispatchEvent({
            target: DashboardEventEnum.MicroNavigation,
            action: '',
            data: {
              url: `${appName}${urlPath ? '/' + urlPath : ''}`,
              useContainerInsideDashboard: false,
              useCurrentMicroContainer: false,
            },
          });
          this.loaderService.appLoading = null;
        }),
      );
    }

    return obs$.pipe(
      catchError(() => {
        this.loaderService.appLoading = null;

        return of(false);
      }),
    );
  }

}
