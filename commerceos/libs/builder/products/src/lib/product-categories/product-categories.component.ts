import { ChangeDetectionStrategy, Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { BehaviorSubject, merge, Observable, of, ReplaySubject } from 'rxjs';
import { catchError, first, map, takeUntil, tap } from 'rxjs/operators';

import { PebContextApi } from '@pe/builder-context';
import { PebFilterParams, PebOrderParams, PebPaginationParams, PebProductCategory } from '@pe/builder-core';
import { PeDataGridItem, PeDataGridLayoutType, PeDataGridSingleSelectedAction, PeSearchItem } from '@pe/common';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

@Component({
  selector: 'peb-product-categories',
  templateUrl: './product-categories.component.html',
  styleUrls: ['./product-categories.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebProductCategoriesComponent implements OnInit, OnDestroy {

  readonly PeDataGridLayoutType = PeDataGridLayoutType;
  private headerConfig: PePlatformHeaderConfig;
  private destroyed$ = new ReplaySubject<boolean>();

  private readonly categoriesSubject$ = new BehaviorSubject<PebProductCategory[]>([]);
  readonly categories$ = this.categoriesSubject$.asObservable();

  dataGridItemsSubject$ = new BehaviorSubject<PeDataGridItem[]>([]);
  readonly dataGridItems$: Observable<PeDataGridItem[]> = this.dataGridItemsSubject$.asObservable();

  get dataGridItems(): PeDataGridItem[] {
    return this.dataGridItemsSubject$.getValue();
  }

  private readonly selectedSubject$ = new BehaviorSubject<string[]>(this.data.selectedCategories);
  selected$ = this.selectedSubject$.asObservable();

  set selected(ids: string[]) {
    this.dataGridItems.forEach((item) => {
      item.selected = ids.includes(item.id);
    });
    this.selectedSubject$.next(ids);
  }

  get selected(): string[] {
    return this.selectedSubject$.value;
  }

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

  singleSelectedAction: PeDataGridSingleSelectedAction = {
    label: 'Select',
    callback: (data: string) => {
      this.dialogRef.close([data]);
    },
  };

  readonly allCategoriesAction: PeDataGridSingleSelectedAction = {
    label: 'All categories',
    callback: () => this.all(),
  };

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<PebProductCategoriesComponent>,
    private platformHeader: PePlatformHeaderService,
    private contextApi: PebContextApi,
  ) { }

  ngOnInit(): void {
    this.createHeader();
    merge(
      this.fetchCategories().pipe(
        first(),
        catchError(() => of([])),
        tap(categories => this.categoriesSubject$.next(categories)),
      ),
      this.categories$.pipe(
        map((categories) => {
          return categories.map(category => ({
            id: category.id,
            title: category.name,
            // image: cate.imagesUrl?.length ? product.imagesUrl[0] : '',
            // subtitle: `${product.currency} ${product.price}`,
            // description: 'In Stock',
            data: category,
            selected: this.selected.includes(category.id),
            actions: [this.singleSelectedAction],
          }));
        }),
        tap((categoriesItems) => {
          this.dataGridItemsSubject$.next(categoriesItems);
        }),
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

  private fetchCategories({
    filter = [], order = [], pagination = {},
  }: {
    filter?: PebFilterParams, order?: PebOrderParams, pagination?: PebPaginationParams,
  } = {}): Observable<PebProductCategory[]> {
    return this.contextApi.fetchIntegrationAction({
      filter,
      order,
      pagination: {
        offset: this.dataGridItemsSubject$.getValue().length,
        limit: 100,
        ...pagination,
      },
      integration: this.data.integration,
      action: this.data.action,
    }).pipe(
      map(data => data.result),
    );
  }

  onSearchChanged(value: PeSearchItem) {}

  onSelectedItemsChanged(items: string[]): void {
    this.selected = items;
  }

  onClose(save: boolean): void {
    this.dialogRef.close(save ? this.selected : null);
  }

  all(): void {
    this.dialogRef.close([]);
  }
}
