import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { filter, tap, takeUntil } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { ICONS, SOCIAL_NAVIGATION } from './constants';
import { PeSocialRoutingPathsEnum } from './enums';
import { PeSocialApiService, PeSocialEnvService, PeSocialHeaderService } from './services';

export const SIDENAV_NAME = 'app-social-sidenav';

@Component({
  selector: 'pe-social',
  templateUrl: './social.component.html',
  styleUrls: ['./social.component.scss'],
  providers: [PeDestroyService],
})
export class PeSocialComponent implements OnInit, OnDestroy {
  public selectFolder: FolderItem<{ link: PeSocialRoutingPathsEnum }>;

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  public readonly sidebarTree = SOCIAL_NAVIGATION.map(folder => ({
    ...folder,
    name: this.translateService.translate(folder.name),
  }));

  private isMobile = document.body.clientWidth <= 720;

  public readonly getChannelsSets$ = this.peSocialApiService.getSocialChannelSet();
  public readonly mobileTitle$ = this.peSocialHeaderService.mobileTitle$;
  public readonly showMobileTitle$ = this.peSocialHeaderService.showMobileTitle$;
  private readonly resizeListener$ = fromEvent(window, 'resize')
    .pipe(
      tap(() => {
        const isMobile = window.innerWidth <= 720;

        if (isMobile !== this.isMobile) {
          this.isMobile = isMobile;
          this.changeHeaderConfig(isMobile);
        }
      }));

  private readonly toggleOpenStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((open: boolean) => {
        this.pePlatformHeaderService.toggleSidenavActive(SIDENAV_NAME, open);
      }));

  private readonly toggleSidebar$ = this.peSocialHeaderService.toggleSidebar$
    .pipe(
      tap(() => {
        this.peGridSidenavService.toggleViewSidebar();
      }));

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private router: Router,

    private envService: EnvService,
    private peGridSidenavService: PeGridSidenavService,
    private pePlatformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peSocialApiService: PeSocialApiService,
    private peSocialEnvService: PeSocialEnvService,
    private peSocialHeaderService: PeSocialHeaderService,
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          const parseUrl = this.router.parseUrl(this.router.url);
          const segments = parseUrl.root.children.primary.segments;
          const path = segments[segments.length - 1].path;
          this.selectFolder = this.sidebarTree.find(folder => folder.data.link === path);
          this.mobileTitle$.next(this.selectFolder?.name);
          this.showMobileTitle$.next(path != PeSocialRoutingPathsEnum.Posts);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  ngOnDestroy(): void {
    this.pePlatformHeaderService.removeSidenav(SIDENAV_NAME);
    this.peSocialEnvService.businessIntegrations = [];
  }

  ngOnInit(): void {
    this.addSidenavItem();
    this.changeHeaderConfig(this.isMobile);
    this.initIcons();

    merge(
      this.resizeListener$,
      this.toggleOpenStatus$,
      this.toggleSidebar$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private addSidenavItem(): void {
    this.pePlatformHeaderService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('social-app.title'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.peGridSidenavService.toggleViewSidebar();
        },
      },
    });
  }

  private changeHeaderConfig(isMobile: boolean): void {
    this.pePlatformHeaderService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }

  private initIcons(): void {
    Object.entries(ICONS).forEach(([icon, path]) => {
      const url = this.domSanitizer.bypassSecurityTrustResourceUrl(path);
      this.matIconRegistry.addSvgIcon(icon, url);
    });
  }

  public navigateTo(folder: FolderItem): void {
    this.router.navigate([folder.data.link], { relativeTo: this.activatedRoute }).then(() => {
      this.mobileTitle$.next(folder.name);
    });
  }
}
