
import { OverlayRef } from '@angular/cdk/overlay';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { FormBuilder } from '@angular/forms';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { Select, Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty  from 'lodash/isEmpty';
import {
  BehaviorSubject,
  EMPTY,
  forkJoin,
  merge,
  Observable,
} from 'rxjs';
import {
  catchError,
  debounceTime,
  delay,
  distinctUntilChanged,
  filter,
  map,
  skip,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import {
  AppThemeEnum,
  EnvironmentConfigInterface,
  EnvService,
  MenuSidebarFooterData,
  MessageBus,
  PeDataGridItem,
  PeDataGridLayoutType,
  PeDataGridListOptions,
  PeDataGridPaginator,
  PeDataGridSortByAction,
  PeDataGridSortByActionIcon,
  PeDestroyService,
  PE_ENV,
  TreeFilterNode,
} from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { PeDataGridService } from '@pe/data-grid';
import {
  FolderItem,
  FolderService,
  MoveIntoFolderEvent,
  PeMoveToFolderItem,
  RootFolderItem,
} from '@pe/folders';
import {
  GridQueryParams,
  PeDataToolbarOptionIcon,
  PeFilterChange,
  PeFilterConditions,
  PeFilterType,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridItemType, PeGridMenu,
  PeGridMenuDivider,
  PeGridMenuItem,
  PeGridQueryParamsService,
  PeGridSearchFiltersInterface,
  PeGridService,
  PeGridSidenavService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
  PeGridViewportContextSelect,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderService } from '@pe/platform-header';
import { TreeSidebarFilterComponent } from '@pe/sidebar';
import { SnackbarService } from '@pe/snackbar';

import { PeCreateInvoiceComponent } from '../../components/create-invoice/create-invoice.component';
import { EditFolderComponent } from '../../components/edit-folder/edit-folder.component';
import { InvoiceTreeDataInterface, VIEW_MENU } from '../../constants';
import { ContextMenu } from '../../enum/contextMenu';
import { ActualPeInvoiceApi } from '../../services/actual.invoice.api';
import { InvoiceApiService } from '../../services/api.service';
import { InvoiceEnvService } from '../../services/invoice-env.service';
import { InvoiceFoldersService } from '../../services/invoice-folder.service';

import { PebInvoiceGridService } from './invoice-grid.service';
import {
  AddFolder,
  AddItem,
  AddItems,
  DeleteItems,
  EditItem,
  FilterStore,
  InitLoadFolders,
  OpenFolder,
  OrderStore,
} from './store/folders.actions';
import { InvoicesAppState } from './store/invoices.state';


enum FileType {
  CSV,
  XML,
}

enum SideNavMenuActions {
  NewFolder = 'new_folder',
  NewHeadline = 'new_headline'
}

enum OptionsMenu {
  SelectAll = 'select-all',
  DeselectAll = 'deselect-all',
  Duplicate = 'duplicate',
  Delete = 'delete'
}



enum ThemesIcons {
  'alert-icon' = 'alert.svg',
  'image-placeholder' = 'image-placeholder.svg',
  'add-theme' = 'add-theme.svg',
  'add' = 'add.svg',
  'date' = 'date.svg',
  'folder-grid' = 'folder-grid.png',
  'shop' = 'shop.svg',
  'time' = 'time.svg',
  'delete' = 'delete.svg',
  'datetime-picker-icon' = 'datetime-picker-icon.svg',
}

const closeConfirmationQueryParam = 'closeDialog';
const SIDENAV_NAME = 'app-invoice-invoices-sidenav';

@Component({
  selector: 'pe-invoice-grid',
  templateUrl: './invoice-grid.component.html',
  styleUrls: ['./invoice-grid.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [InvoiceFoldersService, PeDestroyService],
})
export class PeInvoiceGridComponent implements OnInit, OnDestroy {
  theme = this.envService.businessData?.themeSettings?.theme
  ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
  : AppThemeEnum.default;

  @ViewChild('channelTree', { read: TreeSidebarFilterComponent }) channelTree: TreeSidebarFilterComponent;
  @ViewChild('collectionsTree', { read: TreeSidebarFilterComponent }) collectionsTree: TreeSidebarFilterComponent;
  FileType = FileType;
  public gridLayout = PeGridView.BigListCover;
  public readonly viewMenu: PeGridMenu = VIEW_MENU;
  overwrite = false;
  defaultLayout = PeDataGridLayoutType.Grid;
  searchItems = [];
  leftPaneButtons = [];
  selectedFolder: FolderItem;
  folders: FolderItem[] = null;
  filterConfiguration: PeGridSearchFiltersInterface;
  currencies = [];
  languages = [];
  saveInvoiceSubject$ = new BehaviorSubject(null);
  payeverDropshippingId: string;
  filters: any;
  private overlayRef: OverlayRef;
  selectedItem: PeDataGridItem;

  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;
  rootFolderData: RootFolderItem = {
    _id: null,
    name: 'All Invoices',
    image: this.defaultFolderIcon,
  }

  sidenavMenu = {
    title: 'Category',
    showCloseButton: false,
    items: [
      {
        label: 'New Folder',
        value: SideNavMenuActions.NewFolder,
      },
      {
        label: 'New Headline',
        value: SideNavMenuActions.NewHeadline,
      },
    ],
  }

  toolbar = {
    filterConfig: [{
      fieldName: 'name',
      filterConditions: [
        PeFilterConditions.Contains,
        PeFilterConditions.DoesNotContain,
      ],
      label: 'Name',
      type: PeFilterType.String,
    }],
    optionsMenu: {
      title: 'options',
      items: [
        {
          label: 'Select All',
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: 'Deselect All',
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: 'Duplicate',
          value: OptionsMenu.Duplicate,
          defaultIcon: PeDataToolbarOptionIcon.Duplicate,
        },
        {
          label: 'Delete',
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },

    sortMenu: {
      title: 'Sort by',
      activeValue: 'desc',
      items: [
        {
          label: 'Oldest',
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: 'Newest',
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },

  };

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: 'name',
      cellComponent: PeGridTableTitleCellComponent,
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
    },
  ];

  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: 40,
    total: 10,
  }

  order = '';
  viewportTitle = 'payever Invoices';
  _gridLayout = PeGridView.List;
  viewportContextMenu: PeGridMenu = {
    title: 'Options',
    items: [{
      label: 'Paste',
      value: ContextMenu.Paste,
    },
    {
      label: 'Add folder',
      value: ContextMenu.AddFolder,
      dividers: [PeGridMenuDivider.Top],
    }],
  }

  private itemContextMenu: PeGridMenu = {
    title: 'Options',
    items: [{
      label: 'Edit',
      value: ContextMenu.Edit,
    },
    {
      label: 'Copy',
      value: ContextMenu.Copy,
    },
    {
      label: 'Paste',
      value: ContextMenu.Paste,
    },
    {
      label: 'Download PDF',
      value: ContextMenu.Download,
      dividers: [PeGridMenuDivider.Top],
    },
    {
      label: 'Print',
      value: ContextMenu.Print,
    },
    {
      label: 'Send',
      value: ContextMenu.Send,
    },
    {
      label: 'Add folder',
      value: ContextMenu.AddFolder,
      dividers: [PeGridMenuDivider.Top, PeGridMenuDivider.Bottom],
    },
    {
      label: 'Delete',
      value: ContextMenu.Delete,
    }],
  }

  itemContextMenu$ = new BehaviorSubject<PeGridMenu>(this.itemContextMenu);
  viewportContextMenu$ = new BehaviorSubject<PeGridMenu>(this.viewportContextMenu);

  resetButton = {
    title: this.translateService.translate('builder-themes.actions.reset'),
    onClick: () => {
      this.resetSearchItems();
    },
  };

  viewMode: PeDataGridLayoutType;
  layoutTypes = PeDataGridLayoutType;
  itemHeight = 255;
  invoicesTreeData: TreeFilterNode<InvoiceTreeDataInterface>[] = [];
  updateItem = null;
  copiedItem = null;
  filterItems = [{
    label: this.translateService.translate('invoice-app.common.invoice.name'),
    value: 'title',
  }]

  initialFilterItem = this.filterItems[0];

  treeLabelInvoice: string = this.translateService.translate('invoice-app.common.invoice.my_invoices');
  saveSubject$ = new BehaviorSubject(null);
  viewModeSubj$: BehaviorSubject<PeDataGridLayoutType> = new BehaviorSubject<PeDataGridLayoutType>(null);
  viewMode$: Observable<PeDataGridLayoutType> = this.viewModeSubj$.asObservable();
  mobileTitle$ = new BehaviorSubject<string>('');

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  gridItems: PeGridItem[];
  gridOptions: any = {
    nameTitle: '',
    customFieldsTitles: [],
  };

  sidebarFooterData: MenuSidebarFooterData = {
    headItem: { title: 'Options' },
    menuItems: [
      { title: this.translateService.translate('invoice-app.common.invoice.add_new_folder'), onClick: () => {
        this.openOverlay({ type: 'add_new', activeItem: {}, theme: this.theme }, null);
      } },
    ],
  };

  public sortByActions: PeDataGridSortByAction[] = [
    {
      label: 'Asc',
      callback: () => {
        this.store.dispatch(new OrderStore('asc'));
        this.cdr.detectChanges();
      },
      icon: PeDataGridSortByActionIcon.Ascending,
    },
    {
      label: 'Desc',
      callback: () => {
        this.store.dispatch(new OrderStore('desc'));
        this.cdr.detectChanges();
      },
      icon: PeDataGridSortByActionIcon.Descending,
    },
  ];

  formGroup: any = this.formBuilder.group({
    tree: [[]],
    toggle: [false],
  });

  dataGridListOptions: PeDataGridListOptions = {
    nameTitle: 'Name',
    customFieldsTitles: ['Date', 'Due Date', 'Amount', 'Status'],
  };

  @ViewChild('treeSidebar') treeSidebar: TreeSidebarFilterComponent;
  @Select(InvoicesAppState.gridItems) gridItems$: Observable<PeGridItem[]>;
  @Select(InvoicesAppState.folders) invoiceFolders$: Observable<FolderItem[]>;

    onSelectedItemsChanged(items: string[]) {
    this.invoiceService.selectedItems = items;
  }

  delete(item: PeGridItem) {
    if (item.type == 'folder') {
      this.peFolderService.deleteFolder$.next(item.id);

      return;
    }

    this.onDelete([item.id]);
  }

  private onDelete(invoiceId: string[]): void {
    const headings: Headings = {
      title: 'Are you sure?',
      subtitle: 'Do you really want to delete this invoice?',
      confirmBtnText: 'Delete',
      declineBtnText: 'Cancel',
    }

    this.confirmScreenService.show(headings);
    this.messageBus.listen('confirm').pipe(
      take(1),
      tap((confirm) => {
        if (confirm) {
          this.actualPeInvoiceApi.deleteInvoice(invoiceId)
            .pipe(
              tap(() => {
                this.store.dispatch(new DeleteItems(invoiceId));
                this.pebInvoiceGridService.updatedGridItem$.next(true);
                this.invoiceApiService.openSnackbar('Invoice successfully deleted', true);
              }),
              catchError(() => {
                this.invoiceApiService.openSnackbar('Cannot delete invoice', false);

                return EMPTY;
              }),
              takeUntil(this.destroy$),
            )
            .subscribe();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    @Inject(EnvService) protected envService: InvoiceEnvService,
    public invoiceFoldersService:InvoiceFoldersService,
    private formBuilder: FormBuilder,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    public invoiceService: PebInvoiceGridService,
    private overlayWidget: PeOverlayWidgetService,
    private dialog: MatDialog,
    private readonly destroy$: PeDestroyService,
    public peDataGridService: PeDataGridService,
    public actualPeInvoiceApi : ActualPeInvoiceApi,
    private store: Store,
    private peFolderService: FolderService,
    private confirmScreenService: ConfirmScreenService,
    private gridService: PeGridService,
    private messageBus: MessageBus,
    private pebInvoiceGridService:PebInvoiceGridService,
    private invoiceApiService:InvoiceApiService,
    private translateService: TranslateService,
    private iconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private router: Router,
    private route: ActivatedRoute,
    private gridQueryParamsService: PeGridQueryParamsService,
    private cdr: ChangeDetectorRef,
    private snackbarService: SnackbarService,
    private sidenavService: PeGridSidenavService,
    private headerService: PePlatformHeaderService,
  )
  {
    const view = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.pebInvoiceGridService.lastGridView;
    this.pebInvoiceGridService.lastGridView = <PeGridView>view;
    this.gridLayout = <PeGridView>view ?? PeGridView.List;
    Object.entries(ThemesIcons).forEach(([name, path]) => {
      this.iconRegistry.addSvgIcon(
        name,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`assets/icons/${path}`),
      );
    });

    this.initInvoices();

    this.invoiceApiService.getFolders().subscribe((data) => {
      this.folders = cloneDeep(data);
      this.cdr.markForCheck();
      const selectedFolderId = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder);
      if (selectedFolderId) {
        const folder = this.folders.find(item => item._id === selectedFolderId)
        setTimeout(() => {
          this.selectedFolder = folder;
          this.openFolder(this.selectedFolder);
        })
      }
    })

    this.gridItems$.pipe(takeUntil(this.destroy$)).subscribe((data) => {
      this.gridItems = data || [] ;
      const scrollTop = this.gridQueryParamsService.getQueryParamByName(GridQueryParams.ScrollTop);
      if (scrollTop) {
        this.gridService.restoreScroll$.next(true);
      }
    });
  }

  ngOnInit(): void {
    this.gridQueryParamsService.pageToParams(1);
    this.cdr.detectChanges();

    this.pebInvoiceGridService.updatedGridItem$.pipe(
      tap((data) => {
        if (data) {
          setTimeout(() => {
            const itemData = this.pebInvoiceGridService.invoiceMapper(data.item);
            if (data.isEdit) {
              this.store.dispatch(new EditItem(itemData));
            } else {
              this.store.dispatch(new AddItem(itemData));
            }
          }, 1000)
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.pebInvoiceGridService.duplicatedGridItem$.pipe(
      tap((data) => {
        if (data) {
          setTimeout(() => {
            const itemData = this.pebInvoiceGridService.invoiceMapper(data);
            this.store.dispatch(new AddItem(itemData));
          }, 1000)
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();

    this.pebInvoiceGridService.filtersFormGroup.get('tree').valueChanges.pipe(
      tap(() => this.peDataGridService.setSelected$.next([])),
      takeUntil(this.destroy$),
    ).subscribe();

    this.pebInvoiceGridService.allFilters$
      .pipe(
        debounceTime(100),
        skip(1),
        switchMap((filters) => {
          if (!this.payeverDropshippingId || filters[0]?.value[0] !== this.payeverDropshippingId) {
            this.filters = filters;
            // this.productsListService.patchPagination({
            //   page: 1,
            // });

            return this.pebInvoiceGridService.loadInvoice();
          }

        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.pebInvoiceGridService.channelSetInvoice$
      .pipe(
        tap((invoices) => {
          this.pebInvoiceGridService.gridItems =
            invoices?.map(invoice => this.pebInvoiceGridService.createDataGridItem(invoice)) || [];
          this.pebInvoiceGridService.gridFolders = [];
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.pebInvoiceGridService.collections$.pipe(
      tap((collections) => {
        const gridFolders = collections
          .filter(collection => this.pebInvoiceGridService.selectedFolder ?
            collection?.parent === this.pebInvoiceGridService.selectedFolder : !collection.parent)
          .map(collection => this.pebInvoiceGridService.createDataGridFolder(collection));
        this.pebInvoiceGridService.gridFolders = gridFolders;
      }),
      takeUntil(this.destroy$),
    ).subscribe();

  merge(
      this.pebInvoiceGridService.searchString$.pipe(distinctUntilChanged()).pipe(skip(1)),
      this.pebInvoiceGridService.order$.pipe(
        skip(1),
        distinctUntilChanged(
          (order1, order2) => order1.by === order2.by && order1.direction === order2.direction),
      ),
    )
      .pipe(
        withLatestFrom(this.pebInvoiceGridService.allFilters$),
        switchMap(([_, filters]) => this.pebInvoiceGridService.loadInvoice()),
        tap(() => {
          if (this.pebInvoiceGridService.order.by === 'name') {
            this.pebInvoiceGridService.gridFolders
              .sort(({ title: titleA }, { title: titleB }) => {
                const isDesc = this.pebInvoiceGridService.order.direction === 'desc';

                // @ts-ignore
                return isDesc ? titleA.localCompare(titleB) : titleB.localCompare(titleA);
              });
          }
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.pebInvoiceGridService.pagination$
      .pipe(
        skip(2),
        map(pagination => pagination.page),
        distinctUntilChanged(),
      )
      .pipe(
        withLatestFrom(this.pebInvoiceGridService.allFilters$),
        switchMap(([page, filters]) => {
          return this.pebInvoiceGridService.loadInvoice();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.pebInvoiceGridService.expandTree$.pipe(takeUntil(this.destroy$), skip(1))
      .subscribe((data) => {
        if (data.expand) {
          this.expandNode(data.item._id || data.item.id);
        }
      });
      merge(
        this.sidenavService.toggleOpenStatus$.pipe(
          tap((active: boolean) => {
            this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
          })
        ),
        this.saveSubject$.pipe(
          tap((data) => {
            if (data?.appData.type === 'edit') {
              if (this.selectedFolder?._id == data.updatedItem?.parent) {
                const itemData = this.pebInvoiceGridService.folderToItemMapper(data.updatedItem);
                this.peFolderService.updateFolder$.next({
                  _id: data.updatedItem._id,
                  name: data.updatedItem.name,
                  image: itemData.image,
                });
                this.store.dispatch(new EditItem(itemData));
              }
              this.cdr.detectChanges();
            } else if (data?.appData.type === 'add_new') {
              const addFolder = (addItem = true) => {
                const itemData = this.pebInvoiceGridService.folderToItemMapper(data.updatedItem);
                this.peFolderService.addFolder$.next({
                  _id: data.updatedItem._id,
                  name: data.updatedItem.name,
                  image: itemData.image,
                });

                if (addItem) {
                  this.store.dispatch(new AddFolder(itemData));
                }
              }
              if (this.updateItem) {
                if (this.updateItem.id == data.updatedItem.parentFolderId) {
                  addFolder();
                }
              } else {
                addFolder(!this.selectedFolder);
              }
            }
            this.cdr.detectChanges();
          })
        ),
        this.saveInvoiceSubject$.pipe(
          tap((data) => {
            if (data?.updatedItem) {
              const itemData = this.pebInvoiceGridService.invoiceMapper(data.updatedItem);
              this.store.dispatch(new EditItem(itemData));
            }
          })
        )
      ).pipe(
        takeUntil(this.destroy$)
      ).subscribe();

      this.headerService.assignSidenavItem({
        name: SIDENAV_NAME,
        active: this.sidenavService.toggleOpenStatus$.value,
        item: {
          title: this.translateService.translate('invoice-app.invoices.title'),
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
    this.cdr.detectChanges();
  }

  actionClick(item): void {
    if (item.type === 'item') {
      this.actualPeInvoiceApi.getInvoiceById(item.id).subscribe((res) => {
        this.createEditInvoice(res);
      })
    }

    if (item.type === 'folder') {
      this.selectedFolder = {
        ...item,
        _id: item.id,
      };
      this.paginator.page = 0;
      this.openFolder(this.selectedFolder);
    }
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.gridService.selectedItems, item])];
  }

  openOverlay(data, node, isFolder=true) {
    this.updateItem = node;
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: EditFolderComponent,
      data: { ...data, item: node , nextPosition: this.peFolderService.nextPosition },
      backdropClass: 'settings-backdrop',
      panelClass: 'studio-widget-panel',
      headerConfig: {
        title: node?.name || node?.title || this.translateService.translate('invoice-app.common.invoice.new_folder'),
        backBtnTitle: this.translateService.translate('invoice-app.actions.cancel'),
        removeContentPadding: false,
        theme: this.theme,
        backBtnCallback: () => {
          this.close();
        },
        cancelBtnTitle: '',
        cancelBtnCallback: () => {
          this.close();
        },
        doneBtnTitle: this.translateService.translate('invoice-app.actions.done'),
        doneBtnCallback: () => {
          this.close();
        },
        onSaveSubject$:  isFolder ? this.saveSubject$ : this.saveInvoiceSubject$,
      },
      backdropClick: () => {
        this.close();
      },
    };
    this.overlayWidget.open(
      config,
    );
  }

  getActions(invoice) {
    return [{
      label: this.translateService.translate('invoice-app.actions.edit'),
      actionClass: 'action',
      callback: () => {
        this.invoiceService.callSubject.next(invoice.invoice);
      },
    }]
  }

  close() {

    const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
      panelClass: 'pages-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: this.translateService.translate('invoice-app.dialogs.window_exit.title'),
        subtitle: this.translateService.translate('invoice-app.dialogs.window_exit.label'),
        confirmButtonTitle: this.translateService.translate('invoice-app.dialogs.window_exit.confirm'),
        cancelButtonTitle: this.translateService.translate('invoice-app.dialogs.window_exit.decline'),
        theme: this.theme,
      },
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this.destroy$),
      filter(res => !!res),
      tap((res) => {
        this.overlayWidget.close();
      }),
    ).subscribe();
  }

  onCloseWindow() {
    const queryParams = {};
    queryParams[closeConfirmationQueryParam] = true;
    this.router.navigate([], { queryParams, relativeTo: this.route });
  }

  createEditInvoice(data: any = {}) {
    const header = isEmpty(data) ? 'Create Invoice' : 'Edit Invoice';
    data = { ...data }
    const config: PeOverlayConfig = {
      hasBackdrop: true,
      component: PeCreateInvoiceComponent,
      data,
      backdropClass: 'settings-backdrop',
      panelClass: 'create-invoice-panel',
      headerConfig: {
        title: header,
        backBtnTitle: 'Cancel',
        theme: this.theme,
        backBtnCallback: () => { this.close()},
        cancelBtnTitle: '',
        cancelBtnCallback: () => { this.close()},
        doneBtnTitle: 'Done',
        doneBtnCallback: () => {
         },
      },
      backdropClick: () => {
        this.close();
      },
    }

    this.overlayWidget.open(config);
  }

  resetSearchItems = () => {
    this.searchItems = [];
    this.leftPaneButtons = [];
    this.store.dispatch(new FilterStore([]));
  }



  selectSideNavMenu(menuItem: PeGridMenuItem) {
    switch (menuItem.value) {
      case SideNavMenuActions.NewFolder: {
        this.createFolder();
        break;
      }
      case SideNavMenuActions.NewHeadline: {
        this.createHeadline();
        break;
      }
    }
  }

  createFolder() {
    this.peFolderService.createFolder('Folder name');
  }

  onSelectRootFolder(): void {
    this.pebInvoiceGridService.selectedFolder = null;
    this.selectedFolder = null;
    this.paginator.page = 0;
    this.mobileTitle$.next(this.rootFolderData.name);
    this.openFolder(null);
  }

  onSelectFolder(folder: FolderItem): void {
    this.pebInvoiceGridService.selectedFolder = folder?._id;
    this.selectedFolder = folder;
    this.gridQueryParamsService.folderToParams(folder?._id);
    this.pebInvoiceGridService.activeNode = folder;
    this.paginator.page = 0;
    this.mobileTitle$.next(folder.name);
    this.openFolder(folder);
  }

  createHeadline() {
    this.peFolderService.createHeadline('Headline name');
  }

  onContentDelete({ invoiceId, folderIds }): void {
    this.deleteItems(invoiceId, folderIds);
  }

  ngOnDestroy() {
    this.headerService.removeSidenav(SIDENAV_NAME);
  }

  private deleteItems(themesIds: string[], folderIds: string[]): void {
    const headings: Headings = {
      title: this.translateService.translate('builder-themes.messages.approve_title'),
      subtitle: this.translateService.translate('builder-themes.messages.approve_subtitle'),
      confirmBtnText: this.translateService.translate('builder-themes.actions.delete'),
      declineBtnText: this.translateService.translate('builder-themes.actions.cancel'),
    }

    this.confirmScreenService.show(headings, false);
    this.messageBus.listen('confirm').pipe(
      take(1),
      tap((confirm) => {
        if (confirm) {
          const requests = [
            ...themesIds.map(ids => this.actualPeInvoiceApi.deleteInvoice(ids)),
            ...folderIds.map(id => this.invoiceApiService.deleteFolder(id)),
          ]
          forkJoin(requests)
            .pipe(
              tap(() => {
                this.store.dispatch(new DeleteItems([...themesIds, ...folderIds]));
                folderIds?.forEach((folderId) => {
                  this.peFolderService.deleteNode$.next(folderId)
                });
                this.invoiceApiService.openSnackbar(
                  this.translateService.translate('builder-themes.messages.items_deleted'),
                  true,
                  );
                this.gridService.removeSelected(themesIds);
              }),
              catchError(() => {
                this.invoiceApiService.openSnackbar(
                  this.translateService.translate('builder-themes.messages.items_not_deleted'),
                  false,
                );

                return EMPTY;
              }),
              takeUntil(this.destroy$),
            ).subscribe();
        }
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    console.log(event)
    if (moveItems?.length) {
      moveItems.forEach((item) => {
        if (item.type === PeGridItemType.Item) {
          if (!folder.isHeadline) {
            this.invoiceApiService.moveToFolder(folder._id, item.id).subscribe();
          }
        } else if (item.type === PeGridItemType.Folder) {
          this.peFolderService.folderIntoFolder$.next({
            intoId: folder._id,
            moveId: item.id,
          });
        }

        if (folder._id !== this.selectedFolder?._id && item.type === PeGridItemType.Folder) {
          this.store.dispatch(new DeleteItems([item.id]))
        }
      })
    }
  }

  public filtersChange(filters: PeFilterChange[]): void {
    this.filterConfiguration = this.gridService.filtersChange(filters);
    this.paginator.page = 0;
    this.openFolder(this.selectedFolder);
  }

  scrollBottom() {
    this.paginator.page += 1;
    this.loadMore();
  }

  loadMore() {
    if (Math.ceil(this.paginator.total / this.paginator.perPage) < this.paginator.page) {
      return;
    }

    this.reloadGrid();
  }


  reloadGrid() {
    this.isLoading$.next(true);
    const request = this.invoiceApiService.getFolderDocuments
    (this.pebInvoiceGridService.selectedFolder, this.getSearchData());
    request.subscribe({
      next: (invoice) => {
        let folderItems = invoice.collection.map(item => item.isFolder
          ? this.pebInvoiceGridService.folderToItemMapper(item)
          : this.pebInvoiceGridService.invoiceMapper(item)
        );
        this.setPaginator(invoice.pagination_data);

        if (this.paginator.page > 0) {
          this.store.dispatch(new AddItems(folderItems));
        }
        this.isLoading$.next(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading$.next(false);
      },
    })
  }

  openFolder(folder: FolderItem) {
    this.gridItems = [];
    this.isLoading$.next(true);
    const request = this.invoiceApiService.getFolderDocuments(folder?._id, this.getSearchData());

    request.subscribe({
      next: (invoices) => {
        let folderItems = invoices.collection.map(item => item.isFolder
          ? this.pebInvoiceGridService.folderToItemMapper(item)
          : this.pebInvoiceGridService.invoiceMapper(item)
        );
        this.gridItems = folderItems;

        this.setPaginator(invoices.pagination_data);
        this.store.dispatch(new OpenFolder(folderItems));
        this.isLoading$.next(false);
        this.cdr.detectChanges();
      },
      error: () => {
        this.isLoading$.next(false);
      },
    })
  }

  setPaginator(data: any) {
    this.paginator = {
      ...this.paginator,
      page: data.page - 1,
      total: data.total,
    }
  }

 createdFolder(val:any){
  this.invoiceFoldersService.onCreateFolder(val);
 }

 updatedFolder(val:any){
   this.invoiceFoldersService.onUpdateFolder(val);
 }

 deletedFolder(val:any){
   this.invoiceFoldersService.onDeleteFolder(val);
   this.overlayWidget.close();
 }

 createdHeadline(val:any){
   this.invoiceFoldersService.onCreateHeadline(val);
 }

 updatedHeadline(val:any){
  this.invoiceFoldersService.onUpdateHeadline(val);
}

deletedHeadline(val:any){
  this.invoiceFoldersService.onDeleteHeadline(val);
}

updatedPositions(val:any){
  this.invoiceFoldersService.onUpdatePositions(val);
}

  getSearchData() {
    const { page, perPage } = this.paginator;

    return {
      page: page + 1,
      perPage,
      direction: this.order,
      configuration: this.filterConfiguration,
    };
  }

  optionsChange(event: OptionsMenu) {
    if (event === OptionsMenu.SelectAll) {
      this.gridService.selectedItems = this.gridItems;
      this.cdr.detectChanges();
    } else if (event === OptionsMenu.DeselectAll) {
      this.gridService.selectedItems = [];
      this.cdr.detectChanges();
    }
    else if (event === OptionsMenu.Delete) {
      this.deleteItems(this.gridService.selectedItemsIds, this.gridService.selectedFoldersIds);
      this.unselectAllItems();
    }
    else if (event === OptionsMenu.Duplicate) {
      this.invoiceService.copiedInvoice = this.gridService.selectedItemsIds;
      this.duplicateItems();
      this.unselectAllItems();
      this.cdr.detectChanges();
    }
  }

  sortChange(sort: string): void {
    this.order = sort;
    this.paginator.page = 0;
    this.openFolder(this.selectedFolder);
  }

  public viewChange(view: PeGridView): void {
    this.pebInvoiceGridService.lastGridView = view;
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextMenu.Edit:
        this.edit(gridItem);
        break;
      case ContextMenu.Copy:
        this.copy(gridItem);
        break;
      case ContextMenu.Paste:
        this.paste(gridItem);
        break;
      case ContextMenu.Download:
        this.download(gridItem);
        break;
      case ContextMenu.Print:
        this.print(gridItem);
        break;
      case ContextMenu.Send:
        this.send(gridItem);
        break;
      case ContextMenu.Delete:
          this.delete(gridItem);
        break;
      case ContextMenu.AddFolder:
        this.addFolder(gridItem)
        break;
    }
  }

  edit(item) {
    if (item.data) {
      this.openOverlay({ type: 'edit', activeItem: this.selectedFolder, theme: this.theme }, item);
    } else {
      this.actualPeInvoiceApi.getInvoiceById(item.id).subscribe((res) => {
        this.createEditInvoice(res);

      })
    }
    this.closeContextMenu();
  }

  download(item: PeGridItem) {
    this.actualPeInvoiceApi.invoiceDownload(item.id).pipe(
      tap((data) => {
        window.open(data.pdfUrl, '_blank');
      }),
    ).subscribe();
  }

  print(item: PeGridItem) {
    var wnd = window.open('about:blank', '_blank');
    this.actualPeInvoiceApi.invoicePrint(item.id).pipe(
      map((val) => {
        wnd.document.write(val);
      }),
      delay(600),
      tap(() => {
        wnd.print();
        wnd.close();
      })
    ).subscribe()
  }

  send(item: PeGridItem) {
      const dialogRef = this.dialog.open(ConfirmActionDialogComponent, {
        panelClass: ['settings-dialog', this.theme],
        data: {
          title: 'Are you sure that you want to send this Invoice',
          cancelButtonTitle: 'Cancel',
          confirmButtonTitle: 'Send',
          theme: this.theme,
        },
        hasBackdrop: false,
      });
      dialogRef
        .afterClosed()
        .pipe(
          filter(data => !!data),
          tap(() => {
            this.snackbarService.toggle(true, {
              content: 'Sending',
              duration: 25000,
              iconColor: 'red',
              iconId: 'icon-alert-24',
              iconSize: 24,
              pending: true,
            });
          }),
          switchMap(() => {
            return this.actualPeInvoiceApi.deliverInvoice(item.id).pipe(
              tap({
                next: () => {
                  this.snackbarService.toggle(true, {
                    content: 'Email Sent',
                    duration: 2500,
                    iconColor: 'green',
                    iconId: 'icon-commerceos-success',
                    iconSize: 24,
                  });
                },
                error: () => {
                  this.snackbarService.toggle(true, {
                    content: 'Failed to send email',
                    duration: 2500,
                    iconColor: 'red',
                    iconId: 'icon-alert-24',
                    iconSize: 24,
                  });
                },
              })
            );
          }),
        )
        .subscribe();
  }

  closeContextMenu() {
    this.selectedItem = undefined;

    if (this.overlayRef) {
      this.overlayRef.dispose();
    }
  }

  duplicateItems() {
    this.pebInvoiceGridService.pasteItems(this.selectedFolder?._id, 'duplicate');
  }

  unselectAllItems() {
    this.gridService.selectedItems = [];
    this.cdr.detectChanges();
  }

  itemSorting(item): { collections: string[], invoice: any[] } {
    const collections = [];
    const invoice = [];

    if (this.pebInvoiceGridService.selectedInvoice.length > 0) {
      this.pebInvoiceGridService.selectedInvoice.forEach((id) => {
        const gridItem = this.pebInvoiceGridService.gridItems.find(i => i.id === id) ??
          this.pebInvoiceGridService.gridFolders.find(folder => folder.id === id);
        if (gridItem.data?.isFolder) {
          collections.push(gridItem.id);
        } else {
          invoice.push(gridItem.id);
        }
      });
    } else {
      if (item.data?.isFolder) {
        collections.push(item.id);
      } else {
        invoice.push(item.id);
      }
    }

    return { collections, invoice };
  }

  copy(item: PeGridItem) {
    this.copiedItem = item;
    this.itemContextMenu$.next(this.enableMenuItem(this.itemContextMenu, ContextMenu.Paste, true));
    this.viewportContextMenu$.next(this.enableMenuItem(this.viewportContextMenu, ContextMenu.Paste, true));

    this.pebInvoiceGridService.copiedCollections = [];
    this.pebInvoiceGridService.copiedInvoice = [];

    const { collections, invoice } = this.itemSorting(item);

    this.pebInvoiceGridService.copiedCollections = collections;
    this.pebInvoiceGridService.copiedInvoice = invoice;
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

  private onDuplicate(invoiceId: string[], folderId?: string): void {
    this.pebInvoiceGridService.pasteItems(folderId, 'duplicate');
  }

  duplicate(item: PeGridItem) {
    if (item.type == 'folder') {
      this.peFolderService.duplicateFolder$.next(item.id);
    } else {
      this.onDuplicate([item.id], this.selectedFolder?._id);
    }
  }

  paste(item?: PeGridItem) {
    if (this.copiedItem) {
      if (this.copiedItem.type == 'folder') {
        this.peFolderService.duplicateFolder$.next(this.copiedItem.id);
      } else {
        if (item) {
         this.onDuplicate([this.copiedItem.id], this.selectedFolder?._id);
        } else {
          const copyItem = cloneDeep(this.copiedItem);
          this.invoiceApiService.moveToFolder(this.selectedFolder?._id, this.copiedItem.id).subscribe({
            next: () => this.store.dispatch(new AddItem(copyItem)),
          });
        }
      }
    }

    this.copiedItem = null;
    this.itemContextMenu$.next(this.enableMenuItem(this.itemContextMenu, ContextMenu.Paste, false));
    this.viewportContextMenu$.next(this.enableMenuItem(this.viewportContextMenu, ContextMenu.Paste, false));
  }

  addFolder(node = null) {
    this.openOverlay({ type: 'add_new', activeItem: this.pebInvoiceGridService.activeNode, theme: this.theme }, node);
  }

  createByHand(){
    this.pebInvoiceGridService.selectedFolder = this.selectedFolder?._id || null;
    this.createEditInvoice();
  }

  onViewportContextMenu({ menuItem }: PeGridViewportContextSelect) {
    switch (menuItem?.value) {
      case ContextMenu.Paste:
        this.paste(this.copiedItem);
        break;
      case ContextMenu.AddFolder:
        this.createFolder();
        break;
    }
  }

  initInvoices(): void {
    forkJoin([
      this.invoiceApiService.getFolders(),
      this.invoiceApiService.defaultFolder(),
    ])
      .pipe(
        map(([tree, defaultFolder]) => {
          this.invoiceApiService.clearFolderList();

          return this.invoiceApiService.folderTreeMapper([defaultFolder, ...tree]);
        })
      ).subscribe({
        next: (folders: FolderItem[]) => {
          this.folders = folders;
          const group = this.defaultLayout === PeDataGridLayoutType.Grid;
          this.store.dispatch(new InitLoadFolders({ tree: folders }, group));
        },
      })
  }

  onLayoutChanged(layout: PeDataGridLayoutType) {
    if (this.viewMode !== layout) {
      this.pebInvoiceGridService.loadInvoice().pipe(take(1)).subscribe();
      this.pebInvoiceGridService.layout = layout;
    }
    this.viewMode = layout;
    this.viewModeSubj$.next(layout);
  }

  get headerName(): string {
    const folderId = this.pebInvoiceGridService.selectedFolder;
    const collection = this.pebInvoiceGridService.collections.find(c => c.id === folderId);

    return collection ? collection.name : this.translateService.translate('header.list');
  }

  onNodeClick(event: Array<TreeFilterNode<any>>) {
    if (event?.length) {
      if (event.length === 1 && !event[0]) {

        return;
      }
      if (this.channelTree) {
        this.channelTree.initialSelectedTree = null;
      }

      this.pebInvoiceGridService.selectedFolder = event[0].id;
      this.pebInvoiceGridService.filtersFormGroup.get('tree').setValue(event);
      this.pebInvoiceGridService.filtersFormGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    } else {
      if (this.channelTree) {
        this.channelTree.initialSelectedTree = null;
      }
      this.pebInvoiceGridService.selectedFolder = undefined;
      this.pebInvoiceGridService.filtersFormGroup.get('tree').setValue([]);
      this.pebInvoiceGridService.filtersFormGroup.updateValueAndValidity();
      this.cdr.detectChanges();
    }
  }

  private expandNode(id, toggle = true) {
    const collection = this.pebInvoiceGridService.collections.find(c => c.id === id);
    if (collection.parentId) {
      this.expandNode(collection.parentId, false);
    }
    const toggleButton = document.getElementById(`drop-list${collection.parentId || collection.id}`);
    if (toggle) {
      this.collectionsTree.allowToggle = false;
      this.collectionsTree.nodeToggle(collection);
      this.collectionsTree.allowToggle = true;
    } else {
      this.collectionsTree.expandNode(collection);
    }
    const expanded = toggleButton?.parentElement?.getAttribute('aria-expanded');
    if (expanded === 'false') {
      toggleButton?.getElementsByTagName('button')[0]?.click();
    }
    this.cdr.detectChanges();
  }
}
