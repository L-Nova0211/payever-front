import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { of } from 'rxjs';
import { catchError, delay, filter, map, repeatWhen, share, switchMap, take, tap } from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService, PebScreen } from '@pe/builder-core';
import { AppThemeEnum, createApplicationUrl, PeBuilderEditorRoutingPathsEnum, PeDestroyService } from '@pe/common';
import { PE_PRIMARY_HOST } from '@pe/domains';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { SnackbarService } from '@pe/snackbar';

import { PeBuilderDashboardMenuActionsEnum } from './enums';
import { PeBuilderDashboardAccessInterface } from './interfaces';
import { PeQrPrintComponent, PeQrPrintModule } from './qr-print';
import { PeBuilderDashboardAccessApiService } from './services';

@Component({
  selector: 'pe-builder-dashboard',
  templateUrl: './builder-dashboard.component.html',
  styleUrls: [
    './builder-dashboard.component.scss',
    './builder-dashboard-menu.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeBuilderDashboardComponent {
  public errorMessage: string;
  public internalDomain: string;

  public readonly getAccessGonfig$ = this.peBuilderDashboardAccessApiService
    .getAccessConfig(this.pebEnvService.applicationId)
    .pipe(
      share(),
      tap(({ internalDomain }) => {
        this.internalDomain = internalDomain;
      }),
      catchError(() => of(true)));

  public readonly preview$ = this.pebEditorApi
    .getShopActiveTheme()
    .pipe(
      delay(2000),
      repeatWhen(getActiveTheme => getActiveTheme),
      filter(activeTheme => !!activeTheme),
      take(1),
      switchMap(() => this.pebEditorApi
        .getCurrentShopPreview(this.pebEnvService.applicationId, true, false, 'front')),
      map(({ current, published }) => ({ current, published })),
      share(),
      catchError(error => {
        this.apmService.apm.captureError(`Get current shop preview ERROR ms:\n${JSON.stringify(error)}`);
        this.errorMessage = error.error.message;

        return of(true);
      }));

  public readonly dashboardMenuItems = [
    {
      icon: '#icon-edit-pencil-24',
      title: PeBuilderDashboardMenuActionsEnum.Edit,
    },
    {
      icon: '#icon-link3-16',
      title: PeBuilderDashboardMenuActionsEnum.CopyLink,
    },
    {
      icon: '#icon-communications-qr-white',
      title: PeBuilderDashboardMenuActionsEnum.QR,
    },
  ];

  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;
  
  constructor(
    private apmService: ApmService,
    private clipboard: Clipboard,
    private router: Router,

    private pebEditorApi: PebEditorApi,
    private pebEnvService: PebEnvService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,

    @Inject(PE_PRIMARY_HOST) public pePrimaryHost: string,
    private peBuilderDashboardAccessApiService: PeBuilderDashboardAccessApiService,
  ) { }

  public get screen(): PebScreen {
    return window.innerWidth > 1025
      ? PebScreen.Desktop
      : window.innerWidth > 720
        ? PebScreen.Tablet
        : PebScreen.Mobile;
  }

  private copyLink(): void {
    if (this.internalDomain) {
      this.clipboard.copy(`https://${this.internalDomain}.${this.pePrimaryHost}`);
      this.snackbarService.toggle(
        true,
        {
          content: this.translateService.translate(`builder-app.dashboard.actions.link_copied`),
          duration: 2500,
          iconColor: '#00B640',
          iconId: 'icon-commerceos-success',
          iconSize: 24,
        }
      );
    } else {
      this.openUrl(null);
    }
  }

  private getQR(): void {
    const config: PeOverlayConfig = {
      data: { internalDomain: this.internalDomain },
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      panelClass: 'qr-print-modal',
      headerConfig: {
        title: this.translateService.translate('builder-app.dashboard.actions.get_qr'),
        backBtnTitle: this.translateService.translate('builder-app.dashboard.actions.cancel'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('builder-app.dashboard.actions.done'),
        doneBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        theme: this.theme,
      },
      component: PeQrPrintComponent,
      lazyLoadedModule: PeQrPrintModule,
    };
    this.peOverlayWidgetService.open(config);
  }

  private navigateTo(route: PeBuilderEditorRoutingPathsEnum): void {
    const fullPath = createApplicationUrl(this.router, this.pebEnvService.applicationId, route);
    this.router.navigate([fullPath]);
  }

  public onMenuItemClick(menuItem: PeBuilderDashboardMenuActionsEnum): void {
    switch (menuItem) {
      case PeBuilderDashboardMenuActionsEnum.Edit:
        this.navigateTo(PeBuilderEditorRoutingPathsEnum.BuilderEditor);
        break;
      case PeBuilderDashboardMenuActionsEnum.CopyLink:
        this.copyLink();
        break;
      case PeBuilderDashboardMenuActionsEnum.QR:
        this.getQR();
        break;
    }
  }

  public openUrl(accessData?: PeBuilderDashboardAccessInterface): void {
    const getAccessData$ = accessData
      ? of(accessData)
      : this.peBuilderDashboardAccessApiService.getAccessConfig(this.pebEnvService.applicationId);

    getAccessData$
      .pipe(
        take(1),
        tap(({ internalDomain, isLive }) => {
          const accessUrl = `https://${internalDomain}.${this.pePrimaryHost}`;
          if (internalDomain && isLive) {
            window.open(accessUrl);
          } else {
            const message = internalDomain
              ? 'domains-lib.errors.is_not_live'
              : 'domains-lib.errors.not_connected';
            const notify = this.translateService
              .translate(message)
              .replace('{accessUrl}', accessUrl);
            this.snackbarService.toggle(true, {
              content: notify,
              duration: 5000,
              hideButtonTitle: this.translateService.translate('builder-app.dashboard.navigation.settings'),
              hideCallback: () => {
                this.navigateTo(PeBuilderEditorRoutingPathsEnum.Settings);
              },
              iconColor: '#E2BB0B',
            });
          }
        }))
      .subscribe();
  }
}
