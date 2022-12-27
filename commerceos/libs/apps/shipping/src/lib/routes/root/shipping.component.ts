import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Event, NavigationEnd, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { BaseComponent } from '../../misc/base.component';
import { PebShippingSidebarService } from '../../services/sidebar.service';
import { PeShippingRoutingPathsEnum } from '../../misc/enums/routing-paths.enum';

const SIDENAV_NAME = 'app-shipping-sidenav';


@Component({
  selector: 'peb-shipping-root',
  templateUrl: './shipping.component.html',
  styleUrls: ['./shipping.component.scss'],
})
export class PebShippingComponent extends BaseComponent implements OnInit, OnDestroy {
  translationsReady$ = new BehaviorSubject(false);

  isMobile = window.innerWidth <= 720;

  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  treeData: FolderItem<{link: string}>[] = this.sidebarService.createSidebar();
  activeFolder: FolderItem;
  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);

  constructor(
    public sidebarService: PebShippingSidebarService,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private envService: EnvService,
    private apmService: ApmService,
    private destroyed$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    private headerService: PePlatformHeaderService,
    protected translateService: TranslateService,
  ) {
    super(translateService);

    this.router.events.pipe(
      filter((e: Event) => e instanceof NavigationEnd),
      tap(() => {
        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        const path = segments[3]?.path;

        if (path) {
          this.activeFolder = this.treeData.find(folder => folder.data.link === path);
          this.mobileTitle$.next(this.activeFolder?.name ?? '');
          this.showMobileTitle$.next(path != PeShippingRoutingPathsEnum.Packages)
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.headerService.toggleSidenavActive(SIDENAV_NAME, this.peGridSidenavService.toggleOpenStatus$.value);
  }

  navigateTolLink(folder: FolderItem) {
    this.router.navigate([folder.data.link], { relativeTo: this.route.parent }).then(() => {
      this.mobileTitle$.next(folder.name);
      this.cdr.markForCheck();
    });

  }

  ngOnInit() {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('shipping-app.main_nav.name'),
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
    });
    this.peGridSidenavService.toggleOpenStatus$.next(true);
    this.changeHeaderConfig(this.isMobile);

    merge(
      fromEvent(window, 'resize').pipe(
        tap(() => {
          const isMobile = window.innerWidth <= 720;

          if (isMobile !== this.isMobile) {
            this.isMobile = isMobile;
            this.changeHeaderConfig(isMobile);
          }
        }),
      ),
      this.peGridSidenavService.toggleOpenStatus$.pipe(
        tap((open: boolean) => {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, open);
        }),
      ),
      this.messageBus.listen('shipping.app.toggle.sidebar').pipe(
        tap(() => {
          console.log('shipping.app.toggle.sidebar');
          this.toggleSidebar();
        })
      )
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    this.initTranslations();
  }

  ngOnDestroy(): void {
    this.headerService.removeSidenav(SIDENAV_NAME);
  }

  private changeHeaderConfig(isMobile: boolean) {
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }

  private initTranslations(): void {
    this.translationLoaderService
      .loadTranslations(['commerceos-shipping-app', 'filters-app'])
      .pipe(
        catchError((err) => {
          this.apmService.apm.captureError(
            `Cant load translations for domains ms:\n ${JSON.stringify(err)}`
          );

          return of(true);
        }),
        takeUntil(this.destroyed$),
      )
      .subscribe(() => {
        this.translationsReady$.next(true);
      });
  }
}
