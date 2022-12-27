import {
  ChangeDetectionStrategy,
  Compiler,
  Component,
  Injector,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, Subscriber } from 'rxjs';
import { filter, map, take, takeUntil, tap } from 'rxjs/operators';

import { AppThemeEnum, EnvService, PeDestroyService, NavigationService } from '@pe/common';
import { TranslateService } from '@pe/i18n';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';

import { QRIntegrationComponent } from '../../components/qr-generator/qr-settings.component';
import { IntegrationCategory, IntegrationInfoInterface } from '../../services/pos.types';
import { PosApi } from '../../services/pos/abstract.pos.api';
import { PosEnvService } from '../../services/pos/pos-env.service';

import { PebPosConnectModule } from './pos-connect.module';


@Component({
  selector: 'peb-pos-connect',
  templateUrl: './pos-connect.component.html',
  styleUrls: ['./pos-connect.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PebTerminalConnectComponent implements OnInit {

  private apiService: PosApi = this.injector.get(PosApi);
  private destroy$: PeDestroyService = this.injector.get(PeDestroyService);
  private compiler: Compiler = this.injector.get(Compiler);
  private router: Router = this.injector.get(Router);
  private navigationService: NavigationService = this.injector.get(NavigationService);
  private overlayService: PeOverlayWidgetService = this.injector.get(PeOverlayWidgetService);
  private translateService: TranslateService = this.injector.get(TranslateService);
  private envService: PosEnvService = this.injector.get(EnvService) as PosEnvService;

  theme = this.envService.businessData?.themeSettings?.theme ?
    AppThemeEnum[this.envService.businessData.themeSettings.theme] :
    AppThemeEnum.default;

  enabledIntegrations$: BehaviorSubject<string[]> = new BehaviorSubject([]);
  connectsReady = false;
  connects$ = this.getCategoryInstalledIntegrationsInfo([
    IntegrationCategory.Communications,
  ]).pipe(
    filter(d => !!d),
    takeUntil(this.destroy$),
    tap(() => (this.connectsReady = true)),
  );

  dialogRef: PeOverlayRef;

  constructor(
    private injector: Injector,
  ) {
  }

  ngOnInit() {
    this.initCurrentTerminal();
  }

  onToggleIntegration(integration: IntegrationInfoInterface) {
    this.enabledIntegrations$
      .pipe(
        takeUntil(this.destroy$),
        filter(d => !!d),
        take(1),
      )
      .subscribe((names: string[]) => {
        this.toggleTerminalIntegration(
          this.envService.posId,
          integration.integration.name,
          names.indexOf(integration.integration.name) < 0,
        ).subscribe(x => this.initCurrentTerminal());
      });
  }

  toggleTerminalIntegration(
    terminalId: string,
    integrationName: string,
    enable: boolean,
  ): Observable<void> {
    const businessUuid = this.envService.businessId;

    return this.apiService.toggleTerminalIntegration(
      businessUuid,
      terminalId,
      integrationName,
      enable,
    );
  }

  clickedIntegrationOpenButton(integration: IntegrationInfoInterface): void {
    this.preloadConnectMicro().subscribe(() => {
      if (integration.integration.name === 'qr') {
        this.initModal();
      } else {
        this.router.navigate([
          `business/${this.envService.businessId}/pos/${this.envService.posId}`
         + `/connect-app-edit/${integration.integration.category}/${integration.integration.name}`,
        ]);
      }

    });
  }

  clickedIntegrationAddButton(): void {
    const category: IntegrationCategory = IntegrationCategory.Communications;
    this.preloadConnectMicro().subscribe(() => {
      this.navigationService.saveReturn(this.router.url);
      this.router.navigate([
        `/business/${this.envService.businessId}/connect`,
      ],                   { queryParams: { integrationName: category } });
    });
  }

  private preloadConnectMicro(): Observable<boolean> {
    return new Observable<boolean>((subscriber: Subscriber<boolean>) => {
      import('@pe/apps/connect').then((({ ConnectModule }) => {
        this.compiler.compileModuleAsync(ConnectModule).then(() => {
          subscriber.next(true);
        });
      }));
    });
  }

  initCurrentTerminal(): void {
    this.apiService
      .getTerminalEnabledIntegrations(
        this.envService.businessId,
        this.envService.posId,
      )
      .pipe(
        takeUntil(this.destroy$),
        filter(d => !!d),
      )
      .subscribe((enabledList: string[]) => {
        this.enabledIntegrations$.next(enabledList);
      });
  }

  getCategoryInstalledIntegrationsInfo(
    category: IntegrationCategory | IntegrationCategory[],
  ): Observable<IntegrationInfoInterface[]> {
    const categories = category instanceof Array ? category : [category];

    return this.apiService.getIntegrationsInfo(this.envService.businessId).pipe(
      map((info: any) => {
        let data = info;
        if (info) {
          data = info.filter(
            (item: IntegrationInfoInterface) =>
              item.installed &&
              categories.indexOf(item.integration.category) >= 0,
          );
        }

        return data;
      }),
    );
  }

  private initModal() {
    const config: PeOverlayConfig = {
      data: {},
      hasBackdrop: true,
      backdropClass: 'channels-modal',
      headerConfig: {
        title: this.translateService.translate('pos-app.connect.qr.title'),
        backBtnTitle: this.translateService.translate('pos-app.actions.cancel'),
        backBtnCallback: () => {
          this.overlayService.close();
        },
        doneBtnTitle: this.translateService.translate('pos-app.actions.done'),
        doneBtnCallback: () => {
          this.overlayService.close();
        },
        theme: this.theme,
      },
      component: QRIntegrationComponent,
      lazyLoadedModule: PebPosConnectModule,
    };
    this.dialogRef = this.overlayService.open(config);
  }
}
