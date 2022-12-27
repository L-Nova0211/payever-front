import {
  ChangeDetectionStrategy,
  Component,
  ViewEncapsulation,
  OnInit,
  OnDestroy,
  Optional,
  Inject,
} from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum, AppType, APP_TYPE, PreloaderState } from '@pe/common';
import { WallpaperService } from '@pe/wallpaper';

import { PeStudioHeaderService } from '../studio-header.service';

@Component({
  selector: 'cos-next-studio-root',
  templateUrl: './next-studio-root.component.html',
  styleUrls: ['./next-studio-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosNextStudioRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(PreloaderState.loading) loading: {};

  theme: AppThemeEnum;

  constructor(
    public router: Router,
    private studioHeaderService: PeStudioHeaderService,
    private wallpaperService: WallpaperService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    this.theme = this.businessData?.themeSettings?.theme
      ? AppThemeEnum[this.businessData.themeSettings.theme]
      : AppThemeEnum.default;
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType]
  }

  ngOnInit() {
    this.wallpaperService.showDashboardBackground(false);

    this.studioHeaderService.initialize();
  }

  ngOnDestroy() {
    this.studioHeaderService.destroy();
  }
}
