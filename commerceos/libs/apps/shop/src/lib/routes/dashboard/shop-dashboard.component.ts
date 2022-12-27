import { Clipboard } from '@angular/cdk/clipboard';
import { HttpClient } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Compiler,
  Component,
  Inject,
  OnDestroy,
  OnInit, ViewChild,
} from '@angular/core';
import { MatMenuTrigger } from '@angular/material/menu';
import { ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { PeAuthService } from '@pe/auth';
import { PebEditorApi, PebEditorWs, PebEditorWsEvents } from '@pe/builder-api';
import { PebScreen } from '@pe/builder-core';
import { FontLoaderService } from '@pe/builder-font-loader';
import { AppThemeEnum, EnvService, MessageBus, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PeQrPrintComponent } from '../../components/qr-print/qr-print.component';
import { PeQrPrintModule } from '../../components/qr-print/qr-print.module';
import { PEB_SHOP_HOST } from '../../constants';
import { PebShopsApi } from '../../services/abstract.shops.api';
import { ShopEnvService } from '../../services/shop-env.service';

@Component({
  selector: 'peb-shop-dashboard',
  templateUrl: './shop-dashboard.component.html',
  styleUrls: ['./shop-dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShopDashboardComponent implements OnInit, OnDestroy {

  @ViewChild('itemMenuTrigger', { read: MatMenuTrigger }) itemMenuTrigger: MatMenuTrigger;

  preview: any;
  loading = true;
  screen: string | PebScreen = PebScreen.Desktop;

  theme = this.envService?.businessData?.themeSettings?.theme ?
  AppThemeEnum[this.envService.businessData.themeSettings.theme] : AppThemeEnum.default;

  shop: any;
  themeActiveVersion: any;

  destroy$ = new Subject<void>();

  get url() {
    return `${this.shop?.accessConfig.internalDomain}.${this.shopHost}`;
  }

  constructor(
    private authService: PeAuthService,
    private messageBus: MessageBus,
    private apiService: PebShopsApi,
    private editorApi: PebEditorApi,
    private clipboard: Clipboard,
    private snackBar: SnackbarService,
    private route: ActivatedRoute,
    private translateService: TranslateService,
    private cdr: ChangeDetectorRef,
    @Inject(EnvService) private envService: ShopEnvService,
    @Inject(PEB_SHOP_HOST) public shopHost: string,
    @Inject(PE_ENV) private env: any,
    private fontLoaderService: FontLoaderService,
    private httpClient: HttpClient,
    private overlayService: PeOverlayWidgetService,
    private compiler: Compiler,
    private editorWs: PebEditorWs,

  ) {
    this.fontLoaderService.renderFontLoader();
  }

  ngOnInit(): void {
    this.apiService.getSingleShop(this.route.snapshot.params.shopId).subscribe((shop) => {
      this.shop = shop;
      this.cdr.markForCheck();
    });
    this.editorApi.getShopActiveTheme().subscribe(activeTheme => this.themeActiveVersion = activeTheme);
    this.editorWs.on(PebEditorWsEvents.PreInstallFinished).pipe(
      filter(request => request?.data?.status === 'pre-install-finished' &&
        request?.id === `pre-install-${this.route.snapshot.params.shopId}`),
      take(1),
      tap(request => this.getShopThemeActiveVersion(request.data.theme)),
      takeUntil(this.destroy$),
    ).subscribe();
    this.editorWs.preInstallFinish(this.route.snapshot.params.shopId);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onOpenItemMenu() {
    import('@pe/apps/connect')
      .then((({ ConnectModule }) => this.compiler.compileModuleAsync(ConnectModule)))
      .then(() => this.itemMenuTrigger.openMenu());
  }

  onEditClick(): void {
    this.messageBus.emit('shop.navigate.edit', this.route.snapshot.params.shopId);
  }

  private getShopThemeActiveVersion(themeId: string) {
    this.editorApi.getShopThemeActiveVersion(themeId).pipe(
      tap((theme: any) => {
        this.getPreview();
      }),
      takeUntil(this.destroy$),
    ).subscribe()
  }

  private getPreview() {
    this.editorApi.getCurrentShopPreview(this.route.snapshot.params.shopId, true, false, 'front').pipe(
      tap(({ current, published }) => {
        this.preview = { current, published };
        this.loading = false;
        this.cdr.detectChanges();
      }),
    ).subscribe();
  }

  onOpenClick(): void {
    if(!this.shop?.accessConfig.isLive) {
      const msg = this.translateService.translate(`shop-app.info.app_offline`);
      const btn = this.translateService.translate(`shop-app.actions.hide`);
      this.snackBar.toggle(true, {
        content: msg,
      }, {
        horizontalPosition: 'center',
        verticalPosition: 'top',
        panelClass: 'shop-snack',
      });

      return;
    }
    this.messageBus.emit('shop.open', this.shop);
  }

  onLinkCopy(): void {
    this.clipboard.copy(this.shop?.accessConfig.internalDomain + '.' + this.shopHost);
    const msg = this.translateService.translate(`shop-app.errors.link_copied`);
    const btn = this.translateService.translate(`shop-app.actions.hide`);
    this.snackBar.toggle(true, {
      content: msg,
    }, {
      horizontalPosition: 'center',
      verticalPosition: 'top',
      panelClass: 'shop-snack',
    });
  }

  onDownloadQR(): void {
    const config: PeOverlayConfig = {
      data: { shop: this.shop },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'qr-print-modal',
      headerConfig: {
        title: this.translateService.translate('shop-app.connect.qr_title'),
        backBtnTitle: this.translateService.translate('shop-app.actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('shop-app.actions.done'),
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
