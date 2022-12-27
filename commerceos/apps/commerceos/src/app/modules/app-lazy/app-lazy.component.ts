import { ChangeDetectionStrategy, Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { LazyAppsLoaderService } from '@pe/app-launcher';
import { PeAuthService } from '@pe/auth';
import { AbstractComponent } from '@pe/base';
import { BusinessInterface, BusinessState, ResetBusinessState } from '@pe/business';
import { PlatformEventInterface, PlatformService } from '@pe/platform';
import { WallpaperService } from '@pe/wallpaper';

import { notificationsTransition } from '../../animations/dashboard.animation';

@Component({
  selector: 'app-lazy',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [notificationsTransition],
})
export class AppLazyComponent extends AbstractComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  backgroundImage: string;

  constructor(
    public wallpaperService: WallpaperService,
    private platformService: PlatformService,
    private lazyAppsLoaderService: LazyAppsLoaderService,
    private authService: PeAuthService,
    private router: Router,
    private store: Store,
    private apmService: ApmService,
  ) {
    super();
  }

  ngOnInit() {
    const backToDashboard$ = this.platformService.backToDashboard$.pipe(tap(async (event: PlatformEventInterface) => {
      const [dashboardType, businessUuid] = this.router.url.split('/');
      this.store.dispatch(new ResetBusinessState());
      let navigatePath: any[];
      if (dashboardType === 'personal') {
        navigatePath = [`/personal/${this.authService.getUserData().uuid}`];
      } else {
        navigatePath = [`/business/${businessUuid || ''}`];
      }
      if (!(event.action === 'commerceos')) {
        await this.router.navigate(navigatePath);

        this.wallpaperService.showDashboardBackground(true);
      }

      this.lazyAppsLoaderService.clearMicroContainerElement();

      this.platformService.microAppReady = '';
    }));

    merge(
      this.authService.error$.pipe(tap(error => error && this.apmService?.apm?.captureError(error))),
      this.wallpaperService.backgroundImage$.pipe(tap(image => this.backgroundImage = `url(${image})`)),
      backToDashboard$,
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }
}
