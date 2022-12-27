import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebBlogsApi } from '@pe/builder-api';
import { AppThemeEnum, MessageBus, PeDestroyService, EnvService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';

import {
  PeSettingsConnectExistingComponent,
  PeSettingsCreateAppComponent,
  PeSettingsCustomerPrivacyComponent,
  PeSettingsFacebookPixelComponent,
  PeSettingsGoogleAnalyticsComponent,
  PeSettingsPasswordProtectionComponent,
  PeSettingsPayeverDomainComponent,
  PeSettingsPersonalDomainComponent,
  PeSettingsSocialImageComponent,
  PeSettingsSpamProtectionComponent,
} from '../../components';
import { DialogService } from '../../services/dialog-data.service';

@Component({
  selector: 'peb-blog-settings',
  templateUrl: './blog-settings.component.html',
  styleUrls: ['./blog-settings.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [ PeDestroyService ],
})
export class PebBlogSettingsComponent implements OnInit {
  openedBlog:any;
  blogList:any;
  isLive: boolean;
  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default

  onSavedSubject$ = new BehaviorSubject(null)
  @Output() closeEvent = new EventEmitter<boolean>();
  components = {
    payeverDomain: {
      component: PeSettingsPayeverDomainComponent,
      header: 'blog-app.settings.payever_domain',
    },
    connectExisting: {
      component: PeSettingsConnectExistingComponent,
      header: 'blog-app.settings.connect_existing',
    },
    connectPersonal: {
      component: PeSettingsConnectExistingComponent,
      header: 'blog-app.settings.personal_domain',
    },
    createApp: {
      component: PeSettingsCreateAppComponent,
      header: 'blog-app.actions.create_new',
    },
    cusomerPrivacy: {
      component: PeSettingsCustomerPrivacyComponent,
      header: 'blog-app.settings.customer_privacy',
    },
    facebookPixel: {
      component: PeSettingsFacebookPixelComponent,
      header: 'blog-app.settings.facebook_pixel',
    },
    googleAnalytics: {
      component: PeSettingsGoogleAnalyticsComponent,
      header: 'blog-app.settings.google_analytics',
    },
    passwordProtection: {
      component: PeSettingsPasswordProtectionComponent,
      header: 'blog-app.settings.password_protection',
    },
    personalDomain: {
      component: PeSettingsPersonalDomainComponent,
      header: 'blog-app.settings.personal_domain',
    },
    socialImage: {
      component: PeSettingsSocialImageComponent,
      header: 'blog-app.settings.social_image',
    },
    spamProtection: {
      component: PeSettingsSpamProtectionComponent,
      header: 'blog-app.settings.spam_protection',
    },
  }

  constructor(
    private blogApi: PebBlogsApi,
    private route: ActivatedRoute,
    private router: Router,
    private dialog: MatDialog,
    private overlay: PeOverlayWidgetService,
    private messageBus: MessageBus,
    private cdr: ChangeDetectorRef,
    private envService: EnvService,
    private translateService: TranslateService,
    private destroy$: PeDestroyService,
    public confirmDialog: DialogService,
  ) {
  }

  toggleBlogLive(e) {
    this.blogApi.patchIsLive(this.openedBlog._id, e).subscribe((data: any) => {
      this.openedBlog.accessConfig = data;
      this.isLive = data.isLive
    })
    this.cdr.markForCheck()
  }



  ngOnInit() {
    this.getBlogList().subscribe()
    this.onSavedSubject$.asObservable().pipe(
      tap((data) => {
        if (data?.updateBlogList) {
          this.getBlogList().subscribe();
        }
        if (data?.openBlog) {
          this.route.snapshot.parent.parent.data = { ...this.route.snapshot?.parent?.parent?.data, blog: data.blog };
          this.messageBus.emit('blog.navigate.dashboard', data.blog.id);
        }
        if (data?.connectExisting) {
          this.openOverlay(this.components.connectPersonal);
        }
      }),
      takeUntil(this.destroy$),

    ).subscribe();
  }

  onBlogClick(blog: any) {
    if (blog.isDefault) {
      return;
    }
    this.blogApi.markBlogAsDefault(blog._id).pipe(switchMap(data => this.getBlogList())).subscribe(() => {

    })
  }

  getBlogList() {
    return this.blogApi.getBlogsList().pipe(
      tap((blogs) => {
        this.blogList = blogs;
        blogs.map((blog) => {
          if (blog._id === this.route.snapshot.params.blogId) {
            this.openedBlog = blog;
            this.isLive = blog?.accessConfig?.isLive;
          }
        })
        this.cdr.markForCheck()
      }),

    )

  }

  openOverlay(item, itemData?: any) {
    const overlayData = itemData ? itemData : this.openedBlog;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: item.component,
      data: { ...overlayData, onSved$: this.onSavedSubject$,closeEvent: this.closeEvent },
      backdropClass: 'settings-backdrop',
      panelClass: 'settings-widget-panel',
      headerConfig: {
        title: this.translateService.translate(item.header),
        backBtnTitle: this.translateService.translate('blog-app.actions.cancel'),
        theme: this.theme,
        backBtnCallback: () => { this.showConfirmationDialog(); },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {  this.showConfirmationDialog();},
        doneBtnTitle: this.translateService.translate('blog-app.actions.done'),
        doneBtnCallback: () => { },
      },
      backdropClick: () => {
        this.showConfirmationDialog();
      },
    }

    console.log('openOverlay ', config);

    this.overlay.open(
      config,
    )
  }

  private showConfirmationDialog(){

      this.confirmDialog.open({
        title: this.translateService.translate('blog-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('blog-app.dialogs.window_exit.label'),
        confirmBtnText: this.translateService.translate('blog-app.dialogs.window_exit.confirm'),
        declineBtnText: this.translateService.translate('blog-app.dialogs.window_exit.decline'),
      });

      this.confirmDialog.confirmation$.pipe(
        skip(1),
        take(2),
        tap((data)=>{
          this.overlay.close();
        })
      ).subscribe();
  }
}
