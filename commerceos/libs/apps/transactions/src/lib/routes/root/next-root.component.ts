/* eslint-disable @nrwl/nx/enforce-module-boundaries */
import { ChangeDetectionStrategy, Component, ViewEncapsulation, OnInit, OnDestroy, Optional, Inject } from '@angular/core';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';

import { AbstractComponent } from '@pe/base';
import { BusinessInterface, BusinessState } from '@pe/business';
import { AppThemeEnum, AppType, APP_TYPE, PreloaderState } from '@pe/common';
import { DockerItemInterface, DockerState } from '@pe/docker';

import { PeTransactionsHeaderService } from '../../services/transactions-header.service';


@Component({
  selector: 'pe-cos-next-root',
  templateUrl: './next-root.component.html',
  styleUrls: [
    './next-root.component.scss',
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class TransactionsNextRootComponent extends AbstractComponent implements OnInit, OnDestroy {
  patchedElements: NodeListOf<HTMLElement> = null;
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];
  @SelectSnapshot(BusinessState.businessData) businessData: BusinessInterface;
  @SelectSnapshot(PreloaderState.loading) loading: {};

  theme: string;

  constructor(
    public router: Router,
    private transactionsHeaderService: PeTransactionsHeaderService,
    @Optional() @Inject(APP_TYPE) private appType: AppType,
  ) {
    super();
    this.theme = (this.businessData?.themeSettings?.theme) ? AppThemeEnum[this.businessData.themeSettings.theme]
      : AppThemeEnum.default;
  }

  get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType]
  }

  ngOnInit(): void {
    (window as any).PayeverStatic.IconLoader.loadIcons([
      'apps',
      'set',
      'transactions',
      'new-transactions',
    ]);
    this.transactionsHeaderService.init()
    document.body.classList.add('transactions-app');
  }

  ngOnDestroy(): void {
    this.transactionsHeaderService.destroy();
    document.body.classList.remove('transactions-app');
    super.ngOnDestroy();
  }

}
