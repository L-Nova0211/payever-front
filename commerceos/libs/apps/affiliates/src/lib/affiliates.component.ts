import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { filter, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { AppThemeEnum, PeBuilderEditorRoutingPathsEnum, PeDestroyService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { ICONS } from './constants';
import { PeAffiliatesRoutingPathsEnum } from './enums';
import { PeAffiliatesHeaderService, PeAffiliatesSidebarService } from './services';

const SIDENAV_NAME = 'app-affiliates-sidenav';

@Component({
  selector: 'pe-affiliates',
  templateUrl: './affiliates.component.html',
  styleUrls: ['./affiliates.component.scss'],
  providers: [PeDestroyService],
})
export class PeAffiliatesComponent implements OnDestroy, OnInit {
  public selectFolder: FolderItem<{ link: PeAffiliatesRoutingPathsEnum | PeBuilderEditorRoutingPathsEnum }>;

  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  public readonly sidebarTree = this.peAffiliatesSidebarService.createSidebar();

  private isMobile = document.body.clientWidth <= 720;

  public readonly mobileTitle$ = this.peAffiliatesHeaderService.mobileTitle$;
  public readonly showMobileTitle$ = this.peAffiliatesHeaderService.showMobileTitle$;

  private readonly toggleSidebar$ = this.peAffiliatesHeaderService.toggleSidebar$
    .pipe(
      tap(() => {
        this.toggleSidebar();
      }));

  private readonly toggleSidenavStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((open: boolean) => {
        this.pePlatformHeaderService.toggleSidenavActive(SIDENAV_NAME, open);
      }));

  private readonly windowResize$ = fromEvent(window, 'resize')
    .pipe(
      tap(() => {
        const isMobile = window.innerWidth <= 720;

        if (isMobile !== this.isMobile) {
          this.isMobile = isMobile;
          this.changeHeaderConfig(isMobile);
        }
      }));

  constructor(
    private activatedRoute: ActivatedRoute,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private router: Router,

    private pebEnvService: PebEnvService,
    private peGridSidenavService: PeGridSidenavService,
    private pePlatformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private peAffiliatesHeaderService: PeAffiliatesHeaderService,
    private peAffiliatesSidebarService: PeAffiliatesSidebarService,
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          const parseUrl = this.router.parseUrl(this.router.url);
          const { segments } = parseUrl.root.children.primary;
          const path = segments[segments.length - 1].path;
          this.selectFolder = this.sidebarTree.find(folder => folder.data.link === path);
          this.mobileTitle$.next(this.selectFolder?.name);
          this.showMobileTitle$.next(![
            PeAffiliatesRoutingPathsEnum.Programs,
            PeBuilderEditorRoutingPathsEnum.Themes,
          ].includes(path as PeAffiliatesRoutingPathsEnum));

          switch (path) {
            case PeBuilderEditorRoutingPathsEnum.BuilderEditor:
            case PeBuilderEditorRoutingPathsEnum.BuilderTheme:
              !this.isMobile && this.toggleSidebar();
              break;
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const applicationId = this.pebEnvService.applicationId;
    applicationId && !this.activatedRoute.snapshot.children.length && this.router.navigate(
      [applicationId, PeBuilderEditorRoutingPathsEnum.Dashboard],
      { relativeTo: this.activatedRoute },
    );
  }

  ngOnDestroy(): void {
    this.pePlatformHeaderService.removeSidenav(SIDENAV_NAME);
  }

  ngOnInit(): void {
    this.initIcons();
    this.addSidenavItem();
    this.changeHeaderConfig(this.isMobile);

    merge(
      this.toggleSidebar$,
      this.toggleSidenavStatus$,
      this.windowResize$
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  private addSidenavItem(): void {
    this.pePlatformHeaderService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('affiliates-app.title'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.toggleSidebar();
        },
      },
    })
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
    const { applicationId } = this.pebEnvService;
    this.router.navigate([applicationId, folder.data.link], { relativeTo: this.activatedRoute })
  }

  private toggleSidebar(): void {
    this.peGridSidenavService.toggleViewSidebar();
  }
}
