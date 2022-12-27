import { ChangeDetectorRef, Injectable } from '@angular/core';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';

import { AppThemeEnum, EnvService, PeDataGridListOptions } from '@pe/common';
import { PeGridItem, PeGridItemColumn, PeGridView } from '@pe/grid';
import { CurrencyPipe, LocaleConstantsService, TranslateService } from '@pe/i18n';

import { DetailInterface, FiltersFieldType } from '../shared/interfaces';
import { PeFolder } from '../shared/interfaces/folder.interface';
import { TransactionInterface } from '../shared/interfaces/list.interface';
import { StatusType } from '../shared/interfaces/status.type';

import { SettingsService } from './settings.service';

@Injectable()

export class TransactionsListService {
  theme = this.envService?.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  //baseUrl = ['business', this.envService.businessId, 'transactions', 'list'];
  cdrComponent: ChangeDetectorRef;
  customFieldsRow: string[] = [];

  defaultFields = [
    this.translateService.translate('transactions.filter.labels.channel'),
    this.translateService.translate('transactions.filter.labels.original_id'),
    this.translateService.translate('transactions.filter.labels.total'),
  ]

  loadTransactionsTrigger$ = new BehaviorSubject<boolean>(null);
  loadFolders$ = new BehaviorSubject<boolean>(null)

  gridOptions$ = new BehaviorSubject<PeDataGridListOptions>({
    nameTitle: 'Title',
    customFieldsTitles: [
      ...this.defaultFields,
      ...this.customFieldsRow,
    ],
  });

  private itemsSubject = new BehaviorSubject<PeGridItem<TransactionInterface>[]>([]);
  readonly items$ = this.itemsSubject.asObservable();

  get baseUrl() {
    return this.settingsService.baseUrl;
  }

  get items(): PeGridItem<TransactionInterface>[] {
    return this.itemsSubject.getValue();
  }

  set items(items: PeGridItem<TransactionInterface>[]) {
    this.itemsSubject.next(items);
  }

  get gridOptions() {
    return this.gridOptions$.value;
  }

  set gridOptions(options) {
    this.gridOptions$.next(options);
  }

  makeBehaviorSubjectWithStorate(baseKey: string, deflt: boolean, view: PeGridView): BehaviorSubject<boolean> {
    const key = `pe.transactions.${this.envService.businessId}.${view}.customFields.columns.${baseKey}`;
    let result = new BehaviorSubject<boolean>(deflt);
    try {
      if (sessionStorage?.getItem(key)) {
        result = new BehaviorSubject(sessionStorage.getItem(key) === 'true');
      }
    } catch (e) {}
    result.subscribe(value => {
      try {
        sessionStorage?.setItem(key, value ? 'true' : 'false');
      } catch (e) {}
    });

    return result;
  }

  constructor(
    private envService: EnvService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private translateService: TranslateService,
    private currency: CurrencyPipe,
    private localeConstantsService: LocaleConstantsService,
    private settingsService: SettingsService,
  ) {
  }

  get locale(): string {
    return this.localeConstantsService.getLocaleId();
  }

  resetItems(): void {
    this.loadTransactionsTrigger$.next(true);
  }

  updateItemColumns(order: DetailInterface): void {
    const findIndex = this.items.findIndex(item => item.data?.uuid === order.transaction?.uuid);


    if (this.items[findIndex]) {
      const newColumns = {
        [FiltersFieldType.Total]: this.currency.transform(
          order.transaction.total_left || 0, order.transaction.currency, undefined, undefined, this.locale
        ),
        [FiltersFieldType.Amount]: this.currency.transform(
          order.transaction?.amount_left || 0, order.transaction.currency, undefined, undefined, this.locale
        ),
        [FiltersFieldType.Reference]: order.details?.order?.reference ?? null,
      };

      const originalColumns: PeGridItemColumn[] = this.items[findIndex]?.columns ?? [];

      if (originalColumns.length) {
        this.items[findIndex].columns = originalColumns.map(column => {
          if (newColumns.hasOwnProperty(column.name) && newColumns[column.name] !== null) {
            return {
              ...column,
              value: newColumns[column.name],
            };
          }

          return column;
        });
      }
    }
  }

  openDetails(uuid: string): void {
    this.router.navigate([
      ...this.baseUrl,
      { outlets: { details: ['details', uuid] } },
    ], this.getNavigateParams());
  }

  mapTreeNodeToFolder = (folderTree: PeFolder[]) => {
    return folderTree?.map((treeFolder) => {
      treeFolder.id = treeFolder._id;
      if (treeFolder.children) {
        treeFolder.children = this.mapTreeNodeToFolder(treeFolder.children);
      }

      return treeFolder;
    });
  };

  getStatusColor(status: StatusType): string {
    let color: string = null;
    switch (status) {
      case 'STATUS_ACCEPTED':
      case 'STATUS_PAID':
        color = 'green';
        break;
      case 'STATUS_FAILED':
      case 'STATUS_CANCELLED':
      case 'STATUS_DECLINED':
        color = 'red';
        break;
      default:
        color = 'yellow';
        break;
    }

    return color;
  }

  getNavigateParams(): NavigationExtras {
    const navigateParams: NavigationExtras = {};

    if (this.canUseRelativeNavigate()) {
      navigateParams.relativeTo = this.activatedRoute;
      navigateParams.queryParams = {};
      navigateParams.queryParams.addExisting = true;
      navigateParams.queryParams.prevProductsPath = this.activatedRoute.snapshot.url[0]?.path ?? '';
    }
    navigateParams.queryParamsHandling = 'merge';
    navigateParams.skipLocationChange = true;

    return navigateParams;
  }

  destroy(): void {
    this.items = [];
    this.customFieldsRow = [];
    this.loadTransactionsTrigger$.next(null);
  }

  private canUseRelativeNavigate(): boolean {
    return this.activatedRoute.snapshot.pathFromRoot.filter((route: ActivatedRouteSnapshot) => route.url.length > 0).length > 0;
  }
}
