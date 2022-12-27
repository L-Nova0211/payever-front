import { Component, ViewEncapsulation, OnInit, Inject, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { fromEvent, merge } from 'rxjs';
import { tap, takeUntil, take, filter, map, distinctUntilChanged } from 'rxjs/operators';

import { PebEditorWs } from '@pe/builder-api';
import { PeBuilderShareService } from '@pe/builder-share';
import { BusinessInterface, BusinessState } from '@pe/business';
import { MessageBus, EnvService, AppThemeEnum, PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { PeHeaderMenuService } from '@pe/header';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PEB_BLOG_HOST } from '../constants';
import { BlogEnvService } from '../services/blog-env.service';
import { PeBlogHeaderService } from '../services/blog-header.service';

@Component({
  selector: 'cos-blog-root',
  templateUrl: './blog-root.component.html',
  styleUrls: [
    './blog-root.component.scss',
  ],
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class CosBlogRootComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;

  readonly destroyed$ = this.destroy$.asObservable();

  theme: string;
  isMobile = window.innerWidth < 720;
  isBuilderPage: boolean

  constructor(
    public router: Router,
    private messageBus: MessageBus,
    private blogHeaderService: PeBlogHeaderService,
    private platformHeaderService: PePlatformHeaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private headerMenu: PeHeaderMenuService,
    private confirmationService: ConfirmScreenService,
    @Inject(EnvService) private envService: BlogEnvService,
    @Inject(PEB_BLOG_HOST) private pebBlogHost: string,
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
      this.messageBus.listen('blog.open').pipe(
        tap((blog: any) => {
          if (blog?.accessConfig?.internalDomain) {
            window.open(`https://${blog.accessConfig.internalDomain}.${this.pebBlogHost}`);
          }
        }),
        takeUntil(this.destroyed$),
      ),
      this.messageBus.listen('blog.navigate.edit').pipe(
        tap((blogId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/blog/${blogId}/edit`)
        }),
      ),
      this.messageBus.listen('blog.navigate.dashboard').pipe(
        tap((blogId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/blog/${blogId}/dashboard`)
        }),
      ),
      this.messageBus.listen('blog.navigate.settings').pipe(
        tap((blogId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/blog/${blogId}/settings`)
        }),
      ),
      this.messageBus.listen('blog.navigate.themes').pipe(
        tap((blogId) => {
          this.router.navigateByUrl(`business/${this.envService.businessId}/blog/${blogId}/themes`)
        }),
      ),
      this.messageBus.listen(`blog.builder.init`).pipe(
        tap(() => {
          this.isBuilderPage = true;
          if (this.isMobile) {
            this.mobileHeaderInit('init')
          } else {
            this.desktopHeaderInit('init')
          }
        }),
      ),
      this.messageBus.listen('blog.header.config').pipe(
        tap(config => this.platformHeaderService.assignConfig(config ?? this.platformHeaderService.config)),
      ),
      this.messageBus.listen(`blog.builder.destroy`).pipe(
        tap(() => {
          this.isBuilderPage = false;
          this.platformHeaderService.assignConfig(Object.assign({}, this.platformHeaderService.config, {
            leftSectionItems: null,
          }))
        }),
      ),
      this.messageBus.listen(`blog.theme.open`).pipe(
        tap(({ themeId, isMobile }) => {
          if (themeId) {
            this.router.navigate(
              [`business/${this.envService.businessId}/blog/${this.envService.applicationId}/builder/${themeId}/edit`],
              isMobile ? { queryParams: { isMobile } } : {}
            );

            return;
          }
          this.router.navigate([`business/${this.envService.businessId}/blog/${this.envService.applicationId}/edit`])
        })),
      this.messageBus.listen('blog.theme.installed').pipe(tap((isMobile: boolean) => {
        this.router.navigate(
          [`business/${this.envService.businessId}/blog/${this.envService.applicationId}/edit`],
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

    this.blogHeaderService.initialize();

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
    this.listenConfirmationEvents();
  }

  private listenConfirmationEvents() {
    this.messageBus.listen('open-confirm')
      .pipe(takeUntil(this.destroyed$))
      .subscribe((headings: Headings) => {
        this.confirmationService.show(headings, false);
      })
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
            this.messageBus.emit(`blog.${d}.open`, { sectionItem: { class: 'next-blog__header-button' } });
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
        class: 'next-blog__header-button',
        iconType: 'vector',
        iconSize: '24px',
        isActive: true,
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[0];
          this.messageBus.emit('blog.builder-view.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.publish'),
        icon: '#icon-apps-builder-publish',
        class: 'next-blog__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: (event: Event) => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[1];
          this.messageBus.emit('blog.builder-publish.open', { sectionItem, event })
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.edit'),
        icon: '#icon-apps-builder-publish',
        class: 'next-blog__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[2];
          this.messageBus.emit('blog.builder-edit.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('header.left_section_items.insert'),
        icon: '#icon-apps-builder-publish',
        class: 'next-blog__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          const sectionItem = this.platformHeaderService.config.leftSectionItems[3];
          this.messageBus.emit('blog.builder-insert.open', { sectionItem });
        },
      },
      {
        title: this.translateService.translate('Share'),
        icon: '#icon-apps-builder-publish',
        class: 'next-blog__header-button',
        iconType: 'vector',
        iconSize: '24px',
        onClick: () => {
          this.builderShare.openGetLinkDialog({ appType: 'blog' });
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
    this.blogHeaderService.destroy();
    this.editorWs.close();
  }

}
