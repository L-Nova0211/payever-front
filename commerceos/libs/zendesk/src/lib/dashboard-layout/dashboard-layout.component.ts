import { Location } from '@angular/common';
import { Component, HostListener, Injector, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select } from '@ngxs/store';
import { Observable } from 'rxjs';
import { first, take, takeUntil } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { AppLauncherService, LoaderService } from '@pe/app-launcher';
import { DashboardDataService } from '@pe/base-dashboard';
import { BusinessInterface, BusinessState } from '@pe/business';
import { AppSetUpStatusEnum, MicroAppInterface, MicroRegistryService } from '@pe/common';
import { WidgetsApiService } from '@pe/dashboard-widgets';
import { TranslateService } from '@pe/i18n';
import { PlatformService } from '@pe/platform';
import { PeStepperService, PeWelcomeStepperAction } from '@pe/stepper';

import { AbstractDashboardComponent } from '../abstract-dashboard.component';

@Component({
  selector: 'business-dashboard-layout',
  templateUrl: './dashboard-layout.component.html',
  styleUrls: ['./dashboard-layout.component.scss'],
})
export class BusinessDashboardLayoutComponent extends AbstractDashboardComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessUuid) businessId: string;
  @Select(BusinessState.businessData) businessData$: Observable<BusinessInterface>;

  isLoading = true;

  widgetsApiService: WidgetsApiService = this.injector.get(WidgetsApiService);

  @HostListener('document:keydown.a', ['$event.target'])
  navigateToApps(target: HTMLElement): void {
    if (
      target.tagName.toLowerCase() !== 'input' &&
      target.tagName.toLowerCase() !== 'textarea' &&
      this.location.isCurrentPathEqualTo(this.router.url)
    ) {
      this.router.navigate([`business/${this.businessId}/info/overview`]);
    }
  }

  constructor(
    injector: Injector,
    private location: Location,
    private dashboardDataService: DashboardDataService,
    private translateService: TranslateService,
    private loaderService: LoaderService,
    private microRegistryService: MicroRegistryService,
    private router: Router,
    private platformService: PlatformService,
    private peStepperService: PeStepperService,
    private appLauncherService: AppLauncherService,
    private apiService: ApiService,
  ) {
    super(injector);
    this.isLoading = false;
  }

  ngOnInit(): void {
    super.ngOnInit();

    this.peStepperService.dispatch(PeWelcomeStepperAction.ChangeIsActive, false);

    this.apiService
    .getUserAccount()
    .pipe(first())
    .subscribe((user) => {
      this.dashboardDataService.userName = user['firstName'] || null;
    });

    this.businessData$.pipe(take(1)).subscribe((businessData) => {
      this.dashboardDataService.label = businessData.name;
      this.dashboardDataService.logo = businessData.logo;
    });

    this.showChatButton();
    this.platformService.backToDashboard$.pipe(takeUntil(this.destroyed$)).subscribe(() => {
      this.showChatButton();
    });

    this.loaderService.appLoading$.pipe(takeUntil(this.destroyed$)).subscribe(() => this.hideChatButton());
  }

  ngOnDestroy(): void {
    this.dockerItems.forEach(item => (item.onSelect = undefined));
    super.ngOnDestroy();
  }

  navigateToSwitcher(): void {
    this.router.navigate(['/switcher']);
  }

  protected initDocker(infoBox?: string): void {
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
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = true;
  }

  private onAppSelected(micro: MicroAppInterface, active: boolean): void {
    this.loaderService.appLoading = micro.code;

    if ([AppSetUpStatusEnum.Completed, AppSetUpStatusEnum.Started].indexOf(micro.setupStatus) >= 0) {
      this.openMicro(micro.code);
    } else {
      this.wallpaperService.showDashboardBackground(false);
      const url = `business/${this.businessId}/welcome/${micro.code}`;
      this.router.navigate([url]); // go to welcome-screen
    }
  }

  private openMicro(code: string, path?: string): void {
    this.appLauncherService.launchApp(code, path).subscribe();
  }
}
