import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { Observable, of } from 'rxjs';
import { first } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { LoaderService } from '@pe/app-launcher';
import { AuthUserData, PeAuthService } from '@pe/auth';
import { appsLaunchedByEvent } from '@pe/base';
import { DashboardDataService } from '@pe/base-dashboard';
import { ResetBusinessState } from '@pe/business';
import { MicroRegistryService, MicroAppInterface } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { WallpaperService } from '@pe/wallpaper';
import { AbstractDashboardComponent } from '@pe/zendesk';

@Component({
  selector: 'personal-dashboard-layout',
  templateUrl: './layout.component.html',
})
export class PersonalLayoutComponent extends AbstractDashboardComponent implements OnInit, OnDestroy {
  constructor(
    injector: Injector,
    private authService: PeAuthService,
    public dashboardDataService: DashboardDataService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private microRegistryService: MicroRegistryService,
    private apiService: ApiService,
    private router: Router,
    protected wallpaperService: WallpaperService,
    private store: Store,
  ) {
    super(injector);
    this.apiService
      .getUserAccount()
      .pipe(first())
      .subscribe((user) => {
        this.dashboardDataService.logo = user['logo'];
        this.dashboardDataService.label = `${user['firstName']} ${user['lastName']}`;
      });
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = true;
  }

  ngOnInit(): void {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'industries',
      'settings',
      'builder',
      'dock',
      'edit-panel',
      'social',
      'dashboard',
      'notification',
      'widgets',
      'payment-methods',
      'payment-plugins',
      'shipping',
      'finance-express',
    ]);
    this.backgroundImage = this.wallpaperService.blurredBackgroundImage;
    this.store.dispatch(new ResetBusinessState())
    super.ngOnInit();
  }

  ngOnDestroy(): void {
    super.ngOnDestroy();
  }

  protected initDocker(infoBox?: string): void {
    // micro apps loaded inside guard
    const microList: MicroAppInterface[] = this.microRegistryService.getMicroConfig('') as MicroAppInterface[];
    this.dockerItems = microList
      .filter((micro: any) => !!micro.dashboardInfo && Object.keys(micro.dashboardInfo).length > 0)
      .map((micro: MicroAppInterface) => {
        const result: any = {};
        result.icon = micro.dashboardInfo.icon;
        result.title = this.translateService.translate(micro.dashboardInfo.title);
        result.onSelect = (active: boolean) => {
          this.onAppSelected(micro, active);
        };
        result.installed = micro.installed;
        result.setupStatus = micro.setupStatus;
        result.order = micro.order;
        result.microUuid = micro._id;
        result.code = micro.code;

        return result;
      });
    this.dashboardDataService.apps(this.dockerItems);
  }

  private onAppSelected(micro: MicroAppInterface, active: boolean): void {
    this.loaderService.appLoading = micro.code;
    this.wallpaperService.showDashboardBackground(false);

    const userData: AuthUserData = this.authService.getUserData();

    if (!!userData) {
      this.loadMicroApp(userData.uuid, micro);
    }
  }

  private loadMicroApp(userId: string, micro: MicroAppInterface): void {
    const microName: string = micro.code;
    const config: any = this.microRegistryService.getMicroConfig(microName);


    // if app support launching by window event - load it here, then navigate to route.
    let loadObservable$: Observable<boolean> = of(true);
    if (appsLaunchedByEvent.indexOf(config.code) > -1) {
      loadObservable$ = this.microRegistryService.loadBuild(config);
    }

    loadObservable$.subscribe(() => {
      // NOTE: delay done for IE. When open app twice IE do not show spinner and do redirect immidiatelly
      // Make small delay to show spinner above the app icon
      setTimeout(
        () =>
          this.router
            .navigateByUrl(config.url.replace('{uuid}', userId))
            .then(() => (this.loaderService.appLoading = null)),
        100,
      );
    });
  }
}
