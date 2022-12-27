import { ChangeDetectorRef, Component, NgZone, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { BehaviorSubject, fromEvent, merge } from 'rxjs';
import { first, take, takeUntil, tap } from 'rxjs/operators';

import { MessageBus, PebDeviceService, PeDestroyService, PeHelpfulService } from '@pe/common';
import { FolderApply, FolderItem, FolderService } from '@pe/folders';
import { PeGridSidenavService } from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderService, PePlatformHeaderConfig } from '@pe/platform-header';
import { PeSimpleStepperService } from '@pe/stepper';

import { CheckoutInterface } from '../../interfaces';
import { StorageService } from '../../services';
import { AbbreviationPipe, CHECKOUT_NAVIGATION } from '../../shared';

const SIDENAV_NAME = 'app-checkout-sidenav';

@Component({
  selector: 'checkout-layout',
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.scss'],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
    PebDeviceService,
    AbbreviationPipe,
  ],
})
export class LayoutComponent implements OnInit, OnDestroy {

  currentCheckout: CheckoutInterface;
  theme = 'dark';
  checkoutIconLoadingError: boolean;

  activeFolder: FolderItem;
  treeData = CHECKOUT_NAVIGATION.map(item => ({
    ...item,
    name: this.translateService.translate(item.name),
  }));

  foldersData$ = new BehaviorSubject<FolderItem[]>(this.treeData);
  mobileTitle$ = new BehaviorSubject<string>('');
  isMobile = document.body.clientWidth <= 720;

  readonly fromEventResize$ = fromEvent(window, 'resize').pipe(
    tap(() => {
      const isMobile = window.innerWidth <= 720;

      if (isMobile !== this.isMobile) {
        this.isMobile = isMobile;
        this.changeHeaderConfig(isMobile);
      }
    }),
  );

  readonly toggleOpenStatus$ = this.peGridSidenavService.toggleOpenStatus$.pipe(
    tap((open: boolean) => {
      this.headerService.toggleSidenavActive(SIDENAV_NAME, open);
    }),
  );

  readonly routerEvents$ = this.router.events.pipe(
    tap((event) => {
      if (event instanceof NavigationEnd) {
        if (this.checkoutUuid !== 'create' && this.checkoutUuid !== this.currentCheckout?._id) {
          this.getCurrentCheckout();
        }
        this.setActiveFilterFromUrl(this.router.url);
        this.changeHeaderConfig(this.isMobile);
      }
    })
  );

  readonly checkoutUpdate$ = this.storageService.checkoutUpdate$.pipe(
    tap(() => this.getCurrentCheckout())
  );

  readonly checkoutToggleSidebar$ = this.messageBus.listen('checkout.toggle.sidebar').pipe(
    tap(() => this.toggleSidebar()),
  );

  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private storageService: StorageService,
    private destroyed$: PeDestroyService,
    public peSimpleStepperService: PeSimpleStepperService,
    public headerService: PePlatformHeaderService,
    public translateService: TranslateService,
    public deviceService: PebDeviceService,
    private peHelpfulService: PeHelpfulService,
    private abbreviationPipe: AbbreviationPipe,
    private folderService: FolderService,
    private peGridSidenavService: PeGridSidenavService,
    private ngZone: NgZone,
    private messageBus: MessageBus,
  ) {
    this.peSimpleStepperService.translateFunc = (line: string) => this.translateService.translate(line);
    this.peSimpleStepperService.hasTranslationFunc = (key: string) => this.translateService.hasTranslation(key);
  }

  ngOnInit() {
    merge(
      this.fromEventResize$,
      this.toggleOpenStatus$,
      this.routerEvents$,
      this.checkoutUpdate$,
      this.checkoutToggleSidebar$
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.storageService.getBusiness()
      .pipe(takeUntil(this.destroyed$))
      .subscribe((business) => {
        this.theme = business?.themeSettings?.theme
          && business?.themeSettings?.theme !== 'default' ? business.themeSettings.theme : 'dark';
      });

    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('header.all_folders'),
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

    this.setActiveFilterFromUrl(this.router.url);
  }

  ngOnDestroy(): void {
    this.peSimpleStepperService.translateFunc = null;
    this.peSimpleStepperService.hasTranslationFunc = null;
    this.headerService.removeSidenav(SIDENAV_NAME);
  }

  navigateTolLink(folder: FolderItem): void {
    if (!this.currentCheckout?._id) {
      return;
    }

    this.router.navigate(
      [
        '..',
        'checkout',
        this.currentCheckout._id, folder.data.link,
      ],
      { relativeTo: this.activatedRoute }
    ).then(() => {
      this.mobileTitle$.next(folder.name);
    });
  }

  get checkoutUuid(): string {
    return window.location.pathname.split('/')[4];
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.headerService.toggleSidenavActive(SIDENAV_NAME, this.peGridSidenavService.toggleOpenStatus$.value);
  }

  setActiveFilterFromUrl(url: string) {
    if (!this.activeFolder || !url.includes(`/${this.activeFolder.data.link}`)) {
      this.activeFolder = this.treeData.find((folder) => {
        return url.includes(`/${folder.data.link}`);
      });
      this.mobileTitle$.next(this.activeFolder?.name ?? '');
      if (this.activatedRoute.snapshot.queryParams?.editCheckout === 'true') {
        this.activeFolder = this.treeData[3];
      }
    }
  }

  getCurrentCheckout(): void {
    this.storageService.getCheckoutByIdOnce(this.checkoutUuid).pipe(
      take(1),
      tap((checkout) => {
        const updateFolder: FolderApply = {
          _id: '0',
          name: checkout?.name,
        };
        this.currentCheckout = checkout;
        this.treeData[0].name = checkout.name || ' ';

        if (checkout?.logo) {
          this.peHelpfulService.isValidImgUrl(checkout.logo).then((res) => {
            if (res.status === 200) {
              updateFolder.image = checkout.logo;
              updateFolder.abbrText = null;
              this.treeData[0].image = checkout.logo;
            } else {
              updateFolder.image = null;
              updateFolder.abbrText = this.abbreviationPipe.transform(checkout?.name);
              this.treeData[0].abbrText = this.abbreviationPipe.transform(checkout?.name);
            }

            this.folderService.updateFolder$.next(updateFolder);
          });
        }

        if (this.activeFolder?._id === '0') {
          this.mobileTitle$.next(updateFolder.name);
        }

        this.ngZone.onStable.pipe(
          first(),
          tap(() => {
            this.folderService.updateFolder$.next({
              ...updateFolder,
              abbrText: this.abbreviationPipe.transform(checkout?.name),
            });
          })
        ).subscribe();
      }),
    ).subscribe(() => {
    }, () => this.currentCheckout = null);
  }

  private changeHeaderConfig(isMobile: boolean): void {
    this.headerService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }
}
