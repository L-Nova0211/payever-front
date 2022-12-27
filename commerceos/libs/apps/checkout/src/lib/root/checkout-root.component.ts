import { ChangeDetectionStrategy, Component, OnInit, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Params, Router, NavigationEnd } from '@angular/router';
import { ResizedEvent } from 'angular-resize-event';
import { isString } from 'lodash-es';
import { Subject, BehaviorSubject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

import { MessageBus, EnvService } from '@pe/common';
import { AppThemeEnum } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeSimpleStepperService } from '@pe/stepper';
import { PeThemeEnum } from '@pe/theme-switcher';
import { WallpaperService } from '@pe/wallpaper';

import { PeCheckoutHeaderService } from '../services/checkout-header.service';

@Component({
  selector: 'cos-checkout-root',
  templateUrl: './checkout-root.component.html',
  styleUrls: ['./checkout-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosCheckoutRootComponent implements OnInit, OnDestroy {
  hideHeader: boolean;
  destroyed$ = new Subject<boolean>();


  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  isDashboardRoute: boolean;

  PeThemeEnum = PeThemeEnum;
  theme = (this.envService.businessData.themeSettings?.theme) ?
  AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default


  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private envService: EnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private translateService: TranslateService,
    private pePlatformHeaderService: PeCheckoutHeaderService,
    private wallpaperService: WallpaperService,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }


  ngOnInit() {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
    ]);

    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.hideHeader = event.url.includes('/channels/');
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'dashboard';
          this.pePlatformHeaderService.reassign();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'dashboard';

    // Hide old platform header because new checkout root component uses new platform header

    this.pePlatformHeaderService.init();
    this.wallpaperService.showDashboardBackground(false);

    this.peSimpleStepperService.hide();

    this.messageBus.listen('checkout.navigate-to-app').pipe(
      tap((data) => {
        if (isString(data)) {
          this.router.navigate([`business/${this.envService.businessId}/${data}`])
        } else {
          const dataEx = data as { url: string, getParams?: Params; };
          /*
          let path = `${dataEx.url}?`;
          for (const key of keys(dataEx.getParams || {})) {
            path += `${key}=${dataEx.getParams[key]}&`;
          }
          this.router.navigate([`business/${this.envService.businessId}/${path}`]);*/
          this.router.navigate([`business/${this.envService.businessId}/${dataEx.url}`],
          { queryParams: dataEx.getParams });
        }
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    this.messageBus.listen('checkout.back-to-dashboard').pipe(
      tap(() => this.router.navigate([`business/${this.envService.businessId}/info/overview`])),
      takeUntil(this.destroyed$),
    ).subscribe();

    // this.posHeaderService.initialize();

    // TODO Remove when deprecated welcome stepper will be completely removed
    const deprecated = document.getElementById('cos-deprecated-simple-welcome-stepper');
    if (deprecated) {deprecated.style.marginTop = '-10000px';}
  }

  ngOnDestroy() {
    this.pePlatformHeaderService.destroy();
    this.destroyed$.next(true);
    this.destroyed$.complete();

    // TODO Remove when deprecated welcome stepper will be completely removed
    const deprecated = document.getElementById('cos-deprecated-simple-welcome-stepper');
    if (deprecated) {deprecated.style.marginTop = null;}
  }

  onPlatformHeaderResized(event: ResizedEvent) {
    this.platformHeaderHeight$.next(event.newHeight);
  }

  onWelcomeStepperResized(event: ResizedEvent) {
    this.welcomeStepperHeight$.next(event.newHeight);
  }
}
