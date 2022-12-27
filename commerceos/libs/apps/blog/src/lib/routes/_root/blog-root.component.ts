import { ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router'
import { isEqual } from 'lodash-es';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, first, takeUntil, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { EnvService, PeHelpfulService } from '@pe/common';
import { AppThemeEnum, MessageBus, PeDestroyService } from '@pe/common';
import { FolderApply, FolderItem, FolderService } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { AbbreviationPipe } from '@pe/widgets';

import { BLOG_NAVIGATION } from '../../constants';
import { PeBlogRoutingPathsEnum } from '../../misc/enums/routing-paths.enum';

export const SIDENAV_NAME = 'app-blog-sidenav';

@Component({
  selector: 'peb-blog',
  templateUrl: './blog-root.component.html',
  styleUrls: ['./blog-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService, AbbreviationPipe ],
})
export class PebBlogComponent implements OnInit, OnDestroy {
  translationsReady$ = new BehaviorSubject(false);

  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  blog: any = this.route.snapshot.data.blog;
  isMobile = window.innerWidth <= 720;

  treeData: FolderItem<{link: string}>[] = BLOG_NAVIGATION.map(folder => ({
    ...folder,
    name: this.translateService.translate(folder.name),
  }));

  selectFolder: FolderItem;
  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: EnvService,
    private pebEnvService: PebEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private peGridSidenavService: PeGridSidenavService,
    private peHelpfulService: PeHelpfulService,
    private folderService: FolderService,
    private abbreviationPipe: AbbreviationPipe,
    private ngZone: NgZone,
    private headerService: PePlatformHeaderService,
  ) {
    this.messageBus.listen('blog.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();
    if (this.pebEnvService.applicationId && !this.route.snapshot.children.length) {
      this.router.navigate([this.pebEnvService.applicationId, 'dashboard'], { relativeTo: this.route })
    }
      this.router.events.pipe(
        filter(event => event instanceof NavigationEnd),
        tap(() => {
          if (!isEqual(this.blog, this.route.snapshot.data.blog)) {
            this.updateFolder(this.route.snapshot.data.site);
            this.blog = this.route.snapshot.data.site;
          }

          const parseUrl = this.router.parseUrl(this.router.url);
          const segments = parseUrl.root.children.primary.segments;
          const path = segments[4].path;

          this.selectFolder = this.treeData.find(folder => folder.data.link === path);
          this.showMobileTitle$.next(path != PeBlogRoutingPathsEnum.Themes);

          this.cdr.detectChanges();
        }),
        takeUntil(this.destroy$)
      ).subscribe();

  }

  getActiveLink(nodeId) {
    const urlTree=this.router.parseUrl(this.router.url)
    const newId = urlTree.root.children.primary.segments[urlTree.root.children.primary.segments?.length - 1].path;

    return nodeId === newId;
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.markForCheck();
  }

  navigateToLink(folder: FolderItem) {
    this.messageBus.emit(`blog.navigate.${folder.data.link}`, this.pebEnvService.applicationId);
    this.mobileTitle$.next(folder.name);
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
    ).subscribe((data) => {
      this.blog = this.route.snapshot.data.blog;
      this.cdr.detectChanges();
    })

    if (this.pebEnvService.applicationId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`blog.navigate.dashboard`, this.pebEnvService.applicationId);

    }
    this.initTranslations();
    this.updateFolder(this.blog);

    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('blog-app.navigation.title'),
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
    this.translationLoaderService.loadTranslations(['commerceos-blog-app', 'commerceos-themes-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['commerceos-blog-app'], err);

        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private updateFolder(blog) {
    const updateFolder: FolderApply = {
      _id: '0',
      name: blog?.name,
    };

    if (blog?.picture) {
      this.peHelpfulService.isValidImgUrl(blog.picture).then((res) => {
        if (res.status === 200) {
          updateFolder.image = blog.picture;
          updateFolder.abbrText = null;
          this.treeData[0].image = blog.picture;
        } else {
          updateFolder.image = null;
          updateFolder.abbrText = this.abbreviationPipe.transform(blog?.name);
          this.treeData[0].abbrText = this.abbreviationPipe.transform(blog?.name);
        }

        this.folderService.updateFolder$.next(updateFolder);
        this.updateBlogFolder(updateFolder);

        this.cdr.detectChanges();
      });

      return;
    }

    this.ngZone.onStable.pipe(
      first(),
      tap(() => {
        this.updateBlogFolder(updateFolder);
        this.folderService.updateFolder$.next({
          ...updateFolder,
          abbrText: this.abbreviationPipe.transform(blog?.name),
        });
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private updateBlogFolder(updateFolder): void {
    if (!this.selectFolder || this.selectFolder?._id === '0') {
      this.mobileTitle$.next(updateFolder.name);
    }
  }
}
