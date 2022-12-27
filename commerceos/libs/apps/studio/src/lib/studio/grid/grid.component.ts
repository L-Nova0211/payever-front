import { HttpEvent, HttpEventType, HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef, Inject,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Select, Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, EMPTY, merge, Observable, of, OperatorFunction, pipe, Subject } from 'rxjs';
import { catchError, filter, map, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum, MessageBus,
  PE_ENV,
  PeDataGridItem,
  PeDataGridPaginator,
  PeDataGridSortByActionIcon,
  PeDestroyService,
  PePreloaderService,
  APP_TYPE,
  AppType,
} from '@pe/common';
import {
  FolderItem,
  FolderService, MoveIntoFolderEvent,
  PeMoveToFolderItem,
  RootFolderItem,
} from '@pe/folders';
import { PeFoldersContextMenuEnum } from '@pe/folders';
import {
  getPaginationResult,
  GridQueryParams,
  PeDataToolbarOptionIcon,
  PeFilterChange,
  PeFilterConditions,
  PeFilterType,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridMenu,
  PeGridMenuItem,
  PeGridQueryParamsService,
  PeGridService, PeGridSidenavService,
  PeGridTableActionCellComponent,
  PeGridTableDisplayedColumns,
  PeGridTableTitleCellComponent,
  PeGridView,
  PeGridViewportService,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import {
  Icons,
  MediaType,
  MediaViewEnum,
  PeStudioCategory,
  PeStudioMedia, SideNavMenuActions,
} from '../../core';
import {
  ContextMenu,
  DirectionsEnum,
  OptionsMenu,
} from '../../core';
import { DataGridItemsService } from '../../core/services/data-grid-items.service';
import { StudioApiService } from '../../core/services/studio-api.service';
import { StudioEnvService } from '../../core/services/studio-env.service';
import { UploadTextService } from '../../core/services/upload-text.service';
import { UploadMediaService } from '../../core/services/uploadMedia.service';
import { LoadAlbums } from '../../core/store/albums.actions';
import { StudioAppState } from '../../core/store/studio.app.state';
import { PeStudioUploadOptionsComponent } from '../upload-options/upload-options.component';

import { VIEW_MENU } from './menu-constants';

@Component({
  selector: 'pe-studio-grid',
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeStudioGridComponent implements OnInit {
  @SelectSnapshot(StudioAppState.popupMode) popupMode: boolean;
  @Select(StudioAppState.studioCategories) categories$: Observable<PeStudioCategory[]>;
  @ViewChild('fileSelector') fileSelector: ElementRef;
  public viewMenu: PeGridMenu = VIEW_MENU;
  defaultFolderIcon = `${this.env.custom.cdn}/icons-transactions/folder.svg`;

  rootFolderData: RootFolderItem = {
    _id: null,
    name: this.translateService.translate('studio-app.grid.all_media'),
    image: this.defaultFolderIcon,
  };

  lastGridView: PeGridView = null;
  gridLayout = PeGridView.BigListCover;
  selectedFolder: FolderItem;
  gridItems: PeGridItem[];
  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  isFoldersLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);
  paginator: PeDataGridPaginator = {
    page: 0,
    perPage: getPaginationResult(),
    total: 10,
  };

  sidenavMenu = {
    title: this.translateService.translate('studio-app.grid.media'),
    showCloseButton: false,
    items: [
      {
        label: this.translateService.translate('studio-app.grid.new_album'),
        value: SideNavMenuActions.NewAlbum,
      },
    ],
  };

  toolbar = {
    filterConfig: [
      {
        fieldName: 'name',
        filterConditions: [PeFilterConditions.Contains, PeFilterConditions.DoesNotContain],
        label: this.translateService.translate('studio-app.grid.filter_name'),
        type: PeFilterType.String,
      },
    ],
    optionsMenu: {
      title: this.translateService.translate('studio-app.grid.options_actions'),
      items: [
        {
          label: this.translateService.translate('studio-app.grid.options_select_all'),
          value: OptionsMenu.SelectAll,
          defaultIcon: PeDataToolbarOptionIcon.SelectAll,
        },
        {
          label: this.translateService.translate('studio-app.grid.options_deselect_all'),
          value: OptionsMenu.DeselectAll,
          defaultIcon: PeDataToolbarOptionIcon.DeselectAll,
        },
        {
          label: this.translateService.translate('studio-app.grid.options_delete'),
          value: OptionsMenu.Delete,
          defaultIcon: PeDataToolbarOptionIcon.Delete,
        },
      ],
    },
    sortMenu: {
      title: this.translateService.translate('studio-app.grid.sort_by'),
      activeValue: 'desc',
      items: [
        {
          label: this.translateService.translate('studio-app.grid.sort_oldest'),
          value: 'asc',
          defaultIcon: PeDataGridSortByActionIcon.Ascending,
        },
        {
          label: this.translateService.translate('studio-app.grid.sort_newest'),
          value: 'desc',
          defaultIcon: PeDataGridSortByActionIcon.Descending,
        },
      ],
    },
  };

  private itemContextMenu: PeGridMenu = {
    title: this.translateService.translate('studio-app.grid.options'),
    items: [
      {
        label: this.translateService.translate('studio-app.grid.options_get'),
        value: ContextMenu.Get,
      },
      {
        label: this.translateService.translate('studio-app.grid.options_edit'),
        value: ContextMenu.Edit,
      },
      {
        label: this.translateService.translate('studio-app.grid.options_delete'),
        value: ContextMenu.Delete,
      },
    ],
  };

  displayedColumns: PeGridTableDisplayedColumns[] = [
    {
      name: 'name',
      title: this.translateService.translate('studio-app.grid.filter_name'),
      cellComponent: PeGridTableTitleCellComponent,
    },
    {
      name: 'action',
      title: '',
      cellComponent: PeGridTableActionCellComponent,
    },
  ];

  filters: PeFilterChange[] = [];
  defaultOptions = {
    sort: {
      order: DirectionsEnum.Asc,
      param: 'updatedAt',
    },
  };

  options = { ...this.defaultOptions };

  MediaViewEnum = MediaViewEnum;
  mediaView: string = MediaViewEnum.allMedia;
  cancelUploadSubject$ = new Subject<void>();
  uploadingInProgress = false;
  uploadProgress = 0;
  albumId: string;
  currentThemeStyle: any;
  order: 'asc' | 'desc' = 'desc';
  showSidebarStream$ = new BehaviorSubject<boolean>(true);
  files: any;
  minutesLeft = 0;
  categories: PeStudioCategory[];
  mobileTitle$ = new BehaviorSubject<string>(this.rootFolderData.name);

  initialized = false;

  menuItemsFolders = [
    PeFoldersContextMenuEnum.Edit,
    PeFoldersContextMenuEnum.Delete,
    PeFoldersContextMenuEnum.AddFolder,
  ];

  constructor(
    private peGridSidenavService: PeGridSidenavService,
    private uploadMediaService: UploadMediaService,
    private uploadTextService: UploadTextService,
    private cdr: ChangeDetectorRef,
    private studioApiService: StudioApiService,
    public dialog: MatDialog,
    public dataGridItemsService: DataGridItemsService,
    private messageBus: MessageBus,
    private envService: StudioEnvService,
    private store: Store,
    private gridService: PeGridService,
    private destroyed$: PeDestroyService,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer,
    private peFolderService: FolderService,
    private apmService: ApmService,
    private translateService: TranslateService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peGridViewportService: PeGridViewportService,
    private pePlatformHeaderService: PePlatformHeaderService,
    @Inject(PE_ENV) private env,
    @Inject(APP_TYPE) private appType: AppType,
    private pePreloaderService: PePreloaderService,
  ) {
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);
    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.lastGridView;
    this.gridLayout = this.popupMode ? PeGridView.List : <PeGridView>view ?? PeGridView.BigListCover;

    for (let key in Icons) {
      this.matIconRegistry.addSvgIcon(
        key,
        this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-studio/${Icons[key]}`),
      );
    }

    this.matIconRegistry.addSvgIcon(
      'close',
      this.domSanitizer.bypassSecurityTrustResourceUrl(`${this.env.custom.cdn}/icons-filter/small-close-icon.svg`),
    );

    this.messageBus.listen('app.studio.sidebarToggle').pipe(
      tap(() => this.toggleSidebar()),
      takeUntil(this.destroyed$),
    ).subscribe();
  }

  set showSidebar(value: boolean) {
    this.showSidebarStream$.next(value);
  }

  ngOnInit() {
    if (this.popupMode) {
      this.viewMenu.items[1].value = PeGridView.List;
      this.viewMenu.items[1].minItemWidth = 230;
    } else {
      this.viewMenu.items[1].value = PeGridView.BigListCover;
      this.viewMenu.items[1].minItemWidth = 290;
    }
    this.setUpTheme();

    this.pePlatformHeaderService.assignConfig({
      mainItem: {
        title: this.translateService.translate('studio-app.grid.studio'),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.peGridSidenavService.toggleViewSidebar();
        },
      },
    } as PePlatformHeaderConfig);

    merge(
      this.peGridViewportService.deviceTypeChange$.pipe(
        tap(({ isMobile }) => {
          this.pePlatformHeaderService.assignConfig({
            isShowDataGridToggleComponent: !isMobile,
            isShowMainItem: isMobile,
            isShowSubheader: isMobile,
          } as PePlatformHeaderConfig);
        })
      ),
      this.peGridSidenavService.toggleOpenStatus$.pipe(
        tap((open: boolean) => {
          this.pePlatformHeaderService.assignConfig({
            isShowMainItem: this.peGridViewportService.isMobile && !open,
          } as PePlatformHeaderConfig);
        }),
      ),
      this.categories$.pipe(
        takeUntil(this.destroyed$),
        tap(categories => (this.categories = cloneDeep(categories))),
      ),
      this.studioApiService.getUserAlbums().pipe(
        takeUntil(this.destroyed$),
        switchMap((albums: any) => {
          this.store.dispatch(new LoadAlbums(albums));
          this.dataGridItemsService.userAlbums = albums;
          const folderIdStorage = localStorage.getItem('studio_app_folder');
          const selectedFolder = albums.find(album => album._id === folderIdStorage) as any;
          this.mobileTitle$.next(selectedFolder?.name ?? this.rootFolderData.name);
          this.albumId = selectedFolder?._id;
          this.dataGridItemsService.filtersStorage = [...albums];
          const sortAlbums = albums.map((album) => {
            if (album.parent) {
              const pFolder = albums.find(pF => pF._id === album.parent);
              if (!pFolder) {
                return album;
              }

              if (!pFolder.children) {
                pFolder.children = [];
              }
              pFolder.children.push(album);
            }

            this.isFoldersLoading$.next(false);

            return album;
          }).filter(folder => !folder.parent);

          this.dataGridItemsService.filters = this.sortFilters(
            [...sortAlbums.map(album => ({ ...album, menuItems: this.menuItemsFolders }))]
          );

          if (this.albumId) {
            selectedFolder.position = 1;
            this.selectedFolder = selectedFolder;

            return this.mediaByFolder(this.albumId);
          } else {
            return this.studioApiService
              .getOwnUserMedia(this.options)
              .pipe(tap((items: PeStudioMedia[]) => {
                this.dataGridItemsService.dataGridItemsFromStorage = items;
                this.dataGridItemsService.setDataGridItems(items, MediaViewEnum.ownMedia);
                this.isLoading$.next(false);
              }));
          }
        }),
      ).pipe(
        tap((items) => {
          this.paginator.total = items.length;
          this.initialized = true;
        }),
      ),
      this.dataGridItemsService.dataGridItems$.pipe(
        tap((items: PeDataGridItem[]) => {
          this.paginator.total = items.length;
        }),
        takeUntil(this.destroyed$),
      ),
    ).subscribe();
    this.dataGridItemsService.selectedIds = [];
  }

  toggleSidebar(): void {
    this.peGridSidenavService.toggleViewSidebar();
  }

  setUpTheme() {
    this.currentThemeStyle = this.envService.businessData?.themeSettings?.theme
      ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
      : AppThemeEnum.default;

    this.envService.theme = this.currentThemeStyle;
  }

  selectSideNavMenu(menuItem: PeGridMenuItem) {
    switch (menuItem.value) {
      case SideNavMenuActions.NewAlbum:
        this.peFolderService.createFolder(this.translateService.translate('studio-app.grid.album_name'));
        break;
    }
  }

  optionsChange(event: OptionsMenu) {
    switch (event) {
      case OptionsMenu.SelectAll:
        this.selectAll();
        break;
      case OptionsMenu.Delete:
        this.deleteSelectedItems();
        this.gridService.selectedItems = [];
        break;
      case OptionsMenu.DeselectAll:
      default:
        this.deselectAll();
        break;
    }
    this.cdr.detectChanges();
  }

  onItemContentContextMenu({ gridItem, menuItem }: PeGridItemContextSelect) {
    switch (menuItem?.value) {
      case ContextMenu.Edit:
        this.dataGridItemsService.editItem(gridItem).pipe(
          this.handleUploadProgress(),
        ).subscribe();
        break;
      case ContextMenu.Delete:
        if (!gridItem.data.isFolder) {
          this.dataGridItemsService.deleteMedia([gridItem]).pipe(
            take(1),
            tap(() => {
              this.deselectAll();
              this.cdr.markForCheck();
            }),
          ).subscribe();
        }
        break;
      case ContextMenu.Get:
        const url = gridItem.image.replace(/_preview$/, '');
        this.studioApiService.downloadMedia(url);
        break;
    }
  }

  selectAll() {
    this.dataGridItemsService.dataGridItems$
      .pipe(
        map((dataGridItems: PeDataGridItem[]) => {
          this.gridService.selectedItems = dataGridItems as PeGridItem[];

          return dataGridItems.map(item => item.id);
        }),
        switchMap((ids: string[]) => (this.dataGridItemsService.selectedIds = ids)),
        take(1),
      )
      .subscribe();
  }

  deselectAll() {
    this.dataGridItemsService.selectedIds = [];
    this.gridService.selectedItems = [];
  }

  private uploadText({ title, description }): void {
    this.uploadTextService.createText({ title, description }).pipe(
      this.handleUploadProgress(),

      filter(() => !!this.albumId),
      switchMap(media => this.uploadMediaService.addAlbumMedia([media._id], this.albumId)),
    ).subscribe();
  }

  uploadMedia(files: FileList) {
    this.files = files;
    this.uploadingInProgress = true;

    if (this.files) {
      for (const file of this.files) {
        const subscription = this.uploadMediaService.postMediaBlob(file)
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
            }),
          )
          .pipe(
            filter(e => e instanceof HttpResponse),
            switchMap((e) => {
              if (this.minutesLeft === 0) {
                this.uploadingInProgress = false;
              }

              return this.uploadMediaService.createUserMedia(e, file).pipe(
                switchMap((peStudioMedia: PeStudioMedia) => {
                  this.dataGridItemsService.addStudioMediaToList(peStudioMedia, this.albumId);
                  this.cdr.markForCheck();

                  this.fileSelector.nativeElement.value = '';

                  if (this.albumId) {
                    return this.uploadMediaService.addAlbumMedia([peStudioMedia._id], this.albumId);
                  } else {
                    return of(peStudioMedia);
                  }
                }),
                takeUntil(this.destroyed$),
              );
            }),
            catchError((error) => {
              this.uploadingInProgress = false;

              this.apmService.apm.captureError(
                `Uploading media in studio / ERROR ms:\n ${JSON.stringify(error)}`,
              );

              return EMPTY;
            }),
          ).subscribe();
      }
    }
  }

  cancelUpload(event: boolean) {
    if (event) {
      this.uploadingInProgress = false;
      this.cancelUploadSubject$.next();
    }
  }

  itemsToMove(item: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.gridService.selectedItems, item])];
  }

  moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    if (moveItems?.length) {
      const ids = moveItems.map((item) => {
        return item.id;
      });
      this.uploadMediaService.addAlbumMedia(ids, folder._id).pipe(
        take(1),
        switchMap(() => {
          return this.studioApiService.getAlbumMediaById(folder._id)
            .pipe(
              tap((items: PeStudioMedia[]) => {
                this.albumId = folder._id;
                this.selectedFolder = folder;
                const itemsAfterFilters = this.dataGridItemsService.filterStudioMediaItems(this.filters, items);
                this.dataGridItemsService.setDataGridItems(itemsAfterFilters, MediaViewEnum.ownMedia);
                this.cdr.markForCheck();
              }),
            );
        }),
      ).subscribe();
    }
  }

  onSelectRootFolder(): void {
    if (this.initialized) {
      this.albumId = null;
      localStorage.removeItem('studio_app_folder');
      this.mobileTitle$.next(this.rootFolderData.name);
      this.selectedFolder = null;
      this.implementSimpleMediaRequest().subscribe();
    }
  }

  selectFolder(folder: FolderItem): void {
    this.mobileTitle$.next(folder.name);
    this.albumId = folder._id;
    localStorage.setItem('studio_app_folder', this.albumId);
    this.selectedFolder = folder;

    this.mediaByFolder(folder._id).pipe(take(1)).subscribe();
  }

  mediaByFolder(folderId) {
    this.isLoading$.next(true);

    return this.studioApiService.getAlbumMediaById(folderId, this.options)
      .pipe(
        tap((items: PeStudioMedia[]) => {
          this.dataGridItemsService.dataGridItemsFromStorage = items;
          const itemsAfterFilters = this.dataGridItemsService.filterStudioMediaItems(this.filters, items);

          this.dataGridItemsService.setDataGridItems(itemsAfterFilters, MediaViewEnum.ownMedia);
          this.isLoading$.next(false);
        }),
      );
  }

  deleteSelectedItems() {
    const selectedItems = this.gridService.selectedItems;
    this.dataGridItemsService.deleteMedia(selectedItems).pipe(
      take(1),
      tap(() => this.deselectAll()),
    ).subscribe();
  }

  sortChange(sort: DirectionsEnum): void {
    this.options = {
      sort: {
        order: sort,
        param: 'updatedAt',
      },
    };

    this.implementFilters(this.filters);
  }

  filtersChange(filters: PeFilterChange[]) {
    this.filters = filters;
    this.implementFilters(filters);
  }

  implementFilters(filters: PeFilterChange[]) {
    if (filters) {
      const items = this.dataGridItemsService.dataGridItemsFromStorage;
      let itemsAfterFilters = this.dataGridItemsService.filterStudioMediaItems(filters, items);
      itemsAfterFilters = this.sortFilters(itemsAfterFilters, this.options);
      this.dataGridItemsService.setDataGridItems(itemsAfterFilters, MediaViewEnum.ownMedia);
    } else {
      this.implementSimpleMediaRequest().subscribe();
    }
  }

  implementSimpleMediaRequest() {
    return this.studioApiService.getOwnUserMedia(this.options)
      .pipe(
        take(1),
        tap((items: PeStudioMedia[]) => {
          this.dataGridItemsService.dataGridItemsFromStorage = items;
          this.dataGridItemsService.setDataGridItems(items, MediaViewEnum.ownMedia);
        }),
      );
  }

  viewChange(event: PeGridView): void {
    this.lastGridView = event;
  }

  createByHand() {
    const overlayRef = this.dialog.open(PeStudioUploadOptionsComponent);

    merge(
      overlayRef.backdropClick().pipe(
        tap(() => overlayRef.close()),
      ),
      overlayRef.afterClosed().pipe(
        filter(value => !!value),
        tap((value) => {
          if (value.files) {
            this.uploadMedia(value.files);
          } else if (value.title && value.description) {
            this.uploadText(value);
          }
        }),
      ),
    ).subscribe();
  }

  actionClick(item: PeGridItem) {
    if (item.data.mediaType === MediaType.Text) {
      this.dataGridItemsService.editItem(item).pipe(
        this.handleUploadProgress(),
      ).subscribe();
    } else {
      this.dataGridItemsService.openMediaPreview(item.id, item.data.mediaView);
    }
  }

  sortFilters(filters, options = this.defaultOptions) {
    return filters.sort((a, b) => {
      if (a[options.sort.param] === b[options.sort.param]) {
        return 0;
      }

      const conditions = options.sort.order === DirectionsEnum.Asc
        ? a[options.sort.param] < b[options.sort.param]
        : a[options.sort.param] > b[options.sort.param];

      return conditions ? -1 : 1;
    });
  }

  onCreateFolder(event) {
    this.dataGridItemsService.createFolder(event).pipe(
      take(1),
      tap(() => {
        this.cdr.markForCheck();
      }),
    ).subscribe();
  }

  onUpdateFolder(event) {
    this.dataGridItemsService.updateFolder(event).pipe(
      take(1),
      tap(() => {
        this.cdr.markForCheck();
      }),
    ).subscribe();
  }

  onDeleteFolder(event) {
    this.dataGridItemsService.deleteFolder(event).pipe(
      take(1),
      tap(() => {
        this.cdr.markForCheck();
      }),
    ).subscribe();
  }

  getItemContextMenu(item: PeGridItem): PeGridMenu {
    return item.data.mediaType === MediaType.Text
      ? {
        ...this.itemContextMenu,
        items: this.itemContextMenu.items.filter(item => [ContextMenu.Edit, ContextMenu.Delete].includes(item.value)),
      }
      : this.itemContextMenu;
  }

  private handleUploadProgress(): OperatorFunction<HttpEvent<PeStudioMedia>, PeStudioMedia> {
    return pipe(
      tap((event: HttpEvent<PeStudioMedia>) => {
        this.uploadingInProgress = true;
        if (event.type === HttpEventType.UploadProgress) {
          this.uploadProgress = Number(
            ((event.loaded * 99) / event.total).toFixed(0),
          );
          this.cdr.markForCheck();
        }
      }),
      catchError((err) => {
        this.uploadingInProgress = false;

        return EMPTY;
      }),
      filter(event => event instanceof HttpResponse),
      map((response: HttpResponse<PeStudioMedia>) => {
        this.uploadingInProgress = false;
        this.dataGridItemsService.addStudioMediaToList(response.body, this.albumId);
        this.cdr.markForCheck();

        return response.body;
      }),
      takeUntil(this.cancelUploadSubject$),
    );
  }
}
