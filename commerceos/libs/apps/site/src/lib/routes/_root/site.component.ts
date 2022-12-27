import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { isEqual } from 'lodash-es';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, first, takeUntil, tap } from 'rxjs/operators';


import { AppThemeEnum, EnvService, MessageBus, PeDestroyService, PeHelpfulService } from '@pe/common';
import { FolderApply, FolderItem, FolderService } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { TranslationLoaderService } from '@pe/i18n-core';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { SITE_NAVIGATION } from '../../constants';
import { SiteInterface } from '../../misc/interfaces/site.interface';
import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';
import { SiteEnvService } from '../../services/site-env.service';
import { PeSiteRoutingPathsEnum } from '../../misc/enums/routing-paths.enum';

export const SIDENAV_NAME = 'app-site-sidenav';

@Component({
  selector: 'peb-site-root',
  templateUrl: './site.component.html',
  styleUrls: ['./site.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, AbbreviationPipe],
})
export class PebSiteComponent implements OnInit, OnDestroy {
  translationsReady$ = new BehaviorSubject(false);

  loaded = false;
  theme = (this.envService.businessData?.themeSettings?.theme) ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  site: SiteInterface = this.route.snapshot.data.site;

  treeData: FolderItem<{ link: string }>[] = SITE_NAVIGATION.map(folder => ({
    ...folder,
    name: this.translateService.translate(folder.name),
  }));

  selectFolder: FolderItem;
  isMobile = document.body.clientWidth <= 720;

  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: SiteEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    private translateService: TranslateService,
    private peHelpfulService: PeHelpfulService,
    private folderService: FolderService,
    private abbreviationPipe: AbbreviationPipe,
    private ngZone: NgZone,
    private headerService: PePlatformHeaderService,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => {
        if (!isEqual(this.site, this.route.snapshot.data.site)) {
          this.updateFolder(this.route.snapshot.data.site);
          this.site = this.route.snapshot.data.site;
        }

        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        const path = segments[segments.length - 1].path;

        this.selectFolder = this.treeData.find(folder => folder.data.link === path);
        this.mobileTitle$.next(this.selectFolder?.name);
        this.showMobileTitle$.next(path != PeSiteRoutingPathsEnum.Themes);
        if (path == 'edit') {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, this.peGridSidenavService.toggleOpenStatus$.value);
        }

        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.messageBus.listen('site.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();
    if (this.envService.applicationId && !this.route.snapshot.children.length) {
      this.router.navigate([this.envService.applicationId, 'dashboard'], { relativeTo: this.route })
    }
  }

  getActiveLink(nodeId) {
    const urlTree = this.router.parseUrl(this.router.url)
    const newId = urlTree.root.children.primary.segments[urlTree.root.children.primary.segments?.length - 1].path;

    return nodeId === newId;
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.markForCheck();
  }

  navigateToLink(folder: FolderItem) {
    this.router.navigate([this.envService.applicationId, folder.data.link], { relativeTo: this.route }).then(() => {
      this.mobileTitle$.next(folder.name);
      this.cdr.markForCheck();
    });
  }

  ngOnInit() {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('site-app.sidebar.title'),
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
    ).pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.updateFolder(this.site);
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
    this.translationLoaderService.loadTranslations(['commerceos-site-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['commerceos-site-app'], err);

        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private updateFolder(site: SiteInterface) {
    const updateFolder: FolderApply = {
      _id: '0',
      name: site?.name,
    };

    if (site?.picture) {
      this.peHelpfulService.isValidImgUrl(site.picture).then((res) => {
        if (res.status === 200) {
          updateFolder.image = site.picture;
          updateFolder.abbrText = null;
          this.treeData[0].image = site.picture;
        } else {
          updateFolder.image = null;
          updateFolder.abbrText = this.abbreviationPipe.transform(site?.name);
          this.treeData[0].abbrText = this.abbreviationPipe.transform(site?.name);
        }

        this.folderService.updateFolder$.next(updateFolder);
        this.updateSiteFolder(updateFolder);

        this.cdr.detectChanges();
      });

      return;
    }

    this.ngZone.onStable.pipe(
      first(),
      tap(() => {
        this.updateSiteFolder(updateFolder);
        this.folderService.updateFolder$.next({
          ...updateFolder,
          abbrText: this.abbreviationPipe.transform(site?.name),
        });
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private updateSiteFolder(updateFolder): void {
    if (this.selectFolder?._id === '0') {
      this.mobileTitle$.next(updateFolder.name);
    }
  }

}
