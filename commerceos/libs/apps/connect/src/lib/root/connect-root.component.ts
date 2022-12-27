import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  ViewEncapsulation,
  Optional,
  Inject,
} from '@angular/core';
import { Params, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { ResizedEvent } from 'angular-resize-event';
import { isString } from 'lodash-es';
import { Subject, BehaviorSubject } from 'rxjs';
import { tap, takeUntil } from 'rxjs/operators';

import { MessageBus, EnvService, AppThemeEnum, NavigationService, PreloaderState, APP_TYPE, AppType } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeSimpleStepperService } from '@pe/stepper';
import { PeThemeEnum, ThemeSwitcherService } from '@pe/theme-switcher';
import { WallpaperService } from '@pe/wallpaper'

import { PeConnectHeaderService } from '../services/connect-header.service';


@Component({
  selector: 'cos-connect-root',
  templateUrl: './connect-root.component.html',
  styleUrls: [
    './connect-root.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class CosConnectRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};
  destroyed$ = new Subject<boolean>();

  platformHeaderHeight$ = new BehaviorSubject(0);
  welcomeStepperHeight$ = new BehaviorSubject(0);

  isDashboardRoute: boolean;
  PeThemeEnum = PeThemeEnum;
  theme = (this.envService.businessData.themeSettings?.theme) ?
  AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private envService: EnvService,
    public peSimpleStepperService: PeSimpleStepperService,
    private translateService: TranslateService,
    private pePlatformHeaderService: PeConnectHeaderService,
    private cdr: ChangeDetectorRef,
    private themeSwitcherService: ThemeSwitcherService,
    private wallpaperService: WallpaperService,
    private activatedRoute: ActivatedRoute,
    private navigationService: NavigationService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
    localStorage.removeItem('pe_guest_token');
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType]
  }

  ngOnInit() {

    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
      'payment',
    ]);

    this.wallpaperService.showDashboardBackground(false);
    this.router.events.pipe(
      tap((event) => {
        if (event instanceof NavigationEnd) {
          this.isDashboardRoute = event.urlAfterRedirects.split('/').reverse()[0] === 'dashboard';
          this.pePlatformHeaderService.reassign();
          this.cdr.markForCheck();
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
    this.isDashboardRoute = this.router.url.split('/').reverse()[0] === 'dashboard';

    if (this.router.url.indexOf('checkoutWelcomeScreen=true') > 0) {
      // Small non-necessary hack to not show header for welcome screen of checkout
    } else {
      // Hide old platform header because new connect root component uses new platform header
      this.pePlatformHeaderService.init();
    }

    this.peSimpleStepperService.hide();

    this.messageBus.listen('connect.navigate-to-app').pipe(
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

    this.messageBus.listen('connect.back-to-dashboard').pipe(
      tap(() => {
        this.router.navigate([`business/${this.envService.businessId}/info/overview`]);
      }),
      takeUntil(this.destroyed$),
    ).subscribe();

    let params: any;
    this.activatedRoute.queryParams.subscribe((val) => {
      if (!params) {
        params = val;
      }
      this.messageBus.listen('connect.close').pipe(
        tap(() => {
          const returnUrl = this.navigationService?.getReturnUrl();

          this.router.navigate([returnUrl ?? `business/${this.envService.businessId}/info/overview`]).then(() => {
            if (returnUrl) {
              this.navigationService.resetReturnUrl();
            }
          });
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
    });

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
