import { Injectable } from '@angular/core';
import { Store } from '@ngxs/store';

import { LoaderService, AppLauncherService } from '@pe/app-launcher';
import { DashboardDataService } from '@pe/base-dashboard';
import { MicroAppInterface, MicroRegistryService } from '@pe/common';
import { TranslateService } from '@pe/i18n';

import { DockerItemInterface } from './docker.interface';
import { SetDockerItems } from './state/docker.actions';

export const baseDockerItems: any = [
  {
    icon: '#icon-apps-apps',
    title: 'dashboard',
  },
  {
    icon: '#icon-apps-settings',
    title: 'settings',
  },
];

@Injectable()
export class DockerService {
  dockerItems: DockerItemInterface[] = [];

  constructor(
    private translateService: TranslateService,
    private microRegistryService: MicroRegistryService,
    private loaderService: LoaderService,
    private appLauncherService: AppLauncherService,
    private dashboardDataService: DashboardDataService,
    private store: Store,
  ) {}

  initDocker(infoBox?: string): void {
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
        result.isDefault = micro.default;
        result.setupStatus = micro.setupStatus;
        result.order = micro.order;
        result.microUuid = micro._id;
        result.code = micro.code;

        return result;
      });

    this.store.dispatch(new SetDockerItems(this.dockerItems));
    this.dashboardDataService.showEditAppsButton = false;
    this.dashboardDataService.showCloseAppsButton = true;
  }

  private onAppSelected(micro: MicroAppInterface, active: boolean): void {
      this.loaderService.appLoading = micro.code;
      this.openMicro(micro.code);


  }

  private openMicro(code: string): void {
    this.appLauncherService.launchApp(code).subscribe();
  }
}
