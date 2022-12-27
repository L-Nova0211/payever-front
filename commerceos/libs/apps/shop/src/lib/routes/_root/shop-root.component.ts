import {
  ChangeDetectorRef,
  ChangeDetectionStrategy,
  Component,
  OnInit,
  Inject,
  NgZone,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { isEqual } from 'lodash-es';
import { BehaviorSubject, fromEvent, merge, of } from 'rxjs';
import { catchError, filter, first, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, MessageBus, PeDestroyService, PeHelpfulService } from '@pe/common';
import { FolderApply, FolderItem, FolderService } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService, TranslationLoaderService } from '@pe/i18n';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { SHOP_NAVIGATION } from '../../constants';
import { AbbreviationPipe } from '../../misc/pipes/abbreviation.pipe';
import { ShopEnvService } from '../../services/shop-env.service';
import { PeShopRoutingPathsEnum } from '../../misc/enums/routing-paths.enum';

export const SIDENAV_NAME = 'app-shop-sidenav';

@Component({
  selector: 'peb-shop',
  templateUrl: './shop-root.component.html',
  styleUrls: ['./shop-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, AbbreviationPipe],
})
export class PebShopComponent implements OnInit, OnDestroy {
  translationsReady$ = new BehaviorSubject(false);

  loaded = false;
  theme = (this.shopEnvService.businessData?.themeSettings?.theme) ?
    AppThemeEnum[this.shopEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  shop: any = this.route.snapshot.data.shop;

  treeData: FolderItem[] = SHOP_NAVIGATION.map(folder => ({
    ...folder,
    name: this.translateService.translate(folder.name),
  }));

  selectedFolder: FolderItem;
  mobileTitle$ = new BehaviorSubject<string>('');
  showMobileTitle$ = new BehaviorSubject<boolean>(true);
  isMobile = document.body.clientWidth <= 720;

  constructor(
    private router: Router,
    private translationLoaderService: TranslationLoaderService,
    private translateService: TranslateService,
    private route: ActivatedRoute,
    private messageBus: MessageBus,
    private peGridSidenavService: PeGridSidenavService,
    @Inject(EnvService) private shopEnvService: ShopEnvService,
    private cdr: ChangeDetectorRef,
    private destroy$: PeDestroyService,
    private peHelpfulService: PeHelpfulService,
    private folderService: FolderService,
    private abbreviationPipe: AbbreviationPipe,
    private ngZone: NgZone,
    private headerService: PePlatformHeaderService,
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd),
      tap(() => {
        if (!isEqual(this.shop, this.route.snapshot.data.shop)) {
          this.updateFolder(this.route.snapshot.data.shop);
          this.shop = this.route.snapshot.data.shop;
        }


        const parseUrl = this.router.parseUrl(this.router.url);
        const segments = parseUrl.root.children.primary.segments;
        const path = segments[4].path;



        this.selectedFolder = this.treeData.find(folder => folder.data.link === path);
        this.showMobileTitle$.next(path != PeShopRoutingPathsEnum.Themes);
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();

    this.messageBus.listen('shop.toggle.sidebar').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroy$),
    ).subscribe();

    if (this.shopEnvService.shopId && !this.route.snapshot.children.length) {
      this.router.navigate([this.shopEnvService.shopId, 'dashboard'], { relativeTo: this.route })
    }
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.markForCheck();
  }

  navigateTolLink(folder: FolderItem) {
    this.router.navigate([this.shopEnvService.shopId, folder.data.link], { relativeTo: this.route });
    this.mobileTitle$.next(folder.name);
  }

  ngOnInit() {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('shop-app.sidebar.title'),
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
    this.updateFolder(this.shop);

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
    this.translationLoaderService.loadTranslations(['commerceos-shop-app']).pipe(
      catchError((err) => {
        console.warn('Cant load translations for domains', ['commerceos-shop-app'], err);

        return of(true);
      }),
      takeUntil(this.destroy$),
    ).subscribe(() => {
      this.translationsReady$.next(true);
    });
  }

  private updateFolder(shop) {
    const updateFolder: FolderApply = {
      _id: '0',
      name: shop?.name,
    };

    if (shop?.picture) {
      this.peHelpfulService.isValidImgUrl(shop.picture).then((res) => {
        if (res.status === 200) {
          updateFolder.image = shop.picture;
          updateFolder.abbrText = null;
          this.treeData[0].image = shop.picture;
        } else {
          updateFolder.image = null;
          updateFolder.abbrText = this.abbreviationPipe.transform(shop?.name);
          this.treeData[0].abbrText = this.abbreviationPipe.transform(shop?.name);
        }

        this.folderService.updateFolder$.next(updateFolder);
        this.updateShopFolder(updateFolder);

        this.cdr.detectChanges();
      });

      return;
    }

    this.ngZone.onStable.pipe(
      first(),
      tap(() => {
        this.updateShopFolder(updateFolder);
        this.folderService.updateFolder$.next({
          ...updateFolder,
          abbrText: this.abbreviationPipe.transform(shop?.name),
        });
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  private updateShopFolder(updateFolder): void {
    if (!this.selectedFolder || this.selectedFolder?._id === '0') {
      this.mobileTitle$.next(updateFolder.name);
    }
  }
}
