import { OverlayRef } from '@angular/cdk/overlay';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, HostBinding,
  HostListener, Inject,
  OnInit,
  ViewChild, ViewEncapsulation,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { BehaviorSubject, EMPTY, Subject, merge, of } from 'rxjs';
import { take, takeUntil, tap, switchMap, filter, catchError, delay } from 'rxjs/operators';

import {
  AppThemeEnum,
  PE_ENV,
  PeDataGridFilterItem,
  PeDataGridFilterItems,
  PeDataGridPaginator,
  PeDataGridSortByActionIcon, PeDestroyService,
} from '@pe/common';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { FolderItem, PeMoveToFolderItem, RootFolderItem } from '@pe/folders';
import {
  getPaginationResult,
  PeDataToolbarOptionIcon, PeFilterChange,
  PeFilterConditions,
  PeFilterType, PeGridItem, PeGridItemContextSelect,
  PeGridService, PeGridSidenavService, PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns, PeGridTableTextInfoCellComponent, PeGridTableTitleCellComponent, PeGridView,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { WallpaperService } from '@pe/wallpaper';

import { folderQueryParam, positionQueryParam } from '../../components/employees/constants';
import {
  ContextMenu,
  DirectionsEnum,
  OptionsMenu,
  SizesEnum,
  WallpaperCategory,
  WallpaperViewEnum,
  WalpaperType,
} from '../../misc/enum';
import { WallpaperGridItemInterface } from '../../misc/interfaces';
import {
  BusinessEnvService,
  PebWallpapersService,
  PebWallpaperStorageService,
  WallpaperDataInterface,
  WallpaperGridItemConverterService,
} from '../../services';
import { PebWallpaperSidebarService } from '../../services/wallpaper-sidebar.service';

const SIDENAV_NAME = 'app-settings-wallpapers-sidenav';

@Component({
  selector: 'peb-wallpapers',
  templateUrl: './wallpapers.component.html',
  styleUrls: ['./wallpapers.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class WallpapersComponent implements OnInit {
  @HostBinding('class') wallpaper = 'pe-wallpaper-component'
  @ViewChild('fileSelector') fileSelector: ElementRef;

  private activeItem :WallpaperGridItemInterface = null;
  private showSidebarStream$ = new BehaviorSubject<boolean>(true);
  theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData?.themeSettings?.theme]
    : AppThemeEnum.default;

  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;

  rootFolderData: RootFolderItem = {
    name: this.translateService.translate('info_boxes.panels.wallpaper.tabs.my_wallpapers'),
    _id: WallpaperViewEnum.myWallpapers,
    image: this.defaultFolderIcon,
  };

  selectedFolder: FolderItem;
  mobileTitle$ = new BehaviorSubject<string>('');

  files: any;

  paginator: PeDataGridPaginator = {
    page: 1,
    perPage: getPaginationResult(),
    total: 10,
  };

  toolbar = {
    filterConfig: [
      {
        fieldName: 'title',
        filterConditions: [PeFilterConditions.Contains, PeFilterConditions.DoesNotContain],
        label: this.translateService.translate('info_boxes.panels.wallpaper.sort_by_action.name'),
        type: PeFilterType.String,
      },
    ],
    optionsMenu: {
      title: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.multiple_actions.choose'),
      items: [
        {
          label: this.translateService.translate('actions.select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('actions.deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.multiple_actions.delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('info_boxes.panels.wallpaper.sort_by_action.sort_by'),
      activeValue: 'desc',
      items: [
        {
          label: this.translateService.translate('info_boxes.panels.wallpaper.sort_by_action.oldest'),
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('info_boxes.panels.wallpaper.sort_by_action.newest'),
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },
  };

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('info_boxes.panels.wallpaper.sort_by_action.name'),
      cellComponent: PeGridTableTitleCellComponent,
    },
    {
      name: 'industry',
      title: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.industry'),
      cellComponent: PeGridTableTextInfoCellComponent,
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
    },
  ];

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  gridLayout = localStorage.getItem('settings_app_wallpaper_view') ?? PeGridView.List;

  items = [];
  items$ = new BehaviorSubject(this.items);

  initialized = false;

  originItems: any[];
  dataGridMyWallpapersItems: any[];
  myWallpapers: any[];
  myWallpapersItems: any[];
  myWallpaperObject: any;
  galleryWallpapers: any[];
  activeWallpaper: WallpaperDataInterface = null;
  sidebarCategories: any[] = [];
  searchItems = [];
  dataGridFilters: PeDataGridFilterItem[];
  searchString: string;
  cancelUploadSubject$ = new Subject<void>();
  uploadingInProgress = false;
  uploadingImage: any;
  isMobile = window.innerWidth <= 720;
  uploadProgress = 0;
  maxFileSize = SizesEnum.MAX_FILE_SIZE;
  allowAddWallpaper = false;
  currentNavParams: any;
  sorted = true;
  selectable = false;
  contextActions = [];
  contextRef: OverlayRef;
  contextMenuClickedItem: any;
  viewAdd = true;

  leftPaneButton: any;
  isFilterCreating: boolean;

  gridOptions = {
    nameTitle: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.name'),
    customFieldsTitles: [this.translateService.translate('info_boxes.panels.wallpaper.data_grid.industry')],
  };

  filterSettings: PeDataGridFilterItems[] = [
    {
      value: this.gridOptions.nameTitle,
      label: this.gridOptions.nameTitle,
    },
    {
      value: this.gridOptions.customFieldsTitles[0],
      label: this.gridOptions.customFieldsTitles[0],
    },
  ];

  private contextMenu = {
    title: this.translateService.translate('info_boxes.panels.wallpaper.context_menu.title'),
    items:[],
  };

  private contextMenuItems = [
    {
      label: this.translateService.translate('info_boxes.panels.wallpaper.single_selected_action.set'),
      value: ContextMenu.SetWallpaper,
    },
    {
      label: this.translateService.translate('info_boxes.panels.wallpaper.data_grid.multiple_actions.delete'),
      value: ContextMenu.Delete,
    },
  ]

  @HostListener('window:resize', ['$event'])
  onResize() {
    this.isMobile = window.innerWidth <= 720;
  }

  constructor(
    private wallpaperService: PebWallpapersService,
    private peWallpaper: WallpaperService,
    private converterService: WallpaperGridItemConverterService,
    private cdr: ChangeDetectorRef,
    private sidebarService: PebWallpaperSidebarService,
    private translateService: TranslateService,
    private envService: BusinessEnvService,
    private wallpaperStorage: PebWallpaperStorageService,
    private gridService: PeGridService,
    private snackBarService: SnackbarService,
    private matDialog: MatDialog,
    private router: Router,
    private snackbarService: SnackbarService,
    private apmService: ApmService,
    private headerService: PePlatformHeaderService,
    private peGridSidenavService: PeGridSidenavService,
    protected destroyed$: PeDestroyService,
    @Inject(PE_ENV) private env,
  ) {
  }

  ngOnInit(): void {
    this.loadWallpaper();

    merge(
      this.peGridSidenavService.toggleOpenStatus$.pipe(
        tap((active: boolean) => {
          this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
        })
      ),
      this.converterService.activeItem$.pipe(
        tap((res) => {this.activeItem = res as any}),
      ),
      this.items$.pipe(
        tap((items) => {
          this.paginator.total = items.length;
        }),
      )
    ).pipe(takeUntil(this.destroyed$)).subscribe();

    this.addSidenavItem();
  }

  loadWallpaper() {
    this.wallpaperService.loadWallpapersTree().pipe(
      take(1),
      switchMap((tree) => {
        this.setSidebarFilters(tree);

        return this.wallpaperService.loadWallpapers(this.paginator.page, this.paginator.perPage).pipe(
          tap(([galleryWallpapers, ownWallpaper]) => {
            this.myWallpaperObject = ownWallpaper;
            if (this.myWallpaperObject?.myWallpapers) {
              this.myWallpapers = this.myWallpaperObject.myWallpapers || [];
              this.myWallpaperObject.myWallpapers.forEach((wallpaper) => {
                wallpaper.industry = this.translateService.translate('assets.industry.OWN');
              });
            } else {
              this.myWallpapers = [];
            }

            const cw = this.myWallpaperObject;
            this.activeWallpaper = cw && cw.currentWallpaper
              ? cw.currentWallpaper : this.wallpaperStorage.defaultWallpaper;
            this.galleryWallpapers = galleryWallpapers;
            this.originItems = this.converterService.getFilteredWallpapers(galleryWallpapers, WalpaperType.Custom);
            this.myWallpapersItems = this.converterService.getDataGridItems(this.myWallpapers);

            const folderIdStorage = localStorage.getItem('settings_app_wallpaper_folder');
            this.selectedFolder = this.findCategory(this.sidebarCategories, folderIdStorage);
            this.viewAdd = !this.selectedFolder;

            const itemForDataGrid = {
              position: this.selectedFolder ? 1 : null,
              folder: this.selectedFolder?._id ?? this.rootFolderData?._id,
              _id: this.selectedFolder?._id ?? this.rootFolderData?._id,
            };
            this.setDataGridItems(itemForDataGrid);
            this.initialized = true;
            this.cdr.detectChanges();
          }),
        );
      }),
    ).subscribe();
  }

  findCategory(categories, folderIdStorage) {
    let category = categories.find(item => item._id === folderIdStorage);

    if (!category) {
      let i = 0;
      while (!category && categories[i]?.children?.length > 0) {
        category = this.findCategory(categories[i].children, folderIdStorage);
        i += 1;
      }
    }

    return category;
  }

  public getContextMenu(item:WallpaperGridItemInterface){
    let items: { label: string, value: ContextMenu }[];
    if (item.wallpaperType == WalpaperType.Standard){
      items = [...this.contextMenuItems].filter(item => item.value !== ContextMenu.Delete);
    } else {
      items = [...this.contextMenuItems];
    }

    return {
      title: this.contextMenu.title,
      items,
    };
  }

  private setSidebarFilters(treeData): void {
    const galleryTree = this.sidebarService.getTreeData(treeData);

    this.sidebarCategories = [galleryTree];
    this.cdr.markForCheck();
  }

  private showSnackbar(message, config = {}) {
    this.snackBarService.toggle(
      true,
      {
        content: message,
        duration: 5000,
        iconId: 'icon-commerceos-success',
        iconSize: 24,
        ...config,
      });
  }

  public uploadImage(event: Event) : void{
    const fileInput: HTMLInputElement = event.target as HTMLInputElement;
    const file: File = fileInput.files[0];

    if (!file.type.startsWith(`image/`)) {
      this.fileSelector.nativeElement.value = null;

      return;
    }

    if (!this.isFileSizeValid(file)) {
      this.fileSelector.nativeElement.value = null;

      return;
    }

    this.uploadProgress = 0;
    this.uploadingInProgress = true;

    this.files = [file];
    this.uploadingInProgress = true;

    const subscription = this.wallpaperService.postImageBlob(file)
      .pipe(
        tap((e) => {
          if (e.type === HttpEventType.UploadProgress) {
            this.uploadProgress = Number(
              ((e.loaded * 99) / e.total).toFixed(0),
            );
            this.cdr.markForCheck();
          }

          if (!this.uploadingInProgress) {
            subscription.unsubscribe();
          }
        }, (error) => {
          this.uploadingInProgress = false;
          this.fileSelector.nativeElement.value = null;
          this.cdr.markForCheck();
        }),
      )
      .pipe(
        filter(e => e instanceof HttpResponse),
        tap((blobCreateResponseHttpEvent:any) => {
          this.uploadProgress = 100;

          if (!blobCreateResponseHttpEvent.body?.blobName) {
            this.uploadingInProgress = false;
            this.uploadingImage = null;

            return;
          }

          const body = blobCreateResponseHttpEvent.body;
          const w = this.wallpaperService.onWallpaperUploaded(body.blobName, body.brightnessGradation);
          this.myWallpapers.unshift(w);
          this.myWallpapers.forEach((wallpaper) => {
            wallpaper.industry = WallpaperCategory.Own;
          });
          this.dataGridMyWallpapersItems = this.converterService.getDataGridItems(
            this.myWallpapers
          );
          this.selectable = true;
          this.uploadingInProgress = false;
          this.uploadingImage = null;
          this.fileSelector.nativeElement.value = '';
          this.items = this.dataGridMyWallpapersItems;
          this.items$.next(this.items);
          this.cdr.markForCheck();
        }) ,
        catchError((error) => {
          this.uploadingInProgress = false;
          this.fileSelector.nativeElement.value = null;
          this.apmService.apm.captureError(
            `Uploading media in wallpaper / ERROR ms:\n ${JSON.stringify(error)}`,
          );

          return EMPTY;
        }),
      ).subscribe();
  }

  cancelUpload(event: boolean) {
    if (event) {
      this.uploadingInProgress = false;
      this.cancelUploadSubject$.next();
    }
  }

  private isFileSizeValid(file: File): boolean {
    return file.size <= this.maxFileSize;
  }

  setDataGridItems(params) {
    const position = params[positionQueryParam];
    const folder = params[folderQueryParam];
    this.allowAddWallpaper = false;
    this.currentNavParams = {};
    this.selectable = false;
    if (position && folder !== WallpaperViewEnum.myWallpapers && folder !== WallpaperViewEnum.gallery) {
      this.currentNavParams[positionQueryParam] = position;
      this.currentNavParams[folderQueryParam] = folder;
      this.currentNavParams['id'] = params._id;
      this.wallpaperService.loadWallpaperByCode(
        this.currentNavParams.id,
        this.paginator.page,
        this.paginator.perPage
      ).pipe(
        tap((result: WallpaperDataInterface[]) => {
          this.items = this.converterService.getFilteredWallpapers(result, WalpaperType.Standard);
          this.items$.next(this.items);
          this.cdr.detectChanges();
        }),
        takeUntil(this.destroyed$)
      ).subscribe();
    } else {
      if (folder === WallpaperViewEnum.gallery) {
        this.allowAddWallpaper = true;
        this.items = this.converterService.getDataGridItems(this.galleryWallpapers, WalpaperType.Standard);
        this.items$.next(this.items);
      } else {
        this.selectable = true;
        this.items = this.converterService.getDataGridItems(this.myWallpapers);
        this.items$.next(this.items);
      }
    }
    this.cdr.detectChanges();
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.detectChanges();
  }

  scrollBottom() {
    let newItemsObservable = null;
    if (this.searchItems?.length > 0 && this.currentNavParams?.folder !== WallpaperViewEnum.myWallpapers) {
      this.paginator.page += 1;
      newItemsObservable = this.wallpaperService
        .searchWallpaper(this.searchItems, this.currentNavParams?.id, this.paginator.page, this.paginator.perPage);
    } else if (!this.currentNavParams?.folder && this.items?.length) {
      this.paginator.page += 1;
      newItemsObservable = this.wallpaperService.loadAllWallpapers(this.paginator.page, this.paginator.perPage);
    } else if (this.currentNavParams?.id && this.items?.length) {
      this.paginator.page += 1;
      newItemsObservable = this.wallpaperService
        .loadWallpaperByCode(this.currentNavParams?.id, this.paginator.page, this.paginator.perPage);
    }

    newItemsObservable?.pipe(
      tap((wallpapers: WallpaperDataInterface[]) => {
        this.setNewLoadItems(wallpapers);
      }),
    ).subscribe();
  }

  setNewLoadItems(items) {
    this.items = [
      ...this.items,
      ...this.converterService.getFilteredWallpapers(items, WalpaperType.Custom),
    ];
    this.items$.next(this.items);
    this.cdr.markForCheck();
  }

  onSelectRootFolder(): void {
    if (this.initialized) {
      this.selectable = true;
      this.viewAdd = true;
      this.cdr.detectChanges();

      localStorage.removeItem('settings_app_wallpaper_folder');
      this.items = this.converterService.getDataGridItems(this.myWallpapers, WalpaperType.Custom);
      this.items$.next(this.items);
    }
    this.mobileTitle$.next(this.rootFolderData.name);
  }

  selectFolder(folder): void {
    localStorage.setItem('settings_app_wallpaper_folder', folder._id);
    this.paginator.page = 1;
    this.viewAdd = false;
    this.mobileTitle$.next(folder.name);
    this.cdr.detectChanges();

    this.setDataGridItems(folder);
  }

  filtersChange(filters: PeFilterChange[]) {
    this.searchItems = filters;
    this.items = this.converterService.filterDataGrid(filters, [...this.originItems, ...this.myWallpapersItems]);
    this.items$.next([...this.items]);
  }

  optionsChange(event: OptionsMenu) {
    switch (event) {
      case OptionsMenu.SelectAll:
        this.gridService.selectedItems = this.items;
        break;
      case OptionsMenu.Delete:
        const selectedItems = this.gridService.selectedItems;
        const deleteObservables = selectedItems.map((item: WallpaperGridItemInterface) => {
          return this.wallpaperService.deleteWallpaper(item.wallpaper);
        });
        this.deleteSelectedItems(selectedItems, deleteObservables);
        break;
      case OptionsMenu.DeselectAll:
      default:
        this.gridService.selectedItems = [];
        break;
    }

    this.cdr.detectChanges();
  }

  deleteSelectedItems(selectedItems, deleteObservables: any[]) {
    const ids = selectedItems.map(item => item.id);

    const wordsMultiple = selectedItems.length === 1
      ? this.translateService.translate('dialogs.wallpaper_delete.single')
      : this.translateService.translate('dialogs.wallpaper_delete.multiple');

    const dialogRef = this.matDialog.open(ConfirmActionDialogComponent, {
      panelClass: 'wallpaper-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: this.translateService.translate('dialogs.wallpaper_delete.title'),
        subtitle: this.translateService.translate('dialogs.wallpaper_delete.label')
          .replace(/\{\{item\}\}/, wordsMultiple),
        cancelButtonTitle: this.translateService.translate('dialogs.wallpaper_delete.decline'),
        confirmButtonTitle: this.translateService.translate('dialogs.wallpaper_delete.confirm'),
        theme: this.theme,
      },
    });

    return dialogRef.afterClosed().pipe(
      switchMap((dismiss: boolean | undefined) => {
        if (dismiss === true) {

          return merge(...deleteObservables);
        } else {
          return EMPTY;
        }
      }),
    ).pipe(
      take(1),
      tap(() => {
        this.afterItemDeleted(ids);
      }),
      this.catchError('Delete selected items'),
    ).subscribe();
  }

  afterItemDeleted(ids) {
    this.items = this.items.filter(item => !ids.includes(item.id));
    this.myWallpapersItems = this.myWallpapersItems.filter(item => !ids.includes(item.id));
    this.myWallpapers = this.myWallpapers.filter(item => !ids.includes(item));
    this.items$.next(this.items);
    this.gridService.selectedItems = [];

    this.cdr.markForCheck();
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextMenu.Delete:
        if (gridItem?.data?.isFolder) {
        } else {
          const selectedItems = [gridItem];
          const deleteObservables = selectedItems.map((item: WallpaperGridItemInterface) => {
            return this.wallpaperService.deleteWallpaper(item.wallpaper);
          });
          this.deleteSelectedItems(selectedItems, deleteObservables);
        }
        break;
        case ContextMenu.SetWallpaper:
          this.setWallpaper(gridItem)
          break;
    }
  }

  sortChange(sort: DirectionsEnum): void {
    this.sorted = sort === DirectionsEnum.Asc;
    this.items = this.items.sort((a, b) => {
      const nameA = a.title.toUpperCase();
      const nameB = b.title.toUpperCase();
      if (nameA < nameB) {
        return this.sorted ? 1 : -1;
      }
      if (nameA > nameB) {
        return this.sorted ? -1 : 1;
      }

      return 0;
    });

    this.items$.next([...this.items]);
  }

  viewChange(event: PeGridView): void {
    localStorage.setItem('settings_app_wallpaper_view', event);
  }

  createByHand() {
    this.fileSelector.nativeElement.click();
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.gridService.selectedItems, item])];
  }

  setWallpaper(event) {
    event.isLoading$ = new BehaviorSubject(true);
    this.wallpaperService.setWallpaper(event.wallpaper).pipe(
      take(1),
      delay(2000),
      tap(() => {
        event.isLoading$.next(false);
        if (event?.image) {
          if(this.activeItem)
            {this.activeItem.badge = { label : '' } as any}

          this.peWallpaper.backgroundImage = event.image;
          event.badge.label = 'Set';
          this.activeItem = event;
        }
        this.showSnackbar(this.translateService.translate('info_boxes.panels.wallpaper.set_action_result.success'), {
          useShowButton: true,
          showButtonAction: () => {
            this.router.navigateByUrl(`/business/${this.envService.businessUuid}/info/overview`).then(() => {
              if (event?.image) {
                this.peWallpaper.backgroundImage = event.image;
              }
            });
          },
        });
      }),
    ).subscribe();
  }

  catchError(message) {
    return catchError((error) => {
      this.apmService.apm.captureError(`${message} ms: ${JSON.stringify(error)}`);

      this.isLoading$.next(false);
      const constraints = error.error.message && error.error.message[0] ? error.error.message[0].constraints : null;
      this.snackbarService.toggle(true, {
        content: constraints ? constraints[Object.keys(constraints)[0]] : error.error.error,
        duration: 2500,
      });

      return of(error);
    });
  }

  private addSidenavItem(): void {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('sidebar.sections.navigation.panels.wallpaper'),
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
}

