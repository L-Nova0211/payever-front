import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  Inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import omit from 'lodash/omit';
import { BehaviorSubject, concat, forkJoin, fromEvent, merge, of, Subject, timer } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  map,
  mapTo,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import {
  AppThemeEnum,
  AppType,
  APP_TYPE,
  EnvService,
  MessageBus,
  PeDataGridPaginator,
  PeDestroyService,
  PePreloaderService,
} from '@pe/common';
import { Headings } from '@pe/confirmation-screen';
import {
  FolderApply,
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
  FolderService,
  MoveIntoFolderEvent,
  PeFolderEditorActionDataInterface,
  PeFolderEditorComponent,
  PeFolderEditorDataToSaveInterface,
  PeFoldersActionsEnum,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeMoveToFolderItem,
} from '@pe/folders';
import {
  GridQueryParams,
  MIN_ITEM_WIDTH,
  PeFilterChange,
  PeFoldersActions,
  PeGridContextMenuActionsEnum,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridItemsActions,
  PeGridItemType,
  PeGridMenu,
  PeGridMenuItem,
  PeGridOptionsMenuActionsEnum,
  PeGridQueryParamsService,
  PeGridSearchDataInterface,
  PeGridSearchFiltersInterface,
  PeGridService,
  PeGridSideNavMenuActionsEnum,
  PeGridSidenavService,
  PeGridSortingDirectionEnum,
  PeGridSortingInterface,
  PeGridSortingOrderByEnum,
  PeGridState,
  PeGridStoreActions,
  PeGridView,
  PeGridViewportService,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';

import { PeCouponInterface, PeCouponTypeInterface } from '../../interfaces';
import {
  PeCouponsApiService,
  PeCouponsEnvService,
  PeCouponsGridService,
} from '../../services';
import { PeCouponEditorComponent } from '../coupon-editor';

import {
  FOLDERS_SIDENAV_MENU,
  ITEM_CONTEXT_MENU,
  TABLE_DISPLAYED_COLUMNS,
  TOOLBAR_CONFIG,
  VIEWPORT_CONTEXT_MENU,
  VIEW_MENU,
} from './menu-constants';

@Component({
  selector: 'pe-coupons-grid',
  templateUrl: './coupons-grid.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeCouponsGridComponent implements OnInit, OnDestroy {

  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  private copiedItem: PeGridItem;
  private filterConfiguration: PeGridSearchFiltersInterface;
  private isFoldersLoading$ = new BehaviorSubject<boolean>(true);
  private onSelectFolder$ = new Subject<FolderItem>();
  private saveFolder$ = new BehaviorSubject<any>(null);
  private saveCoupon$ = new BehaviorSubject<any>(null);
  private sortingOrder: PeGridSortingInterface = {
    direction: PeGridSortingDirectionEnum.Ascending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  };

  mobileTitle$ = new BehaviorSubject<string>('');

  public folderActions = PeFoldersActionsEnum;
  public foldersTree$ = new Subject<FolderItem[]>();
  public gridItems: PeGridItem[] = [];
  public gridLayout = PeGridView.BigListCover;
  public isLoading$ = new BehaviorSubject<boolean>(true);
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public rootTree: FolderItem[] = [];
  public showAddNewItem = true;
  public viewportTitle: string;

  public readonly foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly viewMenu = VIEW_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  public readonly toolbar$ = new BehaviorSubject<any>(TOOLBAR_CONFIG);
  public readonly rootFolder = this.peFolderService.rootFolder;

  public selectedFolder = this.rootFolder;

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  public readonly gridItems$ = this.store.select(PeGridState.gridItems())
    .pipe(
      skip(2),
      startWith([]),
      tap(gridItems => { this.gridItems = gridItems; }));

  private readonly initFoldersTree$ = this.peFoldersApiService.getFoldersTree()
    .pipe(
      switchMap((tree: FolderItem[]) => {
        this.foldersTree$.next(cloneDeep(tree));
        this.setRootTree(tree);
        const selectedFolderId = this.startFolderId;
        this.selectedFolder = this.peFolderService.getFolderFromTreeById(tree, selectedFolderId);
        this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, selectedFolderId));
        this.isFoldersLoading$.next(false);

        return this.store.select(PeGridState.folders());
      }),
      take(1),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
      }));

  private readonly foldersChangeListener$ = this.peFoldersActionsService.folderChange$
    .pipe(
      tap(({ folder, action }) => {
        this.restructureFoldersTree(folder, action);
        this.deselectAllItems();
      }));

  private readonly folderEditor$ = this.saveFolder$
    .pipe(
      skip(1),
      tap(({ actionType, updatedFolder }: PeFolderEditorDataToSaveInterface) => {
        const folder: FolderApply = {
          _id: updatedFolder._id,
          image: updatedFolder.image,
          name: updatedFolder.name,
          parentFolderId: updatedFolder.parentFolderId,
        };
        switch (actionType) {
          case PeFoldersActionsEnum.Create:
            this.peFolderService.addFolder$.next(folder);
            break;
          case PeFoldersActionsEnum.Update:
            this.peFolderService.updateFolder$.next(folder);
            break;
        }
        this.restructureFoldersTree(updatedFolder, actionType);
        this.cdr.detectChanges();
      }));

  private readonly selectFolderListener$ = this.onSelectFolder$
    .pipe(
      filter(Boolean),
      tap((folder: FolderItem) => {
        const isRootFolder = !folder?._id;
        this.selectedFolder = !isRootFolder ? folder : null;
        this.peFolderService.selectedFolder = folder;
        this.peFoldersActionsService.lastSelectedFolderId = folder?._id;
        this.peGridQueryParamsService.folderToParams(folder?._id);
        this.viewportTitle = isRootFolder ? this.rootFolder.name : folder.name;
        this.mobileTitle$.next(this.viewportTitle);
        this.paginator.page = 1;
        this.paginator.total = 0;
        this.store.dispatch(new PeGridItemsActions.OpenFolder([]));
        this.setGridItems(folder);
        this.deselectAllItems();
      }));

  private readonly couponEditor$ = this.saveCoupon$
    .pipe(
      skip(1),
      switchMap(coupon => {
        const isUpdate = coupon.createdAt !== coupon.updatedAt;
        const gridItem = this.peCouponsGridService.couponsToGridItemMapper([coupon], this.canvas)[0];
        const storeAction = isUpdate
          ? new PeGridItemsActions.EditItem(gridItem)
          : new PeGridItemsActions.AddItem(gridItem);
        const condition = isUpdate
          ? 'coupons-app.notify.successfuly_updated'
          : 'coupons-app.notify.successfuly_created';
        const notify = this.translateService
          .translate(condition)
          .replace('{couponCode}', coupon.code);
        
        return forkJoin([
          !isUpdate && this.selectedFolder?._id
            ? this.peFoldersApiService.moveToFolder(gridItem.id, this.selectedFolder._id)
            : of(null),
          of({ notify, storeAction }),
        ]);
      }),
      tap(([isNewInGrid, { notify, storeAction }]) => {
        this.store.dispatch(storeAction);
        this.paginator.total += isNewInGrid ? 1 : 0;
        this.peOverlayWidgetService.close();
        this.showSnackbar(notify);
      }),
      catchError((error) => {
        console.error(error);

        return of(true);
      }),
    );

  private readonly gridSidenavToggle$ = this.messageBus
    .listen('coupons-app.grid-sidenav.toggle')
    .pipe(
      tap(() => {
        this.peGridSidenavService.toggleViewSidebar();
      }));

  private readonly deviceTypeChange$ = this.peGridViewportService.deviceTypeChange$
    .pipe(
      tap(({ isMobile }) => {
        this.headerService.assignConfig({
          isShowDataGridToggleComponent: !isMobile,
          isShowMainItem: isMobile,
          isShowSubheader: isMobile,
        } as PePlatformHeaderConfig);
      })
    );

  private readonly toggleOpenStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((open: boolean) => {
        this.headerService.assignConfig({
          isShowMainItem: this.peGridViewportService.isMobile && !open,
        } as PePlatformHeaderConfig);
      }),
    );

  constructor(
    // Angular
    private cdr: ChangeDetectorRef,
    private route: ActivatedRoute,
    private store: Store,
    // Pe Services
    @Inject(APP_TYPE) private appType: AppType,
    private envService: EnvService,
    private messageBus: MessageBus,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFoldersApiService: PeFoldersApiService,
    private peFolderService: FolderService,
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private pePreloaderService: PePreloaderService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private peGridViewportService: PeGridViewportService,
    private headerService: PePlatformHeaderService,
    // Coupons Services
    private peCouponsApiService: PeCouponsApiService,
    private peCouponsEnvService: PeCouponsEnvService,
    private peCouponsGridService: PeCouponsGridService,
  ) {
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);

    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.peCouponsGridService.lastGridView;
    this.peCouponsGridService.lastGridView = <PeGridView>view;
    this.gridLayout = <PeGridView>view ?? PeGridView.BigListCover;
  }

  ngOnDestroy(): void {
    this.store.dispatch(new PeGridStoreActions.Clear());
    this.peGridQueryParamsService.destroy();
  }

  ngOnInit(): void {
    this.headerService.assignConfig({
      mainItem: {
        title: this.translateService.translate('coupons-app.sidebar_title'),
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

    if (this.route.snapshot.params.couponId) {
      const coupon: PeGridItem<PeCouponTypeInterface> = this.route.snapshot.data.coupon;
      this.openEditor(coupon);
    }

    const getFoldersTree$ = this.store
      .select(PeGridState.folders())
      .pipe(tap(this.setRootTree));
    const windowResizeListener$ = fromEvent(window, 'resize')
      .pipe(debounceTime(100), tap(this.loadItemAfterAction));

    merge(
      this.deviceTypeChange$,
      this.toggleOpenStatus$,
      this.gridItems$,
      this.initFoldersTree$,
      this.selectFolderListener$,
      this.foldersChangeListener$,
      this.folderEditor$,
      this.couponEditor$,
      this.gridSidenavToggle$,
      getFoldersTree$,
      windowResizeListener$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public get getSelectedFolder(): FolderItem {
    return this.selectedFolder?._id === this.rootFolder._id ? null : this.selectedFolder;
  }

  private get startFolderId(): string {
    return <string> this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder)
      ?? this.peFoldersActionsService.lastSelectedFolderId
      ?? null;
  }

  private readonly setRootTree = (folders) => {
    this.rootTree = folders
      .filter(folder => folder && !folder.parentFolderId && !folder.isHeadline && !folder.isProtected);
  }

  private restructureFoldersTree(folder: FolderItem, action: PeFoldersActionsEnum): void {
    const selectedFolderId = this.selectedFolder?._id ?? null;
    const isInSelectedFolder = folder.parentFolderId === selectedFolderId;
    const isExistingInGrid = this.gridItems.some(gridItem => gridItem.id === folder._id);

    let totalShift = 0;
    switch (action) {
      case PeFoldersActionsEnum.Create:
        totalShift = isInSelectedFolder ? 1 : 0;
        this.store.dispatch(new PeFoldersActions.Create(folder, selectedFolderId));
        break;
      case PeFoldersActionsEnum.Update:
        totalShift = !isExistingInGrid && isInSelectedFolder
          ? 1
          : isExistingInGrid && !isInSelectedFolder
            ? -1
            : 0;
        this.store.dispatch(new PeFoldersActions.Update(folder, selectedFolderId));
        break;
      case PeFoldersActionsEnum.Delete:
        totalShift = isExistingInGrid ? -1 : 0;
        this.store.dispatch(new PeFoldersActions.Delete(folder));
        this.peFolderService.deleteNode$.next(folder._id);
        break;
    }
    this.paginator.total += totalShift;
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case PeGridSideNavMenuActionsEnum.NewFolder:
        const folder = this.translateService.translate('folders.action.create.new_folder');
        this.peFolderService.createFolder(folder);
        break;
      case PeGridSideNavMenuActionsEnum.NewHeadline:
        const headline = this.translateService.translate('folders.action.create.new_headline');
        this.peFolderService.createHeadline(headline);
        break;
    }
  }

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
  }

  private setGridItems(folder: FolderItem): void {
    this.isLoading$.next(true);
    const isRootFolder = !folder?._id;
    const folderId = folder?._id ?? null;
    this.peFoldersApiService
      .getFolderItems(folderId, this.getSearchData())
      .pipe(
        tap(folderItems => {
          const folderChildren = isRootFolder ? this.rootTree : folder.children;
          const { collection, pagination_data } = folderItems;
          const prevGridItems = pagination_data.page > 1
            ? this.gridItems
            : this.peGridService.foldersToGridItemMapper(folderChildren);
          const items = collection.length
            ? this.peCouponsGridService.couponsToGridItemMapper(collection, this.canvas)
            : [];
          const uniqItems = items.filter(item => !prevGridItems.some(gridItem => gridItem.id === item.id));
          const gridItems = [...prevGridItems, ...uniqItems];
          this.paginator.page = pagination_data.page;
          this.paginator.total = pagination_data.total + folderChildren.length;
          gridItems.length && this.store.dispatch(new PeGridItemsActions.OpenFolder(gridItems));
          this.isLoading$.next(false);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private getSearchData(): PeGridSearchDataInterface {
    const { page, perPage } = this.paginator;
    const { direction, orderBy } = this.sortingOrder;

    return {
      configuration: this.filterConfiguration,
      direction: direction,
      orderBy: orderBy,
      page: page,
      perPage: perPage,
    };
  }

  public folderAction(event: FolderOutputEvent, action: PeFoldersActionsEnum): void {
    switch (action) {
      case PeFoldersActionsEnum.Delete:
        this.store.dispatch(new PeFoldersActions.Delete(event.data));
        break;
    }

    this.peFoldersActionsService.folderAction(event, action)
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public onPositionsChanged(positions: FolderPosition[]): void {
    const selectedFolderId = this.selectedFolder?._id ?? null;
    this.peFoldersActionsService.onUpdatePositions(positions)
      .pipe(
        switchMap(() => this.peFoldersApiService.getFoldersTree()),
        tap((tree: FolderItem[]) => {
          this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, selectedFolderId));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private readonly loadItemAfterAction = () => {
    const numberOfgridItems = this.gridItems.filter(gridItem => gridItem.type === PeGridItemType.Item).length;
    const perPage = this.perPageCount();
    const currentPage = Math.floor(numberOfgridItems / perPage);
    this.paginator.perPage = perPage;
    this.paginator.page = currentPage;
    numberOfgridItems <= perPage && this.scrolledToEnd();
  }

  private perPageCount(): number {
    const items = Math.ceil(window.innerWidth / MIN_ITEM_WIDTH * window.innerHeight / MIN_ITEM_WIDTH);

    return Math.ceil(items + items / 4);
  }

  public scrolledToEnd(): void {
    const { page, perPage, total } = this.paginator;
    const loadMore = total / perPage > page;
    if (loadMore) {
      this.paginator.page += 1;
      this.setGridItems(this.selectedFolder);
    }
  }

  public filtersChange(filters: PeFilterChange[]): void {
    this.filterConfiguration = this.peGridService.filtersChange(filters);
    this.onSelectFolder(this.selectedFolder);
  }

  public sortChange(sortingOrder: PeGridSortingInterface): void {
    this.sortingOrder = sortingOrder;
    this.paginator.page = 1;
    this.onSelectFolder(this.selectedFolder);
  }

  public viewChange(view: PeGridView): void {
    this.peCouponsGridService.lastGridView = view;
  }

  public createByHand(): void {
    this.openEditor();
  }

  public moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    moveItems?.length && moveItems.forEach((moveItem: PeMoveToFolderItem) => {
      if (moveItem.type === PeGridItemType.Item) {
        !folder.isHeadline && this.peFoldersApiService
          .moveToFolder(moveItem.id, folder._id)
          .pipe(takeUntil(this.destroy$)).subscribe();
      } else if (moveItem.type === PeGridItemType.Folder) {
        this.peFolderService.folderIntoFolder$.next({
          intoId: folder._id,
          moveId: moveItem.id,
        });
      }
      if (folder._id !== this.selectedFolder?._id) {
        this.store.dispatch(new PeGridItemsActions.DeleteItems([moveItem.id]));
      }
    });
    this.paginator.total -= moveItems.length;
    this.deselectAllItems();
  }

  public dropIntoFolder(gridItem: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.peGridService.selectedItems, gridItem])];
  }

  public actionClick(gridItem: PeGridItem): void {
    if (gridItem.type === PeGridItemType.Folder) {
      const { children, isProtected, position } = gridItem.data;
      this.selectedFolder = {
        _id: gridItem.id,
        children: children,
        isProtected: isProtected,
        name: gridItem.title,
        position: position,
      };
      this.onSelectFolder(this.selectedFolder);
    } else {
      this.openEditor(gridItem);
    }
  }

  private createFolder(): void {
    const actionData: PeFolderEditorActionDataInterface = {
      actionType: PeFoldersActionsEnum.Create,
      activeItem: this.selectedFolder,
    };
    this.openEditor(null, actionData);
  }

  private openEditor(gridItem?: PeGridItem, actionData?: PeFolderEditorActionDataInterface): void {
    const isFolder = !!actionData;
    const itemData = isFolder
      ? {
        ...actionData,
        item: gridItem,
        nextPosition: this.peFolderService.nextPosition,
      }
      : gridItem
        ? { id: gridItem.id }
        : null;
    const formTitle = isFolder
      ? gridItem?.title ?? this.translateService.translate('folders.folder_editor.create_folder')
      : itemData
        ? this.translateService.translate('coupons-app.coupon_editor.edit_coupon')
        : this.translateService.translate('coupons-app.coupon_editor.create_coupon');
    const component = isFolder
      ? PeFolderEditorComponent
      : PeCouponEditorComponent;
    const saveSubject$ = isFolder
      ? this.saveFolder$
      : this.saveCoupon$;
    const backdropClick = () => {
      if (isFolder) {
        this.peFolderService.backdropClick();
      } else {
        this.peCouponsGridService.backdropClick();
      }
    };

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-backdrop',
      backdropClick: backdropClick,
      data: itemData,
      headerConfig: {
        backBtnTitle: this.translateService.translate('coupons-app.actions.cancel'),
        doneBtnTitle: this.translateService.translate('coupons-app.actions.save'),
        onSaveSubject$: saveSubject$,
        removeContentPadding: !isFolder,
        theme: this.theme,
        title: formTitle,
      },
      component: component,
    };

    this.peOverlayWidgetService.open(config);
  }

  public optionsChange(option: PeGridOptionsMenuActionsEnum): void {
    switch (option) {
      case PeGridOptionsMenuActionsEnum.SelectAll:
        this.peGridService.selectedItems = this.gridItems;
        break;
      case PeGridOptionsMenuActionsEnum.DeselectAll:
        this.deselectAllItems();
        break;
      case PeGridOptionsMenuActionsEnum.Delete:
        if (this.peGridService.selectedItemsIds.length || this.peGridService.selectedFoldersIds.length) {
          this.delete();
        }
        break;
    }
  }

  private deselectAllItems(): void {
    this.peGridService.selectedItems = [];
  }

  public itemContextSelect(event: PeGridItemContextSelect): void {
    const { gridItem, menuItem } = event;
    const action = menuItem.value;
    switch (action) {
      case PeGridContextMenuActionsEnum.Edit:
        this.edit(gridItem);
        break;
      case PeGridContextMenuActionsEnum.Copy:
        this.copy(gridItem);
        break;
      case PeGridContextMenuActionsEnum.Paste:
        this.paste();
        break;
      case PeGridContextMenuActionsEnum.Duplicate:
        this.duplicate(gridItem);
        break;
      case PeGridContextMenuActionsEnum.Delete:
        this.peGridService.selectedItems = [gridItem];
        this.delete();
        break;
      case PeGridContextMenuActionsEnum.AddFolder:
        this.createFolder();
        break;
    }
  }

  private edit(gridItem: PeGridItem): void {
    const isFolder = gridItem.type === PeGridItemType.Folder;
    const actionData: PeFolderEditorActionDataInterface = isFolder
      ? {
        actionType: PeFoldersActionsEnum.Update,
        activeItem: this.selectedFolder,
      }
      : null;
    this.openEditor(gridItem, actionData);
  }

  private copy(gridItem: PeGridItem): void {
    this.copiedItem = gridItem;
    this.changePasteMenuItemStatus(ITEM_CONTEXT_MENU, PeGridContextMenuActionsEnum.Copy);
    this.changePasteMenuItemStatus(VIEWPORT_CONTEXT_MENU, PeGridContextMenuActionsEnum.Copy);
  }

  private paste(): void {
    const item: PeGridItem = this.copiedItem;
    switch (item.type) {
      case PeGridItemType.Folder:
        this.peFolderService.duplicateFolder$.next(item.id);
        break;
      case PeGridItemType.Item:
        this.peCouponsApiService.getCoupon(item.id)
          .pipe(
            map((coupon: PeCouponInterface) => {
              coupon = omit(
                coupon,
                [
                  '__v',
                  '_id',
                  'businessId',
                  'createdAt',
                  'parentFolder',
                  'updatedAt',
                ],
              );
              !coupon.endDate && delete coupon.endDate;
              coupon.code = this.peCouponsEnvService.generateCode();

              return coupon;
            }),
            switchMap(coupon => this.peCouponsApiService.createCoupon(coupon)),
            switchMap((coupon: PeCouponInterface) => {
              const selectedFolderId = this.selectedFolder?._id;
              const moveToFolder$ = selectedFolderId
                ? this.peFoldersApiService.moveToFolder(coupon._id, selectedFolderId)
                    .pipe(
                      catchError((error, request$) => error.error.error === 'Not Found'
                        ? concat(timer(5000), request$)
                        : of(true)))
                : of(null);

              return forkJoin([moveToFolder$]).pipe(mapTo(coupon));
            }),
            tap(coupon => {
              const gridItem = this.peCouponsGridService.couponsToGridItemMapper([coupon], this.canvas)[0];
              this.paginator.total += 1;
              this.store.dispatch(new PeGridItemsActions.AddItem(gridItem));
              const notify = this.translateService
                .translate('coupons-app.notify.successfuly_duplicated')
                .replace('{copiedFrom}', item.title)
                .replace('{copiedTo}', coupon.code);
              this.showSnackbar(notify);
            }),
            takeUntil(this.destroy$))
          .subscribe();
        break;
    }
    this.changePasteMenuItemStatus(ITEM_CONTEXT_MENU, PeGridContextMenuActionsEnum.Paste);
    this.changePasteMenuItemStatus(VIEWPORT_CONTEXT_MENU, PeGridContextMenuActionsEnum.Paste);
    this.copiedItem = null;
  }

  private changePasteMenuItemStatus(
    menu: PeGridMenu,
    action: PeGridContextMenuActionsEnum.Copy | PeGridContextMenuActionsEnum.Paste,
  ): void {
    const { items } = menu;
    if (items.length) {
      const pasteItem = items.find(menuItem => menuItem.value === PeGridContextMenuActionsEnum.Paste);
      pasteItem.disabled = action === PeGridContextMenuActionsEnum.Paste;
    }
  }

  private duplicate(gridItem: PeGridItem): void {
    this.copy(gridItem);
    this.paste();
  }

  private delete(): void {
    const itemsIds = this.peGridService.selectedItemsIds;
    const foldersIds = this.peGridService.selectedFoldersIds;
    const itemsToDelete$ = itemsIds.length
      ? itemsIds.map(couponId => this.peCouponsApiService
          .deleteCoupon(couponId)
          .pipe(
            tap(() => {
              this.store.dispatch(new PeGridItemsActions.DeleteItems([couponId]));
              this.paginator.total -= 1;
            })))
      : [of(null)];
    const foldersToDelete$ = foldersIds.length
      ? foldersIds.map(folderId => {
          const { name, position } = this.peFolderService.getFolderFromTreeById(this.rootTree, folderId);
          const folder: FolderItem = { _id: folderId, name, position };
          const event: FolderOutputEvent = { data: folder };

          return this.peFoldersActionsService
            .folderAction(event, PeFoldersActionsEnum.Delete);
        })
      : [of(null)];

    this.peCouponsGridService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => {
          this.deselectAllItems();

          return forkJoin([
            ...itemsToDelete$,
            ...foldersToDelete$,
          ]);
        }),
        tap(() => {
          const intro = this.translateService.translate(
            itemsIds.length && foldersIds.length
              ? 'coupons-app.notify.all_selected_items'
              : itemsIds.length
                ? 'coupons-app.notify.all_selected_coupons'
                : 'coupons-app.notify.all_selected_folders',
          );
          const condition = this.translateService.translate('coupons-app.notify.successfuly_deleted');
          const notify = `${intro} ${condition}`;
          this.showSnackbar(notify);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const deleteFolders = 'folders.confirm_dialog.delete.';
    const deleteCoupons = 'coupons-app.confirm_dialog.delete.';
    const itemsTitle = itemsIds.length
      ? itemsIds.length > 1
        ? `${deleteCoupons}coupons.title`
        : `${deleteCoupons}coupon.title`
      : null;
    const foldersTitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.title`
        : `${deleteFolders}folder.title`
      : null;
    const title = itemsTitle && foldersTitle
      ? `${deleteCoupons}items.title`
      : !!itemsTitle
        ? itemsTitle
        : foldersTitle;
    const itemsSubtitle = itemsIds.length
      ? itemsIds.length > 1
        ? `${deleteCoupons}coupons.subtitle`
        : `${deleteCoupons}coupon.subtitle`
      : null;
    const foldersSubtitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.subtitle`
        : `${deleteFolders}folder.subtitle`
      : null;
    const subtitle = itemsSubtitle && foldersSubtitle
      ? `${deleteCoupons}items.subtitle`
      : !!itemsSubtitle
        ? itemsSubtitle
        : foldersSubtitle;

    const headings: Headings = {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.translateService.translate('folders.actions.delete'),
      declineBtnText: this.translateService.translate('folders.actions.cancel'),
    };

    this.peCouponsGridService.openConfirmDialog(headings);
  }

  private showSnackbar(notify: string): void {
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor: '#00B640',
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    });
  }
}
