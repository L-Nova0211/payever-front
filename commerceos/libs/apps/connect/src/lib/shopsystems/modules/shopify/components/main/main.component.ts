import { Component, Inject, Injector, OnInit, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { filter, finalize, switchMap, take, takeUntil } from 'rxjs/operators';

import { EnvironmentConfigInterface as EnvInterface, NodeJsBackendConfigInterface, PE_ENV } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  ApiKeysBaseComponent,
  AuthTokenInterface,
  BusinessService,
  IntegrationCategory,
  IntegrationInfoWithStatusInterface, IntegrationsStateService, NavigationService, UninstallService,
} from '../../../../../shared';
import { ShopsystemsStateService } from '../../../../services';
import { DownloadLinkInterface, PluginInfoInterface } from '../../../../types';

@Component({
  selector: 'main-shopify',
  templateUrl: './main.component.html',
  styleUrls: ['./../../../default-plugin/components/main/main.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ShopifyMainComponent extends ApiKeysBaseComponent implements OnInit {
  maxKeys = 99;

  integrationName: string = this.overlayData.integrationName;
  parentFolderId: string = this.overlayData.integrationParentFolderId;
  integrationCategory: string = this.overlayData.integrationCategory;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;

  integration: IntegrationInfoWithStatusInterface;
  installedPaymentsIntegrations: string[] = [];

  downloadLinks: DownloadLinkInterface[] = [];

  apiKeys$: Observable<AuthTokenInterface[]> = of(null);
  isAddingKey$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  pluginInfo$: Observable<PluginInfoInterface> = null;
  integrationInfo$: Observable<IntegrationInfoWithStatusInterface> = null;
  paymentIntegrations$: Observable<IntegrationInfoWithStatusInterface[]> = null;

  private router: Router = this.injector.get(Router);
  private integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  private shopsystemsStateService: ShopsystemsStateService = this.injector.get(ShopsystemsStateService);

  constructor(
    @Inject(PE_ENV) private envConfig: EnvInterface,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    protected injector: Injector,
    private businessService: BusinessService,
    private navigationService: NavigationService,
    public uninstallService: UninstallService,
  ) {
    super(injector);
  }

  ngOnInit(): void {
    this.apiKeys$ = this.stateService.getPluginApiKeys(this.integrationName).pipe(takeUntil(this.destroyed$));

    this.integrationInfo$ = this.integrationsStateService.getIntegration(this.integrationName).pipe(
    takeUntil(this.destroyed$));
    this.integrationInfo$.pipe(finalize(() => this.onDataLoad.next(1))).subscribe((info) => {
      this.integration = info;
    });

    this.paymentIntegrations$ = this.integrationsStateService.getCategoriesIntegrations(
      true,[IntegrationCategory.Payments], false
    ).pipe(filter(a => !!a), takeUntil(this.destroyed$));

    this.paymentIntegrations$.pipe(finalize(() => this.onDataLoad.next(1))).subscribe((data) => {
      this.installedPaymentsIntegrations = data.map(a => a.name);
    });

    this.pluginInfo$ = this.shopsystemsStateService.getPluginInfo(this.integrationName);
    this.pluginInfo$.pipe(filter(d => !!d), takeUntil(this.destroyed$)).subscribe((info) => {
      if (info.documentation) {
        this.downloadLinks.push({
          name: this.translateService.translate('categories.shopsystems.downloads.titles.instructions'),
          link: info.documentation,
        });
      }
    });

    this.isAddingKey$.pipe(takeUntil(this.destroyed$)).subscribe((isAddingKey) => {
      this.integrationInfo$.pipe(filter(d => !!d), takeUntil(this.destroyed$)).subscribe((info) => {});
    });
  }

  onKeyCreated(): void {
    this.isAddingKey$.next(false);
  }

  handleClose(): void {
    this.navigationService.returnBack();
  }

  get businessUuid(): string {
    return this.businessService.businessId;
  }

  get baseApiUrl(): string {
    const config: NodeJsBackendConfigInterface = this.envConfig.backend;

    return `${config.thirdParty}/api/business/${this.businessUuid}/subscription/${this.integrationName}/call`;
  }

  get baseApiData(): any {
    return {
      enabledIntegrations: this.installedPaymentsIntegrations,
      authStateData: {
        businessUuid: this.businessUuid,
        integrationName: this.integrationName,
        integrationCategory: this.integrationCategory,
        integrationId: this.integration ? this.integration._id : null,
      },
    };
  }
}
