import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Inject, OnInit } from '@angular/core';

import { AppThemeEnum, EnvironmentConfigInterface, EnvService, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG } from '@pe/overlay-widget';

import { PeWidgetService } from '../../infrastructure';

export interface App {
  id: string;
  name: string;
  url: string;
}

@Component({
  selector: 'peb-statistics-app',
  templateUrl: './statistics-app.component.html',
  styleUrls: ['./statistics-app.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StatisticsAppComponent implements OnInit {
  /** Theme selected */
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  /** Whether is mobile screen */
  isMobile = window.innerWidth < 620;

  body: HTMLElement = document.body;

  /** Available app array */
  apps: App[] = [];

  constructor(
    @Inject(PE_OVERLAY_CONFIG) public overlayConfig: any,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private widgetService: PeWidgetService,
    private cdr: ChangeDetectorRef,
    private translateService: TranslateService,
    private envService: EnvService,
  ) {
    this.overlayConfig.title = this.translateService.translate('statistics.overlay_titles.add_widget');
  }

  ngOnInit() {
    this.body.classList.remove(`wider-overlay`);
    this.body.classList.remove(`remove-overlay-content-padding`);
    this.widgetService.apps.forEach((element) => {
      this.apps.push({
        id: element,
        name: this.translateService.translate(`statistics.widget_apps.${element}`),
        url: `${this.env.custom.cdn}/icons-png/icon-statistic-${element}.png`,
      });
    });
    this.cdr.detectChanges();
  }

  /** Selected clicked app */
  onAppClick(app: App) {
    this.widgetService.selectedApp = app;
    this.overlayConfig.onSaveSubject$.next(true);
  }
}
