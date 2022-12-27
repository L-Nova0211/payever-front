import { ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { Select, Store } from '@ngxs/store';
import { BehaviorSubject, forkJoin, merge, Observable, of } from 'rxjs';
import { catchError, filter, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvService,
  MessageBus,
  PeDataGridPaginator,
  PeDataGridSortByActionIcon,
  PeDestroyService,
} from '@pe/common';
import { FolderItem, RootFolderItem } from '@pe/folders';
import {
  GridQueryParams,
  GridSkeletonColumnType,
  PeDataToolbarOptionIcon,
  PeFilterConditions,
  PeFilterType,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridQueryParamsService,
  PeGridService, PeGridSidenavService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView, PeGridViewportContextSelect,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { MediaService } from '@pe/media';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderService } from '@pe/platform-header';

import { OptionsMenu, ContextMenu } from '../../enums/grid-enums';
import { PackageTypeEnum } from '../../enums/PackageTypeEnum';
import { BaseComponent } from '../../misc/base.component';
import { filterDataGrid, sortItems } from '../../shared';
import { ClearStore, OpenPackageFolder } from '../../store/shipping.action';
import { ShippingAppState } from '../../store/shipping.state';
import { ConfirmDialogService } from '../shipping-profiles/browse-products/dialogs/dialog-data.service';
import { ProductsApiService } from '../shipping-profiles/browse-products/services/api.service';

import { PebNewPackageComponent } from './new-package-modal/new-package.component';
import { PebShippingPackagesService } from './shipping-packages.service';

const SIDENAV_NAME = 'app-shipping-packages-sidenav';
@Component({
  selector: 'peb-shipping-packages',
  templateUrl: './shipping-packages.component.html',
  styleUrls: ['./shipping-packages.component.scss'],
})
export class PebShippingPackagesComponent extends BaseComponent implements OnInit, OnDestroy {
  @ViewChild('canvas', { static: false }) canvas: ElementRef;
  @Select(ShippingAppState.packageGridItems) gridItems$: Observable<PeGridItem[]>;

  onSaveSubject$ = new BehaviorSubject<any>(null);
  readonly onSave$ = this.onSaveSubject$.asObservable();
  fileName = 'package-icon.png';
  dialogRef: PeOverlayRef;
  isMobile = false;
  isAllSelectable = false;
  items: PeGridItem[] = [];
  originItems: any;
  copiedItem = null;
  mobileTitle$ = new BehaviorSubject<string>('');

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('shipping-app.grid_fields.name'),
      cellComponent: PeGridTableTitleCellComponent,
      skeletonColumnType: GridSkeletonColumnType.ThumbnailWithName,
    },
    {
      name: 'condition',
      title: this.translateService.translate('shipping-app.grid_fields.condition'),
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
      skeletonColumnType: GridSkeletonColumnType.Rectangle,
    },
  ];

  rootFolderData: RootFolderItem = {
    _id: 'Envelope',
    name: this.translateService.translate('shipping-app.packages_nav.envelopes'),
    image: this.mediaService.getMediaUrl(this.fileName, 'cdn/images'),
  }

  viewportContextMenu: PeGridMenu = {
    title: this.translateService.translate('shipping-app.grid.options'),
    items: [{
      label: this.translateService.translate('shipping-app.grid.paste'),
      value: ContextMenu.Paste,
      disabled: true,
    }],
  }

  itemContextMenu: PeGridMenu = {
    title: this.translateService.translate('shipping-app.grid.options'),
    items: [
      {
        label: this.translateService.translate('shipping-app.grid.copy'),
        value: ContextMenu.Copy,
      },
      {
        label: this.translateService.translate('shipping-app.grid.paste'),
        value: ContextMenu.Paste,
        disabled: true,
      },
      {
        label: this.translateService.translate('shipping-app.grid.delete'),
        value: ContextMenu.Delete,
      }],
  }

  viewportContextMenu$ = new BehaviorSubject<PeGridMenu>(this.viewportContextMenu);
  itemContextMenu$ = new BehaviorSubject<PeGridMenu>(this.itemContextMenu);

  order = 'desc';

  gridLayout$ = new BehaviorSubject<string>(PeGridView.List);

  viewportTitle = this.translateService.translate('shipping-app.main_nav.packages');

  folders: FolderItem[] = [
    {
      _id: 'Box',
      name: this.translateService.translate('shipping-app.packages_nav.boxes'),
      position: 1,
      isProtected: true,
      image: this.mediaService.getMediaUrl(this.fileName, 'cdn/images'),
    }, {
      _id: 'Soft package',
      name: this.translateService.translate('shipping-app.packages_nav.soft_packages'),
      position: 2,
      isProtected: true,
      image: this.mediaService.getMediaUrl(this.fileName, 'cdn/images'),
    },
  ];

  selectedFolder: FolderItem;

  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: 40,
    total: 10,
  }

  toolbar = {
    filterConfig: [{
      fieldName: 'title',
      filterConditions: [
        PeFilterConditions.Contains,
        PeFilterConditions.DoesNotContain,
      ],
      label: this.translateService.translate('shipping-app.grid_fields.name'),
      type: PeFilterType.String,
    }],
    optionsMenu: {
      title: this.translateService.translate('shipping-app.grid.options'),
      items: [
        {
          label: this.translateService.translate('shipping-app.grid.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('shipping-app.grid.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('shipping-app.grid.duplicate'),
          value: OptionsMenu.Duplicate,
          defaultIcon: PeDataToolbarOptionIcon.Duplicate,
        },
        {
          label: this.translateService.translate('shipping-app.grid.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('shipping-app.sort_actions.title'),
      items: [
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.a_z'),
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
          active: true,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.z_a'),
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.newest'),
          value: 'desc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('grid.toolbar.sort_menu.oldest'),
          value: 'asc,createdAt',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },
  };

  totalItems$ = new BehaviorSubject<number>(0);
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  loaded = false;
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private envService: EnvService,
    private cdr: ChangeDetectorRef,
    private overlayService: PeOverlayWidgetService,
    private gridService: PeGridService,
    private store: Store,
    private messageBus: MessageBus,
    private sidenavService: PeGridSidenavService,
    private confirmDialog: ConfirmDialogService,
    private apiService: ProductsApiService,
    private destroyed$: PeDestroyService,
    public packageService: PebShippingPackagesService,
    protected translateService: TranslateService,
    protected mediaService: MediaService,
    protected apmService: ApmService,
    private headerService: PePlatformHeaderService,
    protected gridQueryParamsService: PeGridQueryParamsService,
  ) {
    super(translateService);

    this.gridItems$.pipe(
      tap((data: PeGridItem[]) => {
        this.items = data;

        if (this.isAllSelectable) {
          this.gridService.selectedItems = this.items;
        }

        const scrollTop = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.ScrollTop);
        if (scrollTop) {
          this.gridService.restoreScroll$.next(true);
        }
      }),
      takeUntil(this.destroyed$)
    ).subscribe();
  }

  sortChange(sort: string): void {
    this.order = sort;
    this.paginator.page = 0;
    this.openFolder();
  }

  onViewportContextMenu({ menuItem }: PeGridViewportContextSelect): void {
    switch (menuItem?.value) {
      case ContextMenu.Paste:
        this.paste(this.copiedItem);
        break;
    }
  }

  paste(item?: PeGridItem): void {
    if (this.copiedItem) {
      if (item) {
        this.onDuplicateItem([this.copiedItem.id]);
      }
    }
  }

  onDuplicateItem = (ids) => {
    const duplicateItem = ids.map(id => this.originItems.find(item => item.id === id));
    if (duplicateItem.length) {
      const requests = duplicateItem.map((item) => {
        const newPackage = {
          name: item.name,
          dimensionUnit: item.dimensionUnit,
          weightUnit: item.weightUnit,
          length: item.length,
          width: item.width,
          height: item.height,
          weight: item.weight,
          type: item.type,
          isDefault: item.isDefault,
        };

        return this.apiService.actionPackage(newPackage, this.envService.businessId);
      });

      forkJoin(requests).pipe(
        tap((_) => {
          this.openFolder();
          this.cdr.detectChanges();
        }),
        catchError((err) => {
          this.apmService.apm.captureError(
            `Cant duplicate item ERROR ms:\n ${JSON.stringify(err)}`
          );

          return of(true);
        }),
      ).subscribe();
    }
  }

  onSelectRootFolder(): void {
    if (this.selectedFolder?._id) {
      this.gridQueryParamsService.pageToParams(1);
      this.gridQueryParamsService.deleteQueryParamByName(GridQueryParams.SelectedFolder);
    }
    this.mobileTitle$.next(this.rootFolderData.name);
    this.selectedFolder = null;
    this.paginator.page = 0;

    this.openFolder();
  }

  openFolder(searchConfig = null) {
    this.isLoading$.next(true);
    this.packageService.getPackages(
      this.envService.businessId,
      this.selectedFolder?._id || PackageTypeEnum.Envelope,
    ).pipe(
      tap((res: any) => {
        this.originItems = res;
        if (this.order) {
          sortItems(this.order, this.originItems);
        }
        this.items = res.map(item => this.packageService.boxToItemMapper(item, this.canvas));
        if (searchConfig?.length) {
          this.items = filterDataGrid(searchConfig, this.items);
        }
        this.totalItems$.next(this.items.length);
        this.isLoading$.next(false);
        this.store.dispatch(new OpenPackageFolder(this.items));
        this.cdr.detectChanges();
      }),
      takeUntil(this.destroyed$)
    ).subscribe()
  }

  sortItems() {
    this.originItems.sort((a, b) => {
      const dateA = a?.createdAt;
      const dateB = b?.createdAt;
      if (dateA < dateB) {
        return this.order === 'desc' ? -1 : 1;
      }
      if (dateA > dateB) {
        return this.order === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  onSelectFolder(folder: FolderItem): void {
    this.selectedFolder = folder;
    this.paginator.page = 0;
    this.mobileTitle$.next(folder.name);

    setTimeout(() => {
      this.gridQueryParamsService.pageToParams(1);
      this.gridQueryParamsService.folderToParams(folder._id);
      this.gridQueryParamsService.scrollPositionToParams(0);
      this.openFolder();
    }, 10);
  }

  onContentDelete(ids): void {
    this.onDeleteItems(ids);
  }

  onSearchChanged(searchItems) {
    this.openFolder(searchItems);
  }

  ngOnInit() {
    const currentLayout = localStorage.getItem('shipping.package.grid.layout');
    if (currentLayout) {
      this.gridLayout$.next(currentLayout);
    }
    if (!this.sidenavService.toggleOpenStatus$.value) {
      this.sidenavService.toggleOpenStatus$.next(true);
    }

    merge(
      this.sidenavService.toggleOpenStatus$.pipe(
        tap((active: boolean) => {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
        })
      ),
      this.messageBus.listen('shipping-app.close.packages.sidebar').pipe(
        tap((res) => {
          this.sidenavService.toggleOpenStatus$.next(false);
        }),
        takeUntil(this.destroyed$)
      )
    ).pipe(
      takeUntil(this.destroyed$)
    ).subscribe();

    this.gridQueryParamsService.pageToParams(1);
    this.openFolder();

    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.sidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('shipping-app.packages_nav.my_packages'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.toggleSidebar();
        },
      },
    });
  }

  toggleSidebar() {
    this.sidenavService.toggleViewSidebar();
  }

  duplicateItems(): void {
    const itemIds = this.gridService.selectedItemsIds;
    if (itemIds.length) {
      this.onDuplicateItem(itemIds);
    }
  }

  optionsChange(event: string): void {
    this.isAllSelectable = false;
    switch (event) {
      case OptionsMenu.SelectAll:
        this.gridService.selectedItems = this.items;
        this.isAllSelectable = true;
        this.cdr.detectChanges();
        break;
      case OptionsMenu.Duplicate:
        this.duplicateItems();
        this.unselectAllItems();
        break;
      case OptionsMenu.DeselectAll:
        this.unselectAllItems();
        break;
      case OptionsMenu.Delete:
        this.onDeleteItems(this.gridService.selectedItemsIds);
        this.unselectAllItems();
        break;
    }
  }

  unselectAllItems() {
    this.gridService.selectedItems = [];
    this.cdr.detectChanges();
  }

  viewChange(layout): void {
    localStorage.setItem('shipping.package.grid.layout', layout)
    this.cdr.detectChanges();
  }

  scrollBottom() {
    this.paginator.page += 1;
    // TODO: add pagination
    // this.loadMore();
  }

  createByHand(itemToEdit = null) {
    const data = itemToEdit ? { data: itemToEdit } : { new: this.selectedFolder?._id || PackageTypeEnum.Envelope };
    const config: PeOverlayConfig = {
      data,
      headerConfig: {
        title: this.translateService
          .translate(`shipping-app.modal_header.title.${itemToEdit ? 'edit_package' : 'new_package'}`),
        backBtnTitle: this.translateService.translate('shipping-app.actions.cancel'),
        backBtnCallback: () => {
          this.showConfirmationWindow(this.getConfirmationContent('package', itemToEdit ? 'editing' : 'adding'));
        },
        doneBtnTitle: this.translateService.translate('shipping-app.actions.done'),
        doneBtnCallback: () => {
          this.onSaveSubject$.next(this.dialogRef);
        },
        onSaveSubject$: this.onSaveSubject$,
        onSave$: this.onSave$,
        theme: this.theme,
      },
      backdropClick: () => {
        this.showConfirmationWindow(this.getConfirmationContent('package', itemToEdit ? 'editing' : 'adding'));
      },
      component: PebNewPackageComponent,
    };
    this.dialogRef = this.overlayService.open(config);
    this.dialogRef.afterClosed
      .pipe(
        filter(data => !!data),
        take(1),
        tap((data) => {
          this.openFolder();
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$),
      ).subscribe();
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect): void {
    switch (menuItem?.value) {
      case ContextMenu.Edit:
        this.actionClick(gridItem);
        break;
      case ContextMenu.Copy:
        this.copy(gridItem);
        break;
      case ContextMenu.Paste:
        this.paste(gridItem);
        break;
      case ContextMenu.Duplicate:
        this.onDuplicateItem([gridItem.id]);
        break;
      case ContextMenu.Delete:
        this.onDeleteItems([gridItem.id]);
        break;
    }
  }

  copy(item: PeGridItem): void {
    this.copiedItem = item;
    this.itemContextMenu$.next(this.enableMenuItem(this.itemContextMenu, ContextMenu.Paste, true));
    this.viewportContextMenu$.next(this.enableMenuItem(this.viewportContextMenu, ContextMenu.Paste, true));
  }

  private enableMenuItem(menuItems: PeGridMenu, menuItemValue: ContextMenu, enable: boolean): PeGridMenu {
    const menu: PeGridMenu = {
      ...menuItems,
      items: menuItems.items.map((item) => {
        if (item.value === menuItemValue) {
          return {
            ...item,
            disabled: !enable,
          }
        }

        return item;
      }),
    };

    return menu;
  }

  showConfirmationWindow(dialogContent) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
      tap(() => {
        this.dialogRef.close();
      })
    ).subscribe();
  }

  onDeleteItems(ids) {
    this.showDeleteConfirmation(this.getDeleteConfirmationContent(), ids);
  }

  showDeleteConfirmation(dialogContent, ids) {
    this.confirmDialog.open({
      cancelButtonTitle: this.translateService.translate('shipping-app.actions.no'),
      confirmButtonTitle: this.translateService.translate('shipping-app.actions.yes'),
      ...dialogContent,
    });

    this.confirmDialog.onConfirmClick().pipe(
      take(1),
      switchMap(() => {
        if (ids) {
          return forkJoin(ids.map(id => this.apiService
            .deletePackage(id, this.envService.businessId)
            .pipe(
              tap((_) => {
                this.openFolder();
                this.gridService.selectedItems = [];
                this.cdr.detectChanges();
              }),
              catchError((err) => {
                this.apmService.apm.captureError(
                  `Cant delete package ERROR ms:\n ${JSON.stringify(err)}`
                );

                return of(true);
              }),
            )
          ))
        }

        return of(null);
      })
    ).subscribe();
  }

  actionClick(gridItem) {
    const itemToEdit = this.originItems.find(item => item.id === gridItem.id);
    this.createByHand(itemToEdit);
  }

  ngOnDestroy() {
    this.unselectAllItems();
    this.store.dispatch(new ClearStore());
    this.headerService.removeSidenav(SIDENAV_NAME);
  }
}
