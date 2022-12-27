import { Overlay } from '@angular/cdk/overlay';
import { Injectable, OnDestroy } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { SafeHtml } from '@angular/platform-browser';
import { ActivatedRoute, ActivatedRouteSnapshot, NavigationExtras, Router } from '@angular/router';
import { cloneDeep, isArray, isEqual, map as lodmap, sumBy, uniq } from 'lodash-es';
import { BehaviorSubject, combineLatest } from 'rxjs';
import {
  distinctUntilChanged,
  map,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  MenuSidebarFooterData, MessageBus,
  PeDataGridApplyFilterCondition,
  PeDataGridFilterConditionType,
  PeDataGridFilterWithConditions,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridListOptions,
  PeDataGridSingleSelectedAction,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  TreeFilterNode,
  EnvService
} from '@pe/common';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaContainerType, MediaUrlPipe } from '@pe/media';

import { AbstractService } from '../../../misc/abstract.service';
import { Direction } from '../../../shared/enums/direction.enum';
import { FieldFilterKey } from '../../../shared/enums/filter.enum';
import { PeChannelGroup } from '../../../shared/interfaces/channel-group.interface';
import { Collection } from '../../../shared/interfaces/collection.interface';
import { Filter } from '../../../shared/interfaces/filter.interface';
import { Order } from '../../../shared/interfaces/order.interface';
import { Product, ProductStockInfo } from '../../../shared/interfaces/product.interface';
import { InventoryInterface } from '../../../shared/interfaces/section.interface';
import { ProductsApiService } from '../../../shared/services/api.service';
import { getTrackableProductInventory } from '../../../shared/utils/product-utils';
import { convertStock } from '../../../shared/utils/stock-formatter';
import { EditMenuComponent } from '../../components/edit-menu/edit-menu.component';
import { ProductsOrderBy } from '../../enums/order-by.enum';
import { ChannelTypeIconService } from '../channel-type-icon.service';
import { DialogService } from '../dialog-data.service';
import { ProductsListService } from '../products-list.service';

import { NUMBER_CONDITIONS, TEXT_CONDITIONS } from './filters';


@Injectable()
export class DataGridService extends AbstractService implements OnDestroy {

  set order(value: Order) {
    this.orderStream$.next(value);
  }

  get order(): Order {
    return this.orderStream$.value;
  }

  get copiedProducts(): string[] {
    return this.copiedProductsStream$.value;
  }

  set copiedProducts(ids: string[]) {
    this.copiedProductsStream$.next(ids);
  }

  get copiedCollections(): string[] {
    return this.copiedCollectionsStream$.value;
  }

  set copiedCollections(ids: string[]) {
    this.copiedCollectionsStream$.next(ids);
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

  set loadingProductId(value: string) {
    this.loadingProductIdStream$.next(value);
  }

  get selectedFolder(): string {
    return this.selectedFolderStream$.value;
  }

  set selectedFolder(folderId: string) {
    this.selectedFolderStream$.next(folderId);
  }

  get selectedProducts(): string[] {
    return this.selectedProductsStream$.value;
  }

  set selectedProducts(ids: string[]) {
    this.selectedProductsStream$.next(ids);
  }

  get showAddItem(): boolean {
    return this.showAddItemStream$.value;
  }

  set conditionFormattedFilters(filters: Filter[]) {
    const validatedFilters = filters.filter(
      filter =>
        !!filter.value &&
        (!isArray(filter.value) ||
          (filter.value as any[]).some(val => val !== undefined && val !== null && val !== '')),
    );
    this.conditionFormattedFiltersStream$.next(validatedFilters);
  }

  get conditionFormattedFilters(): Filter[] {
    return this.conditionFormattedFiltersStream$.value;
  }

  set showFilters(value: boolean) {
    this.showFiltersStream$.next(value);
  }

  get showFilters(): boolean {
    return this.showFiltersStream$.value;
  }

  defaultChannels: PeChannelGroup[];
  actionAddToCollection: any[] = [];

  addProductIsLoading$ = new BehaviorSubject(false);
  addCollectionIsLoading$ = new BehaviorSubject(false);

  expandTreeSubject$ = new BehaviorSubject<any>(null);
  expandTree$ = this.expandTreeSubject$.asObservable();

  set expandTree(data) {
    this.expandTreeSubject$.next(data);
  }

  addActions: PeDataGridSingleSelectedAction[] = [
    {
      label: '',
      callback: () => {
        this.addProductIsLoading$.next(true);

        this.router.navigate(
          [
            ...['business', this.envService.businessId, 'products', 'list'],
            { outlets: { editor: ['products-editor', 'add'] } },
          ],
          this.getNavigateParams(),
        ).then(() => this.addProductIsLoading$.next(false));
      },
      isLoading$: this.addProductIsLoading$.asObservable(),
    },
  ];

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: this.translateService.translate('order'),
    customFieldsTitles: [
      this.translateService.translate('filters.labels.channel'),
      this.translateService.translate('filters.labels.category'),
      this.translateService.translate('filters.labels.price'),
      `${this.translateService.translate('variants')} / ${this.translateService.translate('stock')}`,
      this.translateService.translate('filters.labels.products_count'),
    ],
  };

  sortByActions: PeDataGridSortByAction[] = [
    {
      label: this.translateService.translate('sorters.name'),
      callback: () => {
        this.productsListService.toggleOrderByField(ProductsOrderBy.Title);
        this.toggleOrderByField(ProductsOrderBy.Name);
      },
      icon: PeDataGridSortByActionIcon.Name,
    },
    {
      label: this.translateService.translate('sorters.price_asc'),
      callback: () => {
        this.productsListService.toggleOrderByField(ProductsOrderBy.Price, Direction.ASC);
      },
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: this.translateService.translate('sorters.price_desc'),
      callback: () => {
        this.productsListService.toggleOrderByField(ProductsOrderBy.Price, Direction.DESC);
      },
      icon: PeDataGridSortByActionIcon.Descending,
    },
  ];

  filterItems = [
    {
      label: this.translateService.translate('filters.labels.id'),
      value: 'Product ID',
    },
    {
      label: this.translateService.translate('filters.labels.product_name'),
      value: 'Product Name',
    },
    {
      label: this.translateService.translate('filters.labels.price'),
      value: 'Price',
    },
    {
      label: this.translateService.translate('filters.labels.category'),
      value: 'Category',
    },
    {
      label: this.translateService.translate('filters.labels.variant_name'),
      value: 'Variant Name',
    },
  ];

  filterConditions: PeDataGridFilterWithConditions[] = [
    {
      filterName: 'Product ID',
      filterKey: 'id',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Id,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Product Name',
      filterKey: 'name',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Name,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Price',
      filterKey: 'price',
      type: PeDataGridFilterConditionType.Number,
      conditions: cloneDeep(NUMBER_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Price,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Channel',
      filterKey: 'channel',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Channel,
          value: condition.condition.conditionFields.map((field) => {
            return field.inputValue.toString();
          }),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Category',
      filterKey: 'category',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.Category,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
    {
      filterName: 'Variant Name',
      filterKey: 'variant_name',
      type: PeDataGridFilterConditionType.Text,
      conditions: cloneDeep(TEXT_CONDITIONS),
      applyFilter: (condition: PeDataGridApplyFilterCondition) => {
        const formattedFilter: Filter = {
          key: FieldFilterKey.VariantName,
          value: condition.condition.conditionFields[0].inputValue.toString(),
          condition: condition.condition.conditionValue,
        };
        this.applyFilterToFormattedFilters(formattedFilter);
      },
    },
  ];

  private orderStream$ = new BehaviorSubject<Order>({
    by: 'createdAt',
    direction: Direction.DESC,
  });

  order$ = this.orderStream$.asObservable();

  addItem: PeDataGridItem = {
    id: '0',
    image: '',
    selected: false,
  };

  filtersFormGroup = this.fb.group({
    tree: [[]],
    toggle: [false],
  });

  collections = [];
  layout: PeDataGridLayoutType = PeDataGridLayoutType.Grid;

  updatedGridItem$ = new BehaviorSubject<any>(null);
  duplicatedGridItem$ = new BehaviorSubject<any>(null);

  private copiedCollectionsStream$ = new BehaviorSubject<string[]>([]);
  private copiedProductsStream$ = new BehaviorSubject<string[]>([]);
  private conditionFormattedFiltersStream$ = new BehaviorSubject<Filter[]>([]);
  private loadingProductIdStream$ = new BehaviorSubject<string>(null);
  private selectedProductsStream$ = new BehaviorSubject<string[]>([]);
  private gridItemsStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private gridFoldersStream$ = new BehaviorSubject<PeDataGridItem[]>([]);
  private selectedFolderStream$ = new BehaviorSubject<string>(null);
  private showAddItemStream$ = new BehaviorSubject<boolean>(true);
  private showFiltersStream$ = new BehaviorSubject<boolean>(true);
  private treeDataStream$ = new BehaviorSubject<TreeFilterNode[]>(null);
  private channelTreeDataStream$ = new BehaviorSubject<TreeFilterNode[]>(null);

  private initialSidebarFooterData: MenuSidebarFooterData = {
    headItem: {
      title: this.translateService.translate('options'),
    },
    menuItems: [
      {
        title: this.translateService.translate('add_collection'),
        onClick: () => {
          this.router.navigate(
            [
              ...['business', this.envService.businessId, 'products', 'list'],
              { outlets: { editor: 'collections-editor' } },
            ],
            this.getNavigateParams(),
          );
        },
      },
    ],
  };

  conditionFormattedFilters$ = this.conditionFormattedFiltersStream$.asObservable();
  gridItems$ = this.gridItemsStream$.asObservable();
  gridFolders$ = this.gridFoldersStream$.asObservable();
  selectedFolder$ = this.selectedFolderStream$.asObservable();
  showFilters$ = this.showFiltersStream$.asObservable();

  treeData$ = this.treeDataStream$.asObservable();
  channelTreeData$ = this.channelTreeDataStream$.asObservable();

  get channelTreeData(): TreeFilterNode[] {
    return this.channelTreeDataStream$.value;
  }

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

  sidebarFooterData$ = this.filtersFormGroup.get('tree').valueChanges.pipe(
    startWith(this.initialSidebarFooterData),
    map((tree: TreeFilterNode[]) => {
      if (Array.isArray(tree)) {
        if (tree.length) {
          if (tree[0] && tree[0]['slug'] !== 'payever-dropshipping') {
            this.selectedFolder = tree[0].id;
            this.updateGridFolders(tree[0].id);
          }
        } else {
          this.selectedFolder = null;
          this.updateGridFolders(null);
        }
      }

      return this.initialSidebarFooterData;
    }),
  );

  private inventories: InventoryInterface[] = [];

  constructor(
    private router: Router,
    private mediaUrlPipe: MediaUrlPipe,
    private channelTypeIconService: ChannelTypeIconService,
    private envService: EnvService,
    private activatedRoute: ActivatedRoute,
    private productsApiService: ProductsApiService,
    private productsListService: ProductsListService,
    private localeConstantsService: LocaleConstantsService,
    private fb: FormBuilder,
    private overlay: Overlay,
    private confirmDialog: DialogService,
    private translateService: TranslateService,
    private messageBus: MessageBus
  ) {
    super();
    this.messageBus.listen('products.edit.menu').pipe(takeUntil(this.destroyed$))
      .subscribe((item: any) => {
        if (item?.data?.isFolder) {
          this.collectionEdit(item.id);
        } else {
          this.productEdit(item.id);
        }
      });

    this.messageBus.listen('products.delete.menu').pipe(takeUntil(this.destroyed$))
      .subscribe((item: any) => {
        if (item?.data?.isFolder) {
          this.deleteSelected([item.id], [], PeDataGridLayoutType.List);
        } else {
          this.deleteSelected([], [item.id], PeDataGridLayoutType.List);
        }
      });
  }

  createDataGridItem(product: Product): PeDataGridItem & { company } {
    const formattedPrice = new Intl.NumberFormat(this.localeConstantsService.getLocaleId(), {
      style: 'currency',
      currency: product.currency ?? 'EUR',
    }).format(product.price);
    const item = {
      id: product.id,
      company: product.company,
      image: this.mediaUrlPipe.transform(product.images[0], MediaContainerType.Products, 'grid-thumbnail' as any),
      title: product.title,
      subtitle: formattedPrice,
      description: `${product.stock ?? 0} ${convertStock(this.getProductStockInfo(product))}`,
      customFields: [
        { content: this.getChannelData(product) },
        { content: product.categories?.map(cat => cat.title).join('/') },
        { content: formattedPrice },
        { content: `${product.variantCount ?? 0} / ${product.stock ?? 0}` },
        { content: `` },
        { component: EditMenuComponent },
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
        this.productEdit(id, isLoading);
      },
      isLoading$: isLoading.asObservable(),
    }];
  }

  openFolder(id) {
    const tree = this.collections.find(collection => collection.id === id);
    this.filtersFormGroup.get('tree').patchValue([tree]);
  }

  createDataGridFolder(collection: Collection): PeDataGridItem {
    return {
      id: collection._id,
      image: this.mediaUrlPipe.transform(collection.image, MediaContainerType.Products),
      title: collection.name,
      subtitle: `${collection.productCount ?? 0} products`,
      customFields: [
        { content: '' },
        { content: '' },
        { content: '' },
        { content: '' },
        { content: `${collection.productCount ?? 0}` },
        { component: EditMenuComponent },
      ],
      data: {
        isFolder: true,
      },
      actions: this.getActions(true),
    };
  }

  getTreeData() {
    return this.productsListService.collections$.pipe(
      map((collections) => {
        let channelTreeData = [];
        const treeData = collections
          ?.filter((collection) => {
            return collection.slug !== 'payever-dropshipping' && collection.slug !== 'My_Dropshipping';
          })
          .map(collection => this.setCollectionItem(collection));
        channelTreeData = channelTreeData.map(collection => this.setCollectionItem(collection));
        this.collections = [];
        this.channelTreeDataStream$.next(this.setRootData(channelTreeData));
        this.treeDataStream$.next(this.setRootData(treeData));
      }),
      map((list) => {
      }),
    ).subscribe();
  }

  private setCollectionItem(collection) {
    return {
      id: collection._id,
      name: collection.name,
      slug: collection.slug,
      image: ['My_Dropshipping', 'payever-dropshipping'].includes(collection.slug) ?
        collection.image : this.mediaUrlPipe.transform(collection.image, MediaContainerType.Products),
      children: [],
      parentId: collection.parent,
    };
  }

  private setRootData(list) {
    this.collections = [...this.collections, ...list];
    const dict = {};
    let node;
    const roots = [];
    let i: number;
    for (i = 0; i < list.length; i += 1) {
      dict[list[i].id] = i;
      list[i].children = [];
    }
    for (i = 0; i < list.length; i += 1) {
      node = list[i];
      if (node.parentId !== undefined && node.parentId !== null) {
        list[dict[node.parentId]]?.children.push(node);
      } else {
        roots.push(node);
      }
    }

    return roots;
  }

  collectionEdit(id: string, isLoading?: BehaviorSubject<boolean>) {
    if (isLoading) {
      isLoading.next(true);
    }

    this.router.navigate([
      ...['business', this.envService.businessId, 'products', 'list'],
      { outlets: { editor: ['collections-editor', id] } },
    ], this.getNavigateParams()).then(() => isLoading?.next(false));
  }

  pasteItems(targetFolderId = null, prefix?: string) {
    if (this.copiedProducts.length) {
      this.productsApiService.postCopyProducts(
        this.copiedProducts,
        targetFolderId,
        this.envService.businessId,
        prefix,
      ).pipe(
        take(1),
        tap((resp) => {
          if (resp?.data.copyProducts?.products?.length) {
            resp.data.copyProducts.products.forEach((item) => {
              this.duplicatedGridItem$.next(item);
            });
          }

        }),
      ).subscribe();
    }

    if (this.copiedCollections.length) {
      this.productsApiService.postCopyCollection(
        this.copiedCollections,
        targetFolderId,
        this.envService.businessId,
        prefix,
      ).pipe(
        take(1),
        tap(() => {
          this.updateGridFolders();
        }),
      ).subscribe();
    }

    if (prefix) {
      this.copiedProducts = [];
      this.copiedCollections = [];
    }
  }

  productEdit(id: string, isLoading?: BehaviorSubject<boolean>) {
    if (isLoading) {
      isLoading.next(true);
    }

    this.router.navigate([
      ...['business', this.envService.businessId, 'products', 'list'],
      {
        outlets: {
          editor: ['products-editor', 'edit', id],
        },
      },
    ], this.getNavigateParams()).then(() => isLoading?.next(false));
  }

  toggleFiltersDisplaying(value?: boolean) {
    const showFilter = value ?? !this.selectedProductsStream$.value;
    this.showFiltersStream$.next(showFilter);
  }

  updateGrid(item?, isEdit?) {
    const itemData = {
      item,
      isEdit,
    }
    this.updatedGridItem$.next(itemData)
  }

  updateGridFolders(parentId = null) {
    this.productsApiService.loadCollections(1, this.envService.businessId, parentId).pipe(
      take(1),
      tap((data) => {
        const gridFolders = data.collections.map(collection => this.createDataGridFolder(collection));
        this.gridFolders = gridFolders;
      }),
    ).subscribe();
  }

  ngOnDestroy() {
    this.filtersFormGroup.get('tree').patchValue([]);
    this.conditionFormattedFilters = [];
    this.gridItems = [];
    this.gridFolders = [];
    super.ngOnDestroy();
  }

  private getCollectionsFilters(collections: TreeFilterNode[]): Filter {
    const values = collections?.map(collection => collection?.id);

    return {
      key: FieldFilterKey.Collections,
      condition: 'is',
      value: values,
    };
  }

  private getProductStockInfo(product: Product): ProductStockInfo {
    const productInventory: InventoryInterface[] = getTrackableProductInventory(product, this.inventories);

    return {
      stock: sumBy(productInventory, inventory => inventory.stock || 0),
      isTrackable: productInventory.length > 0,
    };
  }

  private getChannelData(product: Product): SafeHtml {
    const dist: string[] = uniq(lodmap(product.channelSets, 'type'));

    return this.channelTypeIconService.getIconAsSafeHtml(dist);
  }

  deleteSelected(collections: string[], products: string[], view: PeDataGridLayoutType) {
    const title = collections.length && products.length
      ? 'delete_items' : !collections.length
        ? 'deleting_products' : 'deleting_collections';
    const subtitle = collections.length && products.length
      ? 'do_you_really_want_to_delete_selected_items' : !collections.length
        ? 'do_you_really_want_to_delete_your_products' : 'do_you_really_want_to_delete_your_collections';
    this.confirmDialog.open({
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.translateService.translate('imports.overwrite_box.accept_button'),
      declineBtnText: this.translateService.translate('imports.overwrite_box.decline_button'),
    });

    this.confirmDialog.confirmation$.pipe(
      skip(1),
      take(2),
      switchMap(() => this.productsApiService.removeStoreItem(products)),
      switchMap(() => this.productsApiService.deleteCollections(collections, this.envService.businessId)),
      withLatestFrom(this.allFilters$),
      switchMap(([_, filters]) => {
        this.selectedProducts = this.selectedProducts.filter(id => !products.includes(id));

        return this.productsListService.loadProducts(filters, false, view);
      }),
      switchMap(() => {
        return this.productsListService.loadProductsByChannelSet(this.envService.businessId);
      }),
      switchMap(() => {
        this.filtersFormGroup.get('tree').patchValue([]);

        return this.productsListService.loadCollections();
      }),
    ).subscribe();
  }

  applyFilterToFormattedFilters(formattedFilter: Filter) {
    const formattedFilterValue: Filter[] = !this.conditionFormattedFilters.some(
      filter => filter.key === formattedFilter.key,
    )
      ? [...this.conditionFormattedFilters, formattedFilter]
      : this.conditionFormattedFilters.map(filter => (filter.key === formattedFilter.key ? formattedFilter : filter));
    this.conditionFormattedFilters = formattedFilterValue;
  }

  private getNavigateParams(): NavigationExtras {
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

  private canUseRelativeNavigate(): boolean {
    return (
      this.activatedRoute.snapshot.pathFromRoot.filter((route: ActivatedRouteSnapshot) => route.url.length > 0).length >
      0
    );
  }

  addProduct(product?) {
    this.addProductIsLoading$.next(true);
    const extras = this.getNavigateParams();
    if (product) {
      extras.queryParams = {
        products: JSON.stringify(product),
      };
    }
    this.router.navigate([...['business', this.envService.businessId, 'products', 'list'],
        { outlets: { editor: ['products-editor', 'add'] } }],
      extras,
    ).then(() => this.addProductIsLoading$.next(false));
  }

  toggleOrderByField(field: ProductsOrderBy, direction?: Direction) {
    const updatedDirection =
      direction ??
      (this.order.by === field
        ? this.order.direction === Direction.ASC
          ? Direction.DESC
          : Direction.ASC
        : Direction.DESC);
    this.order = {
      by: field,
      direction: updatedDirection,
    };
  }
}
