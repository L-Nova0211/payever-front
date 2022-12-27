import { Component, Inject, Injector, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { forEach } from 'lodash-es';
import { BehaviorSubject, Observable } from 'rxjs';
import { filter, finalize, map, takeUntil } from 'rxjs/operators';

import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

import {
  ApiKeysBaseComponent,
  BusinessService,
  IntegrationCategory,
  IntegrationInfoWithStatusInterface,
  IntegrationsStateService,
  UninstallService,
} from '../../../../../shared';
import { ShopsystemsStateService } from '../../../../services';
import { DownloadLinkInterface, PluginInfoInterface } from '../../../../types';
import { PluginMainWrapComponent } from '../../../shared/components';

@Component({
  selector: 'main-default-plugin',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class DefaultPluginMainComponent extends ApiKeysBaseComponent implements OnInit {

  integration: IntegrationInfoWithStatusInterface;
  name: string = this.overlayData.integrationName;
  parentFolderId: string = this.overlayData.integrationParentFolderId;
  onDataLoad: BehaviorSubject<number> = this.overlayData.onDataLoad;
  downloadLinks: DownloadLinkInterface[] = [];

  pluginInfo$: Observable<PluginInfoInterface> = null;
  integrationInfo$: Observable<IntegrationInfoWithStatusInterface> = null;

  @ViewChild('wrap') wrap: PluginMainWrapComponent;

  protected integrationsStateService: IntegrationsStateService = this.injector.get(IntegrationsStateService);
  protected shopsystemsStateService: ShopsystemsStateService = this.injector.get(ShopsystemsStateService);

  constructor(
    protected injector: Injector,
    private businessService: BusinessService,
    private router: Router,
    @Inject(PE_OVERLAY_DATA) public overlayData: any,
    public uninstallService: UninstallService,
  ) {
    super(injector);
  }

  get businessUuid(): string {
    return this.businessService.businessId;
  }

  ngOnInit(): void {

    this.integrationInfo$ = this.integrationsStateService.getCategoriesIntegrations(
      false, [IntegrationCategory.ShopSystems], false
    ).pipe(
      takeUntil(this.destroyed$),
      filter(d => !!d),
      map((data) => {
        const integration = data.find(item => item.name === this.name);
        this.integration = integration;

        return integration;
      })
    );
    this.integrationInfo$.pipe(finalize(() => this.onDataLoad.next(1))).subscribe();
    this.pluginInfo$ = this.shopsystemsStateService.getPluginInfo(this.name);
    this.pluginInfo$.pipe(takeUntil(this.destroyed$), filter(d => !!d)).subscribe((info) => {
      this.downloadLinks = [];
      forEach(info.pluginFiles || [], (file) => {
        this.downloadLinks.push({
          name: this.translateService.translate(
            'categories.shopsystems.downloads.titles.plugin_with_ver', { version: file.version }),
          link: file.filename,
        });
      });
      if (info.documentation) {
        this.downloadLinks.push({
          name: this.translateService.translate('categories.shopsystems.downloads.titles.instructions'),
          link: info.documentation,
        });
      }
    });
  }

  onKeyCreated(): void {
    if (this.wrap) {
      // Maybe should find better solution
      this.wrap.isAddingKey$.next(false);
    }
  }
}
