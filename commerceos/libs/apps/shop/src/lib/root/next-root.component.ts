import { Component, ViewEncapsulation, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { fromEvent, merge } from 'rxjs';
import { tap, takeUntil, take, filter, map, distinctUntilChanged } from 'rxjs/operators';

import { PebEditorWs } from '@pe/builder-api';
import { PeBuilderShareService } from '@pe/builder-share';
import { BusinessInterface, BusinessState } from '@pe/business';
import { MessageBus, EnvService, AppThemeEnum, PeDestroyService, PE_ENV } from '@pe/common';
import { PeHeaderMenuService } from '@pe/header';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PEB_SHOP_HOST } from '../constants';
import { ShopEnvService } from '../services';
import { PeShopHeaderService } from '../services/shop-header.service';

@Component({
  selector: 'cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: [
    './next-root.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [
    PeDestroyService,
    {
      provide: PEB_SHOP_HOST,
      deps: [PE_ENV],
      useFactory: env => env.primary.shopHost,
    },
  ],
})
export class CosNextRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  readonly destroyed$ = this.destroy$.asObservable();

  theme: string;
  isMobile = window.innerWidth < 720;
  isBuilderPage: boolean

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private shopHeaderService: PeShopHeaderService,
    private platformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private headerMenu: PeHeaderMenuService,
    @Inject(EnvService) private envService: ShopEnvService,
    @Inject(PEB_SHOP_HOST) private pebShopHost: string,
    private builderShare: PeBuilderShareService,
    private editorWs: PebEditorWs,
  ) {
    this.theme = (this.businessData?.themeSettings?.theme) ? AppThemeEnum[this.businessData.themeSettings.theme]
      : AppThemeEnum.default;
    this.envService.businessData = this.businessData;
    this.envService.businessId = this.businessData._id;
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
      'settings',
    ]);
    
    merge(
      this.messageBus.listen('message.box.redirect').pipe(
        tap((url: string) => { this.router.navigateByUrl(url) }),
      ),
      this.messageBus.listen('shop.open').pipe(
        tap((shop: any) => {
          if (shop?.accessConfig?.internalDomain) {
            window.open(`https://${shop.accessConfig.internalDomain}.${this.pebShopHost}`);
          }
        }),
      ),
      this.messageBus.listen('shop.navigate.edit').pipe(
        tap((shopId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/edit`)
        }),
      ),
      this.messageBus.listen('shop.navigate.dashboard').pipe(
        tap((shopId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/dashboard`)
        }),
      ),
      this.messageBus.listen('shop.navigate.settings').pipe(
        tap((shopId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/settings`)
        }),
      ),
        this.messageBus.listen('shop.navigate.themes').pipe(
          tap((shopId) => {
            this.router.navigateByUrl(`business/${this.envService.businessId}/shop/${shopId}/themes`)
          }),
        ),
      this.messageBus.listen(`shop.builder.init`).pipe(
        tap(() => {
          this.isBuilderPage = true;
          if (this.isMobile) {
            this.mobileHeaderInit('init')
          } else {
            this.desktopHeaderInit('init')
          }
        }),
      ),
      this.messageBus.listen('shop.header.config').pipe(
        tap(config => this.platformHeaderService.assignConfig(config ?? this.platformHeaderService.config)),
      ),
      this.messageBus.listen(`shop.builder.destroy`).pipe(
        tap(() => {
          this.isBuilderPage = false;
          this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
            leftSectionItems: null,
          }))
        }),
      ),
      this.messageBus.listen(`shop.theme.open`).pipe(
        tap(({ themeId, isMobile }) => {
          if (themeId) {
            this.router.navigate(
              [`business/${this.envService.businessId}/shop/${this.envService.shopId}/builder/${themeId}/edit`],
              isMobile ? { queryParams: { isMobile } } : {}
            );

            return;
          }
          this.router.navigate([`business/${this.envService.businessId}/shop/${this.envService.shopId}/edit`])
        })),
      this.messageBus.listen('shop.theme.installed').pipe(tap((isMobile: boolean) => {
        this.router.navigate(
          [`business/${this.envService.businessId}/shop/${this.envService.shopId}/edit`],
          isMobile ? { queryParams: { isMobile } } : {}
        )
      })),

      fromEvent(window, 'resize').pipe(
        map(() => window.innerWidth < 720),
        distinctUntilChanged(),
        tap((isMobile) => {
          this.isMobile = isMobile;
          if (this.isMobile) {
            this.mobileHeaderInit('resize');
          } else {
            this.desktopHeaderInit('resize');
          }
        }),
      ),
    ).pipe(takeUntil(this.destroy$))
      .subscribe();

    this.shopHeaderService.initialize();

    this.platformHeaderService.config$.pipe(
      filter(config => config !== null),
      take(1),
      tap(() => {
        if (this.isBuilderPage) {
          if (this.isMobile) {
            this.mobileHeaderInit()
          } else {
            this.desktopHeaderInit()
          }
        }
      }),
    ).subscribe();
  }

  mobileHeaderInit(event?: string) {
    const items: any = [
      {
        icon: '#icon-header-menu',
        iconSize: '25px',
        iconType: 'vector',
        onClick: (e) => {
          const data = {
            option: [
              {
                title: this.translateService.translate('header.left_section_items.menu'),
                icon: '#icon-edit-pencil-24',
                list: [
                  {
                    label: this.translateService.translate('header.left_section_items.view'),
                    value: 'builder-view',
                    icon: '#icon-apps-builder-view',
                  },
                  {
                    label: this.translateService.translate('header.left_section_items.publish'),
                    value: 'builder-publish',
                    icon: '#icon-apps-builder-publish',
                  },
                  {
                    label: this.translateService.translate('header.left_section_items.edit'),
                    value: 'builder-edit',
                    icon: '#icon-apps-builder-publish',

                  },
                  {
                    label: this.translateService.translate('header.left_section_items.insert'),
                    value: 'builder-insert',
                    icon: '#icon-apps-builder-publish',
                  },
                ],
              },
            ],
          };

          const dialogRef = this.headerMenu.open({ data, theme: this.theme });
          dialogRef.afterClosed.subscribe((d) => {
            this.messageBus.emit(`shop.${d}.open`, { sectionItem: { class: 'next-shop__header-button' } });
          });
        },
      },
    ];

    if (this.isBuilderPage && this.platformHeaderService.config) {
      this.platformHeaderService.assignConfig(
        Object.assign({}, this.platformHeaderService.config, { leftSectionItems: items }),
      );
    }
  }

  /** Sets desktop header */
  desktopHeaderInit(event?: string) {
    const items: any = [
      {
        title: this.translateService.translate('header.left_section_items.view'),
        icon: '#icon-apps-builder-view',
        class: 'next-shop__header-button',
        iconType: 'vector',
        iconSize: '24px',
        isActive: true,
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[0];
          this.messageBus.emit('shop.builder-view.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.publish'),
        icon: '#icon-apps-builder-publish',
        class: 'next-shop__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: (event: Event) => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[1];
          this.messageBus.emit('shop.builder-publish.open', { sectionItem, event })
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.edit'),
        icon: '#icon-apps-builder-publish',
        class: 'next-shop__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[2];
          this.messageBus.emit('shop.builder-edit.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.insert'),
        icon: '#icon-apps-builder-publish',
        class: 'next-shop__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[3];
          this.messageBus.emit('shop.builder-insert.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('Share'),
        icon: '#icon-apps-builder-publish',
        class: 'next-shop__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          this.builderShare.openGetLinkDialog({ appType: 'shop' });
        },
      },
    ];

    if (this.isBuilderPage && this.platformHeaderService.config) {
      this.platformHeaderService.assignConfig(
        Object.assign({}, this.platformHeaderService.config, { leftSectionItems: items }),
      );
    }
  }

  ngOnDestroy() {
    this.shopHeaderService.destroy();
    this.editorWs.close();
  }

}
