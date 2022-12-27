import {
  ChangeDetectionStrategy,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { fromEvent, merge } from 'rxjs';
import { distinctUntilChanged, filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorWs } from '@pe/builder-api';
import { PeBuilderShareService } from '@pe/builder-share';
import { AppThemeEnum, MessageBus, EnvService, PeDestroyService } from '@pe/common';
import { PeHeaderMenuService } from '@pe/header';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderService } from '@pe/platform-header';
import { WallpaperService } from '@pe/wallpaper';

import { PEB_SITE_HOST, SiteEnvService } from '..';
import { PeSiteHeaderService } from '../services/site-header.service';

@Component({
  selector: 'user-sites-root',
  templateUrl: './sites-root.component.html',
  styleUrls: ['./sites-root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class CosSitesRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  theme = (this.envService.businessData?.themeSettings?.theme) ?
    AppThemeEnum[this.envService?.businessData?.themeSettings?.theme] : AppThemeEnum.default;

  isMobile = window.innerWidth < 720;
  isBuilderPage: boolean

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    @Inject(EnvService) private envService: SiteEnvService,
    private siteHeaderService: PeSiteHeaderService,
    private platformHeaderService: PePlatformHeaderService,
    private headerMenu: PeHeaderMenuService,
    private translateService: TranslateService,
    @Inject('PEB_ENTITY_NAME') private entityName: string,
    @Inject(PEB_SITE_HOST) private siteHost: string,
    private destroy$: PeDestroyService,
    protected wallpaperService: WallpaperService,
    private builderShare: PeBuilderShareService,
    private editorWs: PebEditorWs,
  ) {
  }

  ngOnInit() {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'set',
      'apps',
      'settings',
    ]);
    
    this.siteHeaderService.initialize();
    this.wallpaperService.showDashboardBackground(false);
    merge(
      this.messageBus.listen(`${this.entityName}.navigate.dashboard`).pipe(
        tap((siteId: string) =>
          this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/dashboard`)),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.themes`).pipe(
        tap((siteId: string) =>
          this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/themes`)),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.settings`).pipe(
        tap((siteId: string) =>
          this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/settings`)),
      ),
      this.messageBus.listen(`${this.entityName}.navigate.edit`).pipe(
        tap((siteId: string) =>
          this.router.navigateByUrl(`business/${this.envService.businessId}/site/${siteId}/edit`)
        ),
      ),
      this.messageBus.listen(`${this.entityName}.open-site`).pipe(
        filter((site: any) => !!site?.accessConfig?.internalDomain),
        tap((site: any) => window.open(`https://${site.accessConfig.internalDomain}.${this.siteHost}`, '_blank')),
      ),
      this.messageBus.listen(`site.builder.init`).pipe(tap(() => {
        this.isBuilderPage = true;
        if (this.isMobile) {
          this.mobileHeaderInit('init')
        } else {
          this.desktopHeaderInit('init')
        }
      })),
      this.messageBus.listen('site.header.config').pipe(
        tap(config => this.platformHeaderService.assignConfig(config ?? this.platformHeaderService.config)),
      ),
      this.messageBus.listen(`site.theme.open`).pipe(
        tap(({ themeId, isMobile }) => {
          if (themeId) {
            this.router.navigate(
              [`business/${this.envService.businessId}/site/${this.envService.applicationId}/builder/${themeId}/edit`],
              isMobile ? { queryParams: { isMobile } } : {},
            );

            return;
          }
          this.router.navigate([`business/${this.envService.businessId}/site/${this.envService.applicationId}/edit`])
        })),
      this.messageBus.listen(`site.theme.installed`).pipe(
        tap((themeId: any) => {
          this.router.navigate([`business/${this.envService.businessId}/site/${this.envService.applicationId}/edit`])
        })),
      this.messageBus.listen(`site.builder.destroy`).pipe(
        tap(() => {
          this.isBuilderPage = false;
          this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
            leftSectionItems: null,
          }))
        })),
      this.messageBus.listen('site.open').pipe(
        tap((site: any) => {
          if (site?.accessConfig?.internalDomain) {
            window.open(`https://${site.accessConfig.internalDomain}.${this.siteHost}`);
          }
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
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();

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
            this.messageBus.emit(`shop.${d}.open`, { sectionItem: { class: 'next-site__header-button' } });
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
        class: 'next-site__header-button',
        iconType: 'vector',
        iconSize: '24px',
        isActive: true,
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[0];
          this.messageBus.emit('site.builder-view.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.publish'),
        icon: '#icon-apps-builder-publish',
        class: 'next-site__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: (event: PointerEvent) => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[1];
          this.messageBus.emit('site.builder-publish.open', { sectionItem, event })
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.edit'),
        icon: '#icon-apps-builder-publish',
        class: 'next-site__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[2];
          this.messageBus.emit('site.builder-edit.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.insert'),
        icon: '#icon-apps-builder-publish',
        class: 'next-site__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[3];
          this.messageBus.emit('site.builder-insert.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('Share'),
        icon: '#icon-apps-builder-publish',
        class: 'next-site__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          this.builderShare.openGetLinkDialog({ appType: 'site' });
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
    this.siteHeaderService.destroy();
    this.editorWs.close();
  }

}
