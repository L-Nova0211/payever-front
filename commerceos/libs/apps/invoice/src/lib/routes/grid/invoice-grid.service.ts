import { formatDate } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import flatten from 'flat';
import isEqual from 'lodash-es/isEqual';
import pick from 'lodash-es/pick';
import cloneDeep from 'lodash/cloneDeep';
import forIn  from 'lodash/forIn';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, Observable, Subject } from 'rxjs';
import {
  catchError,
  distinctUntilChanged,
  finalize,
  map,
  startWith,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  MessageBus,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridSingleSelectedAction,
  PE_ENV,
  TreeFilterNode,
} from '@pe/common';
import { GridQueryParams, PeGridItem, PeGridItemType, PeGridView } from '@pe/grid';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaService, MediaUrlPipe } from '@pe/media';

import { PeInvoiceBuilderEditComponent } from '../../components';
import { PeInvoiceSnackbarComponent } from '../../components/snackbar/snackbar.component';
import {
  filterOptions,
  invoiceOptions,
  InvoiceTreeDataInterface,
  INVOICE_NAVIGATION,
  PEB_INVOICE_API_PATH,
} from '../../constants';
import { ContextMenu } from '../../enum/contextMenu';
import { Direction } from '../../enum/direction.enum';
import { FieldFilterKey } from '../../enum/filter.enum';
import { Filter } from '../../interfaces/filter.interface';
import { AbstractService } from '../../misc/abstract.service';
import { PeInvoiceApi } from '../../services/abstract.invoice.api';
import { InvoiceApiService } from '../../services/api.service';
import { InvoiceEnvService } from '../../services/invoice-env.service';
@Injectable()
export class PebInvoiceGridService extends AbstractService {
  public lastGridView: PeGridView;
  private searchStringStream$ = new BehaviorSubject<string>(null);
  searchString$ = this.searchStringStream$.asObservable();
  private orderStream$ = new BehaviorSubject<any>({
    by: 'createdAt',
    direction: Direction.DESC,
  });

  order$ = this.orderStream$.asObservable();

  private paginationStream$ = new BehaviorSubject<any>({
    page: 1,
    pageCount: 1,
    perPage: 20,
    itemCount: 20,
  });

  pagination$ = this.paginationStream$.asObservable();
  expandTreeSubject$ = new BehaviorSubject<any>(null);
  expandTree$ = this.expandTreeSubject$.asObservable();
  private readonly invoiceFolders = invoiceOptions;
  private readonly invoiceFilters = filterOptions;
  private conditionFormattedFiltersStream$ = new BehaviorSubject<Filter[]>([]);
  isSidebarClosed$ = new BehaviorSubject(false);
  updatedGridItem$ = new BehaviorSubject<any>(null);
  duplicatedGridItem$ = new BehaviorSubject<any>(null);
  private showAddItemStream$ = new BehaviorSubject<boolean>(true);
  private showFiltersStream$ = new BehaviorSubject<boolean>(true);
  private channelSetInvoiceStream$ = new BehaviorSubject<any[]>([]);
  channelSetInvoice$ = this.channelSetInvoiceStream$.asObservable();
  private gridItemsStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private gridFoldersStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private collectionsStream$ = new BehaviorSubject<any[]>([]);
  collections$ = this.collectionsStream$.asObservable();
  private selectedFolderStream$ = new BehaviorSubject<string>(null);
  private selectedInvoiceStream$ = new BehaviorSubject<string[]>([]);
  layout: PeDataGridLayoutType = PeDataGridLayoutType.Grid;
  private queryParams = {};
  gridItems$ = this.gridItemsStream$.asObservable();
  conditionFormattedFilters$ = this.conditionFormattedFiltersStream$.asObservable();
  invoices:any[];
   activeNode: TreeFilterNode;
  selectedItems: string[] = [];
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  private copiedInvoiceStream$ = new BehaviorSubject<string[]>([]);
  callSubject = new Subject<any>();
  callObservable = this.callSubject.asObservable();
  settingsData = INVOICE_NAVIGATION;
  collections = [];

  filtersFormGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  collectionFilters$ = this.filtersFormGroup.get('tree').valueChanges.pipe(
    startWith([]),
    tap((collections: TreeFilterNode[]) => this.showAddItemStream$.next(!collections.length)),
    map((collections: TreeFilterNode[]) => this.getCollectionsFilters(collections)),
  );

  allFilters$ = combineLatest([this.conditionFormattedFilters$, this.collectionFilters$]).pipe(
    distinctUntilChanged(
      ([conditionalFilters1, collectionFilter1], [conditionalFilters2, collectionFilter2]) =>
        isEqual(conditionalFilters1, conditionalFilters2) && isEqual(collectionFilter1, collectionFilter2),
    ),
    map(([conditionalFilters, collectionFilter]) => [...conditionalFilters, collectionFilter]),
  );

  get selectedFolder(): string {
    return this.selectedFolderStream$.value;
  }

  set selectedFolder(folderId: string) {
    this.selectedFolderStream$.next(folderId);
  }

  get gridItems(): PeDataGridItem[] {
    return this.gridItemsStream$.value;
  }

  set gridItems(items: PeDataGridItem[]) {
    this.gridItemsStream$.next(items);
  }

  get gridFolders(): PeDataGridItem[] {
    return this.gridFoldersStream$.value;
  }

  set gridFolders(folders: PeDataGridItem[]) {
    this.gridFoldersStream$.next(folders);
  }

  set order(value: any) {
    this.orderStream$.next(value);
  }

  get order(): any {
    return this.orderStream$.value;
  }

  private copiedCollectionsStream$ = new BehaviorSubject<string[]>([]);
  constructor(
    private envService: InvoiceEnvService,
    private translateService: TranslateService,
    private mediaService: MediaService,
    private snackBar: MatSnackBar,
    private api: PeInvoiceApi,
    private localeConstantsService: LocaleConstantsService,
    private store: Store,
    private dialog: MatDialog,
    private sanitizer: DomSanitizer,
    private fb: FormBuilder,
    private mediaUrlPipe: MediaUrlPipe,
    private router: Router,
    public invoiceService : InvoiceApiService,
    private activatedRoute: ActivatedRoute,
    private http: HttpClient,
    @Inject(PEB_INVOICE_API_PATH) private invoiceApiPath: string,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private messageBus: MessageBus,
  ) {
    super();
    this.messageBus.listen('invoice.set.builder_edit').pipe(takeUntil(this.destroyed$))
    .subscribe((item: any) => {
      if (item?.data?.isFolder) {
        this.collectionEdit(item.id);
      } else {
        this.invoiceEdit(item.id);
      }
    });
  }

  get selectedInvoice(): string[] {
    return this.selectedInvoiceStream$.value;
  }

  set selectedInvoice(ids: string[]) {
    this.selectedInvoiceStream$.next(ids);
  }

  public invoiceFolderToTreeItem(): TreeFilterNode<InvoiceTreeDataInterface>[] {
    return this.convertInvoiceToTreeItem(this.invoiceFolders);
  }

  public invoiceFilterToTreeItem(): TreeFilterNode<InvoiceTreeDataInterface>[] {
    return this.convertInvoiceToTreeItem(this.invoiceFilters);
  }


  folderToFolderMapper = (album) => {
    return {
      id: album.id,
      name: album.name,
      image: this.mediaService.getMediaUrl(album.icon, 'builder'),
      editing: false,
      parentId: album.parent,
      noToggleButton: false,
      children: [],
      data: {
        isFolder: true,
      },
    };
  }

  invoiceMapper = (invoice) => {
    const subtitle = invoice.issueDate ? `Date: ${formatDate(invoice.issueDate, 'M.d.yyyy', 'en')}`: '';
    if (invoice?.customer?.contactId) {
      invoice.customer.id = invoice.customer.contactId;
    }

    return {
      id: invoice._id,
      type: PeGridItemType.Item,
      title: invoice.reference,
      itemLoader$: new BehaviorSubject<boolean>(false),
      subtitle,
      createdAt: invoice.updatedAt,
      status: invoice.status,
      description: invoice.amountPaid,
      selected: false,
      labels: [invoice.status],
      image: invoice.picture ?
        this.mediaService.getMediaUrl(invoice.picture, 'builder') : './assets/icons/folder-grid.png',
      action: {
        more: true,
      },
      disabledMenuItems: [
        {
          disable: !invoice.customer?.email,
          value: ContextMenu.Send,
        },
      ],
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    }
  }

  private convertInvoiceToTreeItem(folders): TreeFilterNode<InvoiceTreeDataInterface>[] {

    return folders.map((option) => {
      const data: InvoiceTreeDataInterface = {
        isFolder: false,
        category: option.value,
      };

      return {
        id: option.labelKey,
        name: this.translateService.translate(option.labelKey),
        imageSvg: option.image,
        editing: false,
        parentId: null,
        noToggleButton: true,
        data,
      }
    });
  }

  openSnackbar(text: string, success: boolean): MatSnackBarRef<any> {

    return this.snackBar.openFromComponent(PeInvoiceSnackbarComponent, {
      duration: 2000,
      verticalPosition: 'top',
      panelClass: 'mat-snackbar-shop-panel-class',
      data: {
        text,
        icon: success ? '#icon-snackbar-success' : '#icon-snackbar-error',
      },
    });
  }

  public onDuplicate(invoiceIds?: string[]) {

    return forkJoin(invoiceIds.map(invoiceId => this.api.duplicateInvoice(invoiceId)))
      .pipe(
        finalize(() => {
          this.selectedItems = [];
        }),
        tap((invoices) => {
          this.openSnackbar(this.translateService.translate('invoice-app.messages.invoice_duplicated'), true);

        }),
        catchError((err) => {
          this.openSnackbar(this.translateService.translate('invoice-app.messages.invoice_not_duplicated'), false);

          return EMPTY;
        }),
        take(1),
      )
  }

  private getSearchParams(searchData: any): HttpParams {
    const searchDataCopy = cloneDeep(searchData);
    let searchParams: HttpParams = new HttpParams()
      .set('orderBy', searchDataCopy.orderBy ? searchDataCopy.orderBy.replace(/p\./g, '') : 'updatedAt')
      .set('direction', searchDataCopy.direction ? searchDataCopy.direction : 'desc')
      .set('limit', searchDataCopy.perPage ? `${searchDataCopy.perPage}` : '10')
      .set('page', searchDataCopy.page ? `${searchDataCopy.page}` : '1')
      .set('filters[isHeadline][0][condition]', 'isNot')
      .set('filters[isHeadline][0][value][0]', 'true');

    if (Object.keys(searchDataCopy?.configuration ?? []).length) {
      const flattenParams: { [propName: string]: string } = flatten({ configuration: searchDataCopy.configuration });

      forIn(flattenParams, (propValue: string, propName: string) => {
        const httpParamName: string = propName.split('.')
          .map((element: string, index: number) => {
            if (index !== 0) {
              return `[${element}]`;
            }

            return 'filters';
          })
          .join('');

        searchParams = searchParams.set(httpParamName, propValue);
      });
    }

    return searchParams;
  }

  folderToItemMapper(folder): PeGridItem {
    const imageURL = folder.isFolder ? folder.image :
      this.mediaService.getMediaUrl(folder.icon, 'builder') ?? './assets/icons/folder-grid.png' ;

    return {
      id: folder._id,
      type: PeGridItemType.Folder,
      image: imageURL,
      title: folder.name,
      data: {
        position: folder.position,
      },
      hideMenuItems: [
        {
          hide: true,
          value: ContextMenu.Download,
        },
        {
          hide: true,
          value: ContextMenu.Print,
        },
        {
          hide: true,
          value: ContextMenu.Send,
        },
      ],
    action: {
        label: this.translateService.translate('open').toLowerCase(),
        more: true,
      },
      columns: [
        {
          name: 'name',
          value: 'name',
        },
        {
          name: 'action',
          value: 'action',
        },
      ],
    };
  }

  private getNavigateParams(): NavigationExtras {
    const navigateParams: NavigationExtras = {};

    if (this.canUseRelativeNavigate()) {
      navigateParams.relativeTo = this.activatedRoute;
      navigateParams.queryParams = {};
      navigateParams.queryParams.addExisting = true;
      navigateParams.queryParams.prevInvoicePath = this.activatedRoute.snapshot.url[0]?.path ?? '';
    }
    navigateParams.queryParamsHandling = 'merge';
    navigateParams.skipLocationChange = true;

    return navigateParams;
  }

  private canUseRelativeNavigate(): boolean {

    return (
      this.activatedRoute.snapshot.pathFromRoot.filter((route: ActivatedRouteSnapshot) => route.url.length > 0).length >
      0
    );
  }

  get copiedCollections(): string[] {

    return this.copiedCollectionsStream$.value;
  }

  set copiedCollections(ids: string[]) {
    this.copiedCollectionsStream$.next(ids);
  }

  get copiedInvoice(): string[] {

    return this.copiedInvoiceStream$.value;
  }

  set copiedInvoice(ids: string[]) {
    this.copiedInvoiceStream$.next(ids);
  }

  getQueryParamByName(name: GridQueryParams): number | string {

    return pick(this.queryParams, [name])[name];
  }

  private getCollectionsFilters(collections: TreeFilterNode[]): Filter {
    const values = collections?.map(collection => collection?.id);

    return {
      key: FieldFilterKey.Collections,
      condition: 'is',
      value: values,
    };
  }



  loadInvoice(): Observable<any> {
    return this.api
      .getInvoiceList()
      .pipe(
        map((data: any) => ({
          ...data,
          data: {
            ...data.data,
            getInvoiceList: {
              ...data.data.getInvoiceList,
              invoice: data.data.getInvoiceList.invoice.filter(Boolean),
            },
          },
        })),
        tap(({ data }: any) => {
          const {  invoice } = data.getInvoiceList;
          this.invoices = invoice.map(invoice => this.invoiceMapper(invoice))
        }),
      );
  }

  createDataGridItem(invoice: any): PeDataGridItem  {
    new Intl.NumberFormat(this.localeConstantsService.getLocaleId(), {
    }).format(invoice);
    const item = {
      id: invoice.id,
      name: invoice.name,
      picture: this.mediaUrlPipe.transform(invoice.picture[0], 'invoice', 'grid-thumbnail' as any),
      title: invoice.subtitle,
      customFields: [

        { content: invoice.subtitle },
        { content: invoice.dueDate },
        { content: invoice.amount },
        { content: invoice.status },
        { component: PeInvoiceBuilderEditComponent },
      ],
      selected: false,
      actions: this.getActions(),
    };

    return item;

  }

  getActions(isFolder?: boolean): PeDataGridSingleSelectedAction[] {
    const isLoading = new BehaviorSubject(false);

    if (isFolder) {

      return [
        {
          label: this.translateService.translate('open'),
          callback: (id: string) => {
            const tree = this.collections.find(collection => collection.id === id);
            this.filtersFormGroup.get('tree').patchValue([tree]);
          },
        },
        {
          label: this.translateService.translate('edit'),
          callback: (id: string) => {
            this.collectionEdit(id, isLoading);
          },
          isLoading$: isLoading.asObservable(),
        },
      ];
    }

    return [{
      label: this.translateService.translate('open'),
      callback: (id: string) => {
        this.invoiceEdit(id, isLoading);
      },
      isLoading$: isLoading.asObservable(),
    }];
  }

  collectionEdit(id: string, isLoading?: BehaviorSubject<boolean>) {
    if (isLoading) {
      isLoading.next(true);
    }

    this.router.navigate([
      ...['business', this.envService.businessUuid, 'invoice', 'list'],
      { outlets: { editor: ['collections-editor', id] } },
    ], this.getNavigateParams()).then(() => isLoading?.next(false));
  }

  invoiceEdit(id: string, isLoading?: BehaviorSubject<boolean>) {
    if (isLoading) {
      isLoading.next(true);
    }

    this.router.navigate([
      ...['business', this.envService.businessUuid, 'invoice'],
      {
        outlets: {
          editor: ['invoice-editor', 'edit', id],
        },
      },
    ], this.getNavigateParams()).then(() => isLoading?.next(false));
  }

  createDataGridFolder(collection: any): PeDataGridItem {

    return {
      id: collection._id,
      image: this.mediaUrlPipe.transform(collection.image, 'invoice'),
      title: collection.name,
      subtitle: `${collection.invoiceCount ?? 0} invoice`,
      customFields: [
        { content: '' },
        { content: '' },
        { content: '' },
        { content: '' },
        { content: `${collection.invoiceCount ?? 0}` },
        { component: PeInvoiceBuilderEditComponent },
      ],
      data: {
        isFolder: true,
      },
      actions: this.getActions(true),
    };
  }

  pasteItems(targetFolderId = null, prefix?: string) {
    if (this.copiedInvoice.length) {
      this.api.copyInvoice  (
        this.copiedInvoice,
        targetFolderId,
      ).pipe(
        tap((item) => {
          this.duplicatedGridItem$.next(item[0]);
        }),
      ).subscribe();
    }

    if (this.copiedCollections.length) {
      this.api.copyInvoice(
        this.copiedInvoice,
        targetFolderId,
      ).pipe(
        tap(() => {
          this.updateGridFolders();
        }),
      ).subscribe();
    }

    if (prefix) {
      this.copiedInvoice = [];
      this.copiedCollections = [];
    }
  }

  updateGridFolders(parentId = null) {
    this.invoiceService.loadCollections(1, this.envService.businessUuid, parentId).pipe(
      take(1),
      tap((data) => {
        const gridFolders = data.collections.map(collection => this.createDataGridFolder(collection));
        this.gridFolders = gridFolders;
      }),
    ).subscribe();
  }

}
