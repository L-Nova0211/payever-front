import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, pluck, takeUntil, tap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { AppThemeEnum, MessageBus } from '@pe/common';
import { FolderItem } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { AbstractComponent } from '../../components/abstract';
import { WelcomeDialogComponent } from '../../components/dialogs/welcome-dialog/welcome-dialog.component';
import {
  SETTINGS_NAVIGATION,
  settingsBusinessIdRouteParam,
  SidebarAnimationProgress,
} from '../../misc/constants';
import { WelcomeDialogDataInterface } from '../../misc/interfaces/welcome-dialog-data.interface';
import { BusinessEnvService } from '../../services';
import { SettingsRoutesEnum } from '../../settings-routes.enum';

const SIDENAV_NAME = 'app-settings-sidenav';

@Component({
  selector: 'peb-settings',
  templateUrl: './settings-root.component.html',
  styleUrls: ['./settings-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PebSettingsComponent extends AbstractComponent implements OnInit {
  translationsReady$ = new BehaviorSubject(false);

  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  selectedFolder: FolderItem = null;
  isMobile = document.body.clientWidth <= 720;
  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);

  SidebarAnimationProgress = SidebarAnimationProgress;

  treeData: FolderItem[] = SETTINGS_NAVIGATION
    .filter(item => item.data.owners.includes(this.envService.ownerType))
    .map(item => ({
      ...item,
      name: this.translateService.translate(item.name),
    }));

  constructor(
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private envService: BusinessEnvService,
    private cosEnvService: CosEnvService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private peGridSidenavService: PeGridSidenavService,
    private translateService: TranslateService,
    private headerService: PePlatformHeaderService,
  ) {
    super();
    this.messageBus.listen(`settings.toggle.sidebar`).pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroyed$),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();

    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd),
      tap(() => {
        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        const path = segments[3].path;

        this.selectedFolder = this.treeData.find(folder => folder.data.link === path);
        this.mobileTitle$.next(this.selectedFolder?.name);
        this.showMobileTitle$.next(![
          SettingsRoutesEnum.Wallpaper,
          SettingsRoutesEnum.Employees,
        ].includes(path as SettingsRoutesEnum));
      })
    ).pipe(takeUntil(this.destroyed$)).subscribe();
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.markForCheck();
  }

  navigateToLink(folder: FolderItem) {
    const url = this.cosEnvService.isPersonalMode
      ? `/personal/${this.envService.userAccount._id}`
      : `/business/${this.envService.businessUuid}`;

    this.router.url.split('/')[4] !== folder.data.link
    && this.router.navigate([`${url}/settings/${folder.data.link}`]).then(() => {
      this.mobileTitle$.next(this.selectedFolder?.name);
    });
    this.messageBus.emit(`${this.entityName}.navigate.${folder._id}`, this.envService.businessId);
  }

  ngOnInit() {
    this.initTranslations();

    if (this.envService.businessId && !this.route.snapshot.children.length) {
      this.messageBus.emit(`${this.entityName}.navigate.dashboard`, this.envService.businessId);
    }

    this.messageBus.listen('change.theme').pipe(takeUntil(this.destroyed$)).subscribe((theme: string) => {
      this.theme = AppThemeEnum[theme];
      this.cdr.detectChanges();
    });

    this.route.data.pipe(
      pluck('microId'),
      filter(shouldDisplay => !!shouldDisplay),
      takeUntil(this.destroyed$),
    ).subscribe(microId => this.showWelcomeDialog(microId));

    this.addSidenavItem();
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
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  private initTranslations(): void {
    this.translationLoaderService.loadTranslations(['settings-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['settings-app'], err);

        return of(true);
      }),
      takeUntil(this.destroyed$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private showWelcomeDialog(appId: string) {
    const data: WelcomeDialogDataInterface = {
      business: this.route.snapshot.params[settingsBusinessIdRouteParam],
      micro: appId,
    };

    this.dialog.open(WelcomeDialogComponent, {
      panelClass: 'settings-dialog',
      data,
    });
  }

  private addSidenavItem(): void {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('sidebar.title'),
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
  }

  private changeHeaderConfig(isMobile: boolean): void {
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }
}
