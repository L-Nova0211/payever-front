import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { merge } from 'rxjs';
import { takeUntil, tap } from 'rxjs/operators';

import { PebEditorWs } from '@pe/builder-api';
import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum, EnvService, MessageBus, PeDestroyService } from '@pe/common';
import { PeHeaderMenuService } from '@pe/header';
import { TranslateService } from '@pe/i18n';
import { PePlatformHeaderService } from '@pe/platform-header';
import { WallpaperService } from '@pe/wallpaper';

import { PEB_INVOICE_HOST } from '../constants';
import { InvoiceInterface } from '../interfaces/filter.interface';
import { PeInvoiceHeaderService } from '../invoice-header.service';
import { InvoiceEnvService } from '../services/invoice-env.service';

@Component({
  selector: 'cos-invoice-root',
  templateUrl: './cos-invoice-root.component.html',
  styleUrls: ['./cos-invoice-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [ PeDestroyService ],
})
export class CosInvoiceRootComponent implements OnInit, OnDestroy {
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  isBuilderPage: boolean;
  isMobile = window.innerWidth < 720;
  theme:AppThemeEnum ;
  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private readonly destroy$: PeDestroyService,
    private invoiceHeaderService: PeInvoiceHeaderService,
    private wallpaperService: WallpaperService,
    private translateService: TranslateService,
    private headerMenu: PeHeaderMenuService,
    private platformHeaderService: PePlatformHeaderService,
    @Inject(PEB_INVOICE_HOST) private pebInvoiceHost: string,
    @Inject(EnvService) private envService: InvoiceEnvService,
    private editorWs: PebEditorWs,

  ) {
    this.theme = (this.businessData?.themeSettings?.theme) ? AppThemeEnum[this.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'settings',
    ]);

    merge(
      this.messageBus.listen('invoice.open').pipe(
        tap((invoice: InvoiceInterface) => {
          if (invoice?.accessConfig?.internalDomain) {
            window.open(`https://${invoice.accessConfig.internalDomain}.${this.pebInvoiceHost}`);
          }
        }),
      ),
      this.messageBus.listen('invoice.navigate.edit').pipe(
        tap((invoiceId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/invoice/${this.envService.invoiceId}/edit`)
        }),
      ),
      this.messageBus.listen('invoice.navigate.themes').pipe(
        tap((invoiceId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/invoice/edit`)
        }),
      ),
      this.messageBus.listen(`invoice.builder.init`).pipe(
        tap(() => {
          this.isBuilderPage = true;
          if (this.isMobile) {
            this.mobileHeaderInit('init')
          } else {
            this.desktopHeaderInit('init')
          }
        }),
      ),
      this.messageBus.listen(`invoice.theme.open`).pipe(
        tap(({ themeId, isMobile }) => {
          if (themeId) {
            this.router.navigate(
              [`business/${this.envService.businessId}/invoice/edit`],
              isMobile ? { queryParams: { isMobile } } : {}
            );

            return;
          }
          this.router.navigate([`business/${this.envService.businessId}/invoice/edit`])
        })),
        this.messageBus.listen('invoice.theme.installed').pipe(tap((isMobile: boolean) => {
          this.router.navigate(
            [`business/${this.envService.businessId}/invoice/edit`],
            isMobile ? { queryParams: { isMobile } } : {}
          )
        })),
      this.messageBus.listen('invoice.header.config').pipe(
        tap(config => this.platformHeaderService.assignConfig(config ?? this.platformHeaderService.config)),
      ),

    ).pipe(takeUntil(this.destroy$))
      .subscribe();

    this.wallpaperService.showDashboardBackground(false);

    this.invoiceHeaderService.initialize();
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
            this.messageBus.emit(`invoice.${d}.open`, { sectionItem: { class: 'next-invoice__header-button' } });
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
        class: 'next-invoice__header-button',
        iconType: 'vector',
        iconSize: '24px',
        isActive: true,
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[0];
          this.messageBus.emit('invoice.builder-view.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.publish'),
        icon: '#icon-apps-builder-publish',
        class: 'next-invoice__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: (event: Event) => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[1];
          this.messageBus.emit('invoice.builder-publish.open', { sectionItem, event })
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.edit'),
        icon: '#icon-apps-builder-publish',
        class: 'next-invoice__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[2];
          this.messageBus.emit('invoice.builder-edit.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.insert'),
        icon: '#icon-apps-builder-publish',
        class: 'next-invoice__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[3];
          this.messageBus.emit('invoice.builder-insert.open', { sectionItem });
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
    this.invoiceHeaderService.destroy();
    this.editorWs.close();
  }
}
