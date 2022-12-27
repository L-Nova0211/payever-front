import { Clipboard } from '@angular/cdk/clipboard';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild ,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebBlogsApi, PebBuilderBlogsApi, PebEditorApi, PebEditorWs, PebEditorWsEvents } from '@pe/builder-api';
import { PebEnvService, PebScreen } from '@pe/builder-core';
import { FontLoaderService } from '@pe/builder-font-loader';
import { EnvService } from '@pe/common';
import { AppThemeEnum, MessageBus, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PeQrPrintComponent } from '../../components/qr-print/qr-print.component';
import { PeQrPrintModule } from '../../components/qr-print/qr-print.module';
import { PEB_BLOG_HOST } from '../../constants';

@Component({
  selector: 'peb-blog-dashboard',
  templateUrl: './blog-dashboard.component.html',
  styleUrls: ['./blog-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebBlogDashboardComponent implements OnInit, OnDestroy {

  // preview$: Observable<BlogPreviewDTO> = this.apiService.getBlogPreview(this.route.snapshot.params.blogId).pipe(
  //   shareReplay(1),
  // );
  screen: string | PebScreen = PebScreen.Desktop;
  theme =this.envService?.businessData?.themeSettings?.theme?
   AppThemeEnum[this.envService.businessData.themeSettings.theme]
  :AppThemeEnum.default;

  themeActiveVersion: any;
  blog: any;
  preview: any;
  destroy$ = new Subject<void>();
  @ViewChild('itemMenuTrigger', { read: MatMenuTrigger }) itemMenuTrigger: MatMenuTrigger;

  loading = true;
  get url() {
    return `${this.blog?.accessConfig.internalDomain}.${this.blogHost}`;
  }

  constructor(
    private messageBus: MessageBus,
    private blogApiService: PebBlogsApi,
    private apiService: PebBuilderBlogsApi,
    private route: ActivatedRoute,
    private snackBar: SnackbarService,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    private envService: EnvService,
    private pebEnvService: PebEnvService,
    private clipboard: Clipboard,
    private editorApi:PebEditorApi,
    private fontLoaderService: FontLoaderService,
    @Inject(PEB_BLOG_HOST) public blogHost: string,
    @Inject(PE_ENV) private env: any,
    private compiler: Compiler,
    private overlayService: PeOverlayWidgetService,
    private authService: PeAuthService,
    private editorWs: PebEditorWs,

  ) {
    this.fontLoaderService.renderFontLoader();
  }

  onOpenItemMenu() {
    import('@pe/apps/connect')
      .then((({ ConnectModule }) => this.compiler.compileModuleAsync(ConnectModule)))
      .then(() => this.itemMenuTrigger.openMenu());
  }

  onEditClick(): void {
    this.messageBus.emit('blog.navigate.edit', this.route.snapshot.params.blogId);
  }

  ngOnInit() {
    this.blogApiService.getSingleBlog(this.route.snapshot.params.blogId).subscribe((blog) => {
      this.blog = blog;
      this.cdr.markForCheck();
    });
    this.apiService.getBlogActiveTheme(this.pebEnvService.applicationId).subscribe(activeTheme =>
      this.themeActiveVersion = activeTheme);
    this.editorApi.getShopActiveTheme().subscribe(activeTheme => this.themeActiveVersion = activeTheme);
    this.editorWs.on(PebEditorWsEvents.PreInstallFinished).pipe(
      filter(request => request?.data?.status === 'pre-install-finished' &&
        request?.id === `pre-install-${this.route.snapshot.params.blogId}`),
      take(1),
      tap(request => this.getBlogThemeActiveVersion(request.data.theme)),
      takeUntil(this.destroy$),
    ).subscribe();
    this.editorWs.preInstallFinish(this.route.snapshot.params.blogId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }


  private getBlogThemeActiveVersion(themeId: string) {
    this.apiService.getBlogThemeActiveVersion(themeId).pipe(
      tap((theme: any) => {
        this.getPreview();
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private getPreview() {
    this.apiService.getCurrentBlogPreview(this.route.snapshot.params.blogId, true, false, 'front').pipe(
      tap(({ current, published }) => {
        this.preview = { current, published };
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  onOpenClick(): void {
    if(!this.blog?.accessConfig.isLive) {
      const msg = this.translateService.translate(`blog-app.info.app_offline`);

      this.snackBar.toggle(true, {
        content: msg,
      }, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'blog-snack',
      });

      return;
    }
    this.messageBus.emit('blog.open', this.blog);
  }

  onLinkCopy(): void {
    this.clipboard.copy(this.blog?.accessConfig?.internalDomain + '.' + this.blogHost);
    const msg = this.translateService.translate(`blog-app.errors.link_copied`);

    this.snackBar.toggle(true, {
      content: msg,
    }, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'blog-snack',
    });
  }

  onDownloadQR(): void {
    const config: PeOverlayConfig = {
      data: { blog: this.blog },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'qr-print-modal',
      headerConfig: {
        title: this.translateService.translate('blog-app.connect.qr_title'),
        backBtnTitle: this.translateService.translate('blog-app.actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('blog-app.actions.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
      },
       component: PeQrPrintComponent,
       lazyLoadedModule: PeQrPrintModule,
    };
    this.overlayService.open(config);
  }
}
