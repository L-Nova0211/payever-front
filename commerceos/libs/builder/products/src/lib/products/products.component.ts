import { ChangeDetectorRef, Component, ElementRef, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import groupBy from 'lodash/groupBy';
import { BehaviorSubject, combineLatest, merge, Observable, of, ReplaySubject, Subject } from 'rxjs';
import { catchError, map, shareReplay, skip, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PebContextApi } from '@pe/builder-context';
import {
  PebFilterConditionType,
  PebFilterParams,
  PebIntegration,
  PebIntegrationAction,
  PebIntegrationTag,
  PebOrderParams,
  PebPaginationParams,
  PebProduct,
  PebProductCollection,
} from '@pe/builder-core';
import {
  AppType,
  drawText,
  EnvironmentConfigInterface,
  MenuSidebarFooterData,
  PE_ENV,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridSingleSelectedAction,
  PeSearchItem,
  TreeFilterNode,
} from '@pe/common';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { TreeSidebarFilterComponent } from '@pe/sidebar';

export interface PebProductsData {
  selectedProducts: string[];
  productsIntegration: PebIntegration;
  productsIntegrationAction: PebIntegrationAction;
  productsCollectionIntegrationAction: PebIntegrationAction;
}

@Component({
  selector: 'peb-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebProductsComponent implements OnInit, OnDestroy {

  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @ViewChild('collectionTreeFilter') collectionTreeFilter: TreeSidebarFilterComponent;

  readonly collectionRefresh$ = new Subject();
  readonly PeDataGridLayoutType = PeDataGridLayoutType;
  private readonly selectedSubject$ = new BehaviorSubject<string[]>([]);
  readonly selected$ = this.selectedSubject$.asObservable();
  set selected(ids: string[]) {
    this.dataGridItems.forEach((item) => {
      item.selected = ids.includes(item.id);
    });
    this.selectedSubject$.next(ids);
  }

  get selected(): string[] {
    return this.selectedSubject$.value;
  }

  formGroup = this.fb.group({
    collectionsTree: [[]],
  });

  isSubscription: boolean;
  sidebarHeaderTitle: string;
  sidebarFilterWrapperTitle: string;
  sectionHeaderTitle: string;

  private readonly productsSubject$ = new BehaviorSubject<PebProduct[]>([]);
  readonly products$ = this.productsSubject$.asObservable();
  private dataGridItemsSubject$ = new BehaviorSubject<PeDataGridItem[]>([]);
  readonly dataGridItems$: Observable<PeDataGridItem[]> = this.dataGridItemsSubject$.asObservable();
  readonly filteredProductsGridItems$ = combineLatest([
    this.dataGridItems$,
    // this.formGroup.get('collectionsTree').valueChanges.pipe(
    //   startWith(this.formGroup.get('collectionsTree').value),
    // ),
  ]).pipe(
    map(([items]) => items),
    shareReplay(1),
  );

  get dataGridItems(): PeDataGridItem[] {
    return this.dataGridItemsSubject$.getValue();
  }

  private headerConfig: PePlatformHeaderConfig;
  private destroyed$ = new ReplaySubject<boolean>();

  theme = 'dark';

  multipleSelectedActions: any[] = [
    {
      label: 'Select all',
      callback: () => {
        this.selected = this.dataGridItems.map(item => item.id);
      },
    },
    {
      label: 'Deselect all',
      callback: () => (this.selected = []),
    },
    {
      label: 'Add to Collection',
      callback: () => this.onClose(true),
    },
    {
      label: 'Close',
      callback: () => this.onClose(false),
    },
  ];

  sortByActions: any[] = [
    {
      label: 'Name',
      callback: () => console.log('sort by name'),
    },
    {
      label: 'Price: Ascending',
      callback: () => console.log('sort by price: asc'),
    },
    {
      label: 'Price: Descending',
      callback: () => console.log('sort by price des'),
    },
    {
      label: 'Date',
      callback: () => console.log('sort by date'),
    },
  ];

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Select',
    callback: (data: string) => {
      this.dialogRef.close([data]);
    },
  };

  readonly allProductsAction: PeDataGridSingleSelectedAction = {
    label: 'All products',
    callback: () => this.all(),
  };

  readonly openCollectionAction: PeDataGridSingleSelectedAction = {
    label: 'Open',
    callback: (id: string) => {
      const item = this.collectionsTreeDataArraySubject.getValue().find(i => i.id === id);
      this.formGroup.get('collectionsTree').setValue(item ? [item] : []);
      this.collectionRefresh$.next(true);
    },
  };

  private readonly collectionsSubject = new BehaviorSubject<PebProductCollection[]>([]);
  readonly collections$ = this.collectionsSubject.asObservable();
  private readonly collectionsTreeDataArraySubject = new BehaviorSubject<TreeFilterNode[]>([]);
  private readonly collectionsTreeDataSubject = new BehaviorSubject<TreeFilterNode[]>([]);
  readonly collectionsTreeData$: Observable<TreeFilterNode[]> = this.collectionsTreeDataSubject.asObservable();
  private readonly collectionsGridItemsSubject = new BehaviorSubject<PeDataGridItem[]>([]);
  readonly collectionsGridItems$: Observable<PeDataGridItem[]> = this.collectionsGridItemsSubject.asObservable();
  readonly filteredCollectionsGridItems$ = combineLatest([
    this.collectionsGridItemsSubject,
    this.formGroup.get('collectionsTree').valueChanges.pipe(
      startWith(this.formGroup.get('collectionsTree').value),
    ),
  ]).pipe(
    map(([items, collectionsTree]) => {
      const collectionId = collectionsTree?.[0]?.id ?? null;

      return items.filter(item => item.data.parent === collectionId);
    }),
  );

  get collectionsTreeData() {
    return this.collectionsTreeDataSubject.getValue();
  }

  sidebarFooterData: MenuSidebarFooterData = {
    headItem: { title: 'Folder Name' },
    menuItems: [
      { title: 'Rename', onClick: () => {  } },
      { title: 'Move', onClick: () => {  } },
      { title: 'Settings', onClick: () => {  } },
      { title: 'Add New Album', onClick: () => {  } },
      { title: 'Delete', onClick: () => {  } },
    ],
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: PebProductsData,
    private dialogRef: MatDialogRef<PebProductsComponent>,
    private platformHeader: PePlatformHeaderService,
    private fb: FormBuilder,
    private contextApi: PebContextApi,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private cdr: ChangeDetectorRef,
  ) {
    this.isSubscription = this.data.productsIntegration.tag === PebIntegrationTag.Subscription;

    this.sidebarHeaderTitle = this.isSubscription ? 'My plans' : 'Products';
    this.sidebarFilterWrapperTitle = this.isSubscription ? 'My plans' : 'My products';
    this.sidebarHeaderTitle = this.isSubscription ? 'All plans' : 'My products';

    this.allProductsAction.label = this.isSubscription ? 'All plans' : 'All products';
  }

  ngOnInit() {
    this.createHeader();
    this.cdr.detectChanges();
    merge(
      this.formGroup.get('collectionsTree').valueChanges.pipe(
        startWith(this.formGroup.get('collectionsTree').value),
        switchMap((collections) => {
          const filter = collections?.length ? [{
            field: 'collections',
            fieldCondition: PebFilterConditionType.In,
            value: collections.map(c => c.id),
          }] : [];
          this.productsSubject$.next([]);

          return this.fetchProducts({ filter });
        }),
        catchError(() => of([])),
        tap(products => this.productsSubject$.next(products)),
      ),
      this.collections$.pipe(
        skip(1),
        map((collections) => {
          const items = collections.map(collection => ({
            id: collection.id,
            name: collection.name,
            parentId: collection.parent,
            image: collection.image ? `${this.env?.custom?.storage}/products/${collection.image}` : '/assets/shapes/album.svg',
            data: collection,
            children: [],
          } as TreeFilterNode));
          this.collectionsTreeDataArraySubject.next(items);
          const groupedByItems = groupBy(items, item => item.parentId ?? '');
          Object.values(groupedByItems).forEach((groupedItems: any) => {
            groupedItems.forEach((item) => {
              item.children = groupedByItems[item.id] ?? [];
            });
          });

          return groupedByItems[''];
        }),
        tap(collectionsTree => this.collectionsTreeDataSubject.next(collectionsTree)),
      ),
      this.collections$.pipe(
        skip(1),
        map(collections => collections.map(collection => ({
          id: collection.id,
          title: collection.name,
          data: collection,
          image: collection.image ? `${this.env?.custom?.storage}/products/${collection.image}` : null,
          actions: [this.openCollectionAction],
        } as PeDataGridItem))),
        tap(collectionsItems => this.collectionsGridItemsSubject.next(collectionsItems)),
      ),
      this.products$.pipe(
        map((products) => {
          return products.map(product => {
            const item = {
              id: product.id,
              title: product.title,
              image: product.imagesUrl?.length ? product.imagesUrl[0] : '',
              data: product,
              selected: this.selected.includes(product.id),
              actions: [this.singleSelectedAction],
            }

            if (this.isSubscription) {
              return {
                ...item,
                title: (product as any).name,
                image: drawText(AppType.Subscriptions, this.canvas, (product as any).name),
              }
            }

            return {
              ...item,
              subtitle: `${product.currency} ${product.price}`,
              description: 'In Stock',
            }
          });
        }),
        tap(productsItems => this.dataGridItemsSubject$.next(productsItems)),
      ),
    ).pipe(
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  ngOnDestroy(): void {
    if (this.headerConfig) {
      this.platformHeader.setConfig(this.headerConfig);
    }
    this.destroyed$.next(true);
    this.destroyed$.complete();
  }

  fetchProducts({
                  filter = [],
                  order = [],
                  pagination = {},
  }: {
    filter?: PebFilterParams,
    order?: PebOrderParams,
    pagination?: PebPaginationParams,
  } = {}): Observable<PebProduct[]> {
    const paginationParams = { offset: this.dataGridItemsSubject$.getValue().length, limit: 100, ...pagination };

    return this.contextApi.fetchIntegrationAction({
      filter,
      order,
      pagination: paginationParams,
      integration: this.data.productsIntegration,
      action: this.data.productsIntegrationAction,
    }).pipe(
      map(data => data?.result ?? data),
    );
  }

  fetchCollections(): Observable<any> {
    return this.contextApi.fetchIntegrationAction({
      filter: [],
      order: [],
      pagination: {},
      integration: this.data.productsIntegration,
      action: this.data.productsCollectionIntegrationAction,
    }).pipe(
      map(data => data.result),
    );
  }

  resetCollectionsTree(): void {
    this.formGroup.get('collectionsTree').setValue([]);
  }

  onSelectedItemsChanged(items: string[]) {
    this.selected = items;
  }

  private createHeader(): void {
    this.headerConfig = this.platformHeader.config;
    this.platformHeader.setConfig({
      mainDashboardUrl: null,
      currentMicroBaseUrl: null,
      isShowShortHeader: true,
      mainItem: null,
      isShowMainItem: false,
      closeItem: {
        title: 'Close',
        onClick: () => this.dialogRef.close(null),
      },
      isShowCloseItem: true,
      businessItem: null,
      isShowBusinessItem: false,
      isShowBusinessItemText: false,
    });
  }

  onSearchChanged(value: PeSearchItem) {}

  onClose(save: boolean) {
    this.dialogRef.close(save ? this.selected : null);
  }

  all(): void {
    this.dialogRef.close([]);
  }
}
