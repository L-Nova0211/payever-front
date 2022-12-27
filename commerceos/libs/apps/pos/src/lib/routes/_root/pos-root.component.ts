import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  NgZone,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, NavigationEnd, Router, RoutesRecognized, UrlSegment } from '@angular/router';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import {  filter, first, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  EnvService,
  MessageBus,
  PeDestroyService,
  PeHelpfulService,
  PE_ENV,
} from '@pe/common';
import { FolderApply, FolderItem, FolderService } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';
import { TerminalInterface } from '../../services/pos.types';
import { PosEnvService } from '../../services/pos/pos-env.service';

export const SIDENAV_NAME = 'app-pos-sidenav';

@Component({
  selector: 'peb-pos',
  templateUrl: './pos-root.component.html',
  styleUrls: ['./pos-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService, AbbreviationPipe ],
})
export class PebPosComponent implements OnInit, OnDestroy {
  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  terminal: TerminalInterface = this.route.snapshot.data.terminal;

  treeData: FolderItem<{link: string}>[] = this.createTree();
  selectedFolder: FolderItem;
  isPreloadDashboard$ = new BehaviorSubject(false);
  mobileTitle$ = new BehaviorSubject<string>('');
  isMobile = document.body.clientWidth <= 720;

  constructor(
    private router: Router,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: PosEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private domSanitizer: DomSanitizer,
    private peGridSidenavService: PeGridSidenavService,
    private folderService: FolderService,
    private peHelpfulService: PeHelpfulService,
    private abbreviationPipe: AbbreviationPipe,
    private ngZone: NgZone,
    private headerService: PePlatformHeaderService,
  ) {
    this.router.events.pipe(
      filter((event) => {
        if (event instanceof RoutesRecognized) {
          // TODO: temporary hack for load screen saver for the dashboard
          this.isPreloadDashboard$.next(
            event.url.includes('/dashboard') && !this.route.snapshot.data?.hidePreloadBg
            && !(this.router.url.includes('/connect') || this.router.url.includes('/settings'))
          );
        }

        return event instanceof NavigationEnd
      }),
      tap(() => {
        if (!isEqual(this.terminal, this.route.snapshot.data.terminal)) {
          this.updateFolder(this.route.snapshot.data.terminal);
          this.terminal = this.route.snapshot.data.terminal;
        }

        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        const path = segments[segments.length - 1].path;

        this.selectedFolder = this.treeData.find(folder => folder.data.link === path);
        this.mobileTitle$.next(this.selectedFolder?._id === '0' ? this.terminal.name : this.selectedFolder?.name);
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.messageBus.listen('pos.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  getActiveLink(nodeId) {
    const urlTree = this.router.parseUrl(this.router.url);
    const segmentsPath = urlTree.root.children.primary.segments.reduce(
      (acc, item: UrlSegment) => [...acc, item.path],
      [],
    );

    return segmentsPath.includes(nodeId);
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.headerService.toggleSidenavActive(SIDENAV_NAME, this.peGridSidenavService.toggleOpenStatus$.value);
    this.cdr.markForCheck();
  }

  navigateTolLink(folder: FolderItem) {
    this.messageBus.emit(`pos.navigate.${folder.data.link}`, this.envService.posId);
    this.mobileTitle$.next(folder._id === '0' ? this.terminal.name : folder.name);
  }

  ngOnInit() {
    this.updateFolder(this.terminal);
    if (this.envService.posId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`pos.navigate.dashboard`, this.envService.posId);
    }

    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('pos-app.sidebar.title'),
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

  private createTree(): FolderItem<{link: string}>[] {
    return [
      {
        _id: '0',
        position: 0,
        name: ' ',
        isAvatar: true,
        isProtected: true,
        data: {
          link: 'dashboard',
        },
      },
      {
        _id: '1',
        position: 1,
        name: this.translateService.translate('pos-app.navigation.connect'),
        image: this.getCDNIcon('app-icon-connect.svg'),
        isProtected: true,
        data: {
          link: 'connect',
        },
      },
      {
        _id: '2',
        position: 2,
        name: this.translateService.translate('pos-app.navigation.settings'),
        image: this.getCDNIcon('app-icon-settings.svg'),
        isProtected: true,
        data: {
          link: 'settings',
        },
      },
    ];
  }

  private getCDNIcon(icon: string, folder = 'icons'): string {
    return this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/${folder}/${icon}`) as string;
  }

  private updateFolder(terminal) {
    const updateFolder: FolderApply = {
      _id: '0',
      name: terminal?.name,
    };

    if (terminal?.logo) {
      this.peHelpfulService.isValidImgUrl(terminal.logo).then((res) => {
        if (res.status === 200) {
          updateFolder.image = terminal.logo;
          updateFolder.abbrText = null;
          this.treeData[0].image = terminal.logo;
        } else {
          updateFolder.image = null;
          updateFolder.abbrText = this.abbreviationPipe.transform(terminal?.name);
          this.treeData[0].abbrText = this.abbreviationPipe.transform(terminal?.name);
        }

        this.folderService.updateFolder$.next(updateFolder);

        this.cdr.detectChanges();
      });

      return;
    }

    if (this.selectedFolder?._id === '0') {
      this.mobileTitle$.next(updateFolder.name);
    }

    this.ngZone.onStable.pipe(
      first(),
      tap(() => {
        this.folderService.updateFolder$.next({
          ...updateFolder,
          abbrText: this.abbreviationPipe.transform(terminal?.name),
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

}
