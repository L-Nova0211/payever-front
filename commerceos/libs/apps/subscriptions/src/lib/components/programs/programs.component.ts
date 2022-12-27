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
import { BehaviorSubject, forkJoin, fromEvent, merge, of, Subject } from 'rxjs';
import {
  debounceTime,
  filter,
  map,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import {
  AppThemeEnum,
  AppType,
  APP_TYPE,
  IdToDataMapper,
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
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';

import { BAD_REQUEST, REQUIRED_MESSAGE } from '../../constants';
import { PeSubscriptionsPlanInterface } from '../../interfaces';
import {
  PeSubscriptionsApiService,
  PeSubscriptionsGridService,
} from '../../services';
import { PeSubscriptionsPlanEditorComponent } from '../plan-editor';

import {
  FOLDERS_SIDENAV_MENU,
  ITEM_CONTEXT_MENU,
  TABLE_DISPLAYED_COLUMNS,
  TOOLBAR_CONFIG,
  VIEWPORT_CONTEXT_MENU,
} from './menu-constants';

const SIDENAV_NAME = 'app-subscriptions-programs-sidenav';

@Component({
  selector: 'pe-subscriptions-programs',
  templateUrl: './programs.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeSubscriptionsProgramsComponent implements OnInit, OnDestroy {

  @ViewChild('canvas', { static: false }) canvas: ElementRef;

  private copiedItem: PeGridItem;
  private filterConfiguration: PeGridSearchFiltersInterface;
  private isFoldersLoading$ = new BehaviorSubject<boolean>(true);
  private onSelectFolder$ = new Subject<FolderItem>();
  private saveFolder$ = new BehaviorSubject<any>(null);
  private savePlan$ = new BehaviorSubject<any>(null);
  private sortingOrder: PeGridSortingInterface = {
    direction: PeGridSortingDirectionEnum.Ascending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  };

  public folderActions = PeFoldersActionsEnum;
  public foldersTree$ = new Subject<FolderItem[]>();
  public gridItems: PeGridItem[] = [];
  public gridLayout = PeGridView.List;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public rootTree: FolderItem[] = [];
  public showAddNewItem = true;
  public viewportTitle: string;
  public mobileTitle$ = new BehaviorSubject<string>('');

  private readonly cancelBtn = this.translateService.translate('folders.actions.cancel');
  private readonly deleteBtn = this.translateService.translate('folders.actions.delete');
  private readonly intro = this.translateService.translate('subscriptions-app.notify.plan');

  public readonly foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  public readonly toolbar$ = new BehaviorSubject<any>(TOOLBAR_CONFIG);
  public readonly rootFolder: FolderItem = {
    _id: null,
    children: [],
    image: 'assets/icons/folder.svg',
    name: this.translateService.translate('subscriptions-app.folders.all_plans'),
    position: null,
  };

  public selectedFolder = this.rootFolder;

  public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  public readonly gridItems$ = this.store.select(PeGridState.gridItems())
    .pipe(
      skip(2),
      startWith([]),
      tap(gridItems => { this.gridItems = gridItems; }));

  private readonly initFoldersTree$ = of(this.pebEnvService.applicationId)
    .pipe(
      switchMap(applicationId => {
        this.peFoldersApiService.applicationId$.next(applicationId);

        return forkJoin([
          this.peFoldersApiService.getFoldersTree(),
          this.peFoldersApiService.getRootFolder(),
        ]);
      }),
      switchMap(([folderTree, rootFolder]) => {
        this.rootFolder._id = rootFolder._id;
        this.foldersTree$.next(cloneDeep(folderTree));
        this.setRootTree(folderTree);
        const selectedFolderId = this.startFolderId ?? rootFolder._id;
        this.selectedFolder = this.peFolderService.getFolderFromTreeById(folderTree, selectedFolderId, this.rootFolder);
        this.store.dispatch(new PeFoldersActions.InitFoldersTree(folderTree, selectedFolderId));
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
        this.selectedFolder = folder;
        this.peFolderService.selectedFolder = folder;
        this.peFoldersActionsService.lastSelectedFolderId = folder._id;
        this.peGridQueryParamsService.folderToParams(folder._id);
        this.viewportTitle = folder.name;
        this.paginator.page = 1;
        this.paginator.total = 0;
        this.mobileTitle$.next(folder.name);
        this.store.dispatch(new PeGridItemsActions.OpenFolder([]));
        this.setGridItems(folder);
        this.deselectAllItems();
      }));

  private readonly planEditor$ = this.savePlan$
    .pipe(
      skip(1),
      tap(plan => {
        const isUpdate = plan.createdAt !== plan.updatedAt;
        const gridItem = this.peSubscriptionsGridService.plansToGridItemMapper([plan], this.canvas)[0];
        const storeAction = isUpdate
          ? new PeGridItemsActions.EditItem(gridItem)
          : new PeGridItemsActions.AddItem(gridItem);
        const condition = this.translateService.translate(
          isUpdate
            ? 'subscriptions-app.notify.successfuly_updated'
            : 'subscriptions-app.notify.successfuly_created',
        );
        const notify = `${this.intro} "${plan.name}" ${condition}`;

        this.store.dispatch(storeAction);
        this.paginator.total += isUpdate ? 0 : 1;
        this.peOverlayWidgetService.close();
        this.showSnackbar(notify);
      }));

  private readonly toggleSidenavStatus$ = this.sidenavService.toggleOpenStatus$.pipe(
    tap((active: boolean) => {
      this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
    })
  );

  constructor(
    // Angular
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private store: Store,
    // Pe Services
    @Inject(APP_TYPE) private appType: AppType,
    private messageBus: MessageBus,
    private pebEnvService: PebEnvService,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFoldersApiService: PeFoldersApiService,
    private peFolderService: FolderService,
    private peGridService: PeGridService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private pePreloaderService: PePreloaderService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private headerService: PePlatformHeaderService,
    private sidenavService: PeGridSidenavService,
    // Subscriptions Services
    private peSubscriptionsApiService: PeSubscriptionsApiService,
    private peSubscriptionsGridService: PeSubscriptionsGridService,
  ) {
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);

    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.peSubscriptionsGridService.lastGridView;
    this.peSubscriptionsGridService.lastGridView = <PeGridView>view;
    this.gridLayout = <PeGridView>view ?? PeGridView.List;
  }

  ngOnDestroy(): void {
    this.peFoldersApiService.applicationId$.next(null);
    this.store.dispatch(new PeGridStoreActions.Clear());
    this.peGridQueryParamsService.destroy();
    this.headerService.removeSidenav(SIDENAV_NAME);
  }

  ngOnInit(): void {
    if (this.activatedRoute.snapshot.params.planId) {
      const plan = this.activatedRoute.snapshot.data.plan;
      const gridItem = this.peSubscriptionsGridService.plansToGridItemMapper([plan], this.canvas)[0];
      this.openEditor(gridItem);
    }

    const setFoldersTree$ = this.store
      .select(PeGridState.folders())
      .pipe(tap(this.setRootTree));
    const windowResizeListener$ = fromEvent(window, 'resize')
      .pipe(debounceTime(100), tap(this.loadItemsAfterAction));

    merge(
      this.gridItems$,
      this.initFoldersTree$,
      this.selectFolderListener$,
      this.foldersChangeListener$,
      this.folderEditor$,
      this.planEditor$,
      this.toggleSidenavStatus$,
      setFoldersTree$,
      windowResizeListener$,
    ).pipe(takeUntil(this.destroy$)).subscribe();

    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.sidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('subscriptions-app.navigation.my_plans'),
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

  public get getSelectedFolder(): FolderItem {
    return this.selectedFolder?._id === this.rootFolder._id ? null : this.selectedFolder;
  }

  private get startFolderId(): string {
    return this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder) as string
      ?? this.peFoldersActionsService.lastSelectedFolderId;
  }

  private readonly setRootTree = (folders) => {
    this.rootTree = folders
      .filter(folder => folder
        && folder.parentFolderId === this.rootFolder._id
        && !folder.isHeadline
        && !folder.isProtected);
  }

  private restructureFoldersTree(folder: FolderItem, action: PeFoldersActionsEnum): void {
    const selectedFolderId = this.selectedFolder._id;
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
    const folderId = folder._id;
    const isRootFolder = folderId === this.rootFolder._id;
    this.peFoldersApiService
      .getFolderItems(folderId, this.getSearchData(), this.rootFolder._id)
      .pipe(
        tap(folderItems => {
          const folderChildren = isRootFolder ? this.rootTree : folder.children;
          const { collection, pagination_data } = folderItems;
          const prevGridItems = pagination_data.page > 1
            ? this.gridItems
            : this.peGridService.foldersToGridItemMapper(folderChildren);
          const items = collection.length
            ? this.peSubscriptionsGridService.plansToGridItemMapper(collection, this.canvas)
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
    if (event?.data && !event.data.parentFolderId) {
      event.data.parentFolderId = this.rootFolder._id;
    }
    if (action === PeFoldersActionsEnum.Delete && event?.data._id === this.selectedFolder._id) {
      this.onSelectFolder$.next(this.rootFolder);
    }

    this.peFoldersActionsService.folderAction(event, action)
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public onPositionsChanged(positions: FolderPosition[]): void {
    this.peFoldersActionsService.onUpdatePositions(positions)
      .pipe(
        switchMap(() => this.peFoldersApiService.getFoldersTree()),
        tap((tree: FolderItem[]) => {
          this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, this.selectedFolder._id));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private readonly loadItemsAfterAction = () => {
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
    this.peSubscriptionsGridService.lastGridView = view;
  }

  public createByHand(): void {
    if (this.pebEnvService.applicationId !== BAD_REQUEST) {
      this.openEditor();
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate(REQUIRED_MESSAGE),
        duration: 15000,
        hideButtonTitle: this.translateService.translate('subscriptions-app.navigation.settings'),
        hideCallback: () => {
          this.messageBus.emit(`subscriptions.navigate.settings`, this.pebEnvService.applicationId);
        },
        iconColor: '#E2BB0B',
      });
    }
  }

  public moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    moveItems?.length && moveItems.forEach((moveItem: PeMoveToFolderItem) => {
      if (moveItem.type === PeGridItemType.Item) {
        !folder.isHeadline && this.peFoldersApiService
          .moveToFolder(moveItem.id, folder._id, this.rootFolder._id)
          .pipe(takeUntil(this.destroy$)).subscribe();
      } else if (moveItem.type === PeGridItemType.Folder) {
        this.peFolderService.folderIntoFolder$.next({
          intoId: folder._id,
          moveId: moveItem.id,
        });
      }
      if (folder._id !== this.selectedFolder._id) {
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
      : {
        applicationScopeElasticId: gridItem?.id,
        id: gridItem?.serviceEntityId,
        targetFolderId: this.selectedFolder._id,
      };
    const formTitle = isFolder
      ? gridItem?.title ?? this.translateService.translate('folders.folder_editor.create_folder')
      : itemData?.applicationScopeElasticId && itemData?.id
        ? this.translateService.translate('subscriptions-app.plan_editor.edit_plan')
        : this.translateService.translate('subscriptions-app.plan_editor.create_plan');
    const component = isFolder
      ? PeFolderEditorComponent
      : PeSubscriptionsPlanEditorComponent;
    const saveSubject$ = isFolder
      ? this.saveFolder$
      : this.savePlan$;
    const backdropClick = () => {
      if (isFolder) {
        this.peFolderService.backdropClick();
      } else {
        this.peSubscriptionsGridService.backdropClick();
      }
    };

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-backdrop',
      backdropClick: backdropClick,
      data: itemData,
      headerConfig: {
        backBtnTitle: this.translateService.translate('subscriptions-app.actions.cancel'),
        doneBtnTitle: this.translateService.translate('subscriptions-app.actions.save'),
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
        (this.peGridService.selectedItemsIds.length || this.peGridService.selectedFoldersIds.length) && this.delete();
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
        this.peSubscriptionsApiService
          .getPlan(item.serviceEntityId)
          .pipe(
            switchMap(plan => {
              const planToDuplicate: PeSubscriptionsPlanInterface = omit(
                plan,
                [
                  '__v',
                  '_id',
                  'business',
                  'businessId',
                  'createdAt',
                  'id',
                  'isDefault',
                  'updatedAt',
                ],
              );

              const categories$ = plan.categories.length
                ? this.peSubscriptionsApiService.getCategories()
                : of(null);
              const products$ = plan.products.length
                ? this.peSubscriptionsApiService.getProducts()
                : of(null);
              const subscribers$ = plan.subscribers.length
                ? this.peSubscriptionsApiService
                  .getSubscribers()
                  .pipe(
                    map(subscribers => subscribers
                      .map(subscriber => {
                        delete subscriber.title;

                        return subscriber;
                      })))
                : of(null);
              const subscribersGroups$ = plan.subscribersGroups.length
                ? this.peSubscriptionsApiService
                  .getSubscribersGroups()
                  .pipe(switchMap(this.peSubscriptionsApiService.mapSubscribersGroups))
                : of(null);

              return forkJoin([
                of(planToDuplicate),
                categories$,
                products$,
                subscribers$,
                subscribersGroups$,
              ]);
            }),
            switchMap(([planToDuplicate, categories, products, subscribers, subscribersGroups]) => {
              if (categories) {
                planToDuplicate.categories = IdToDataMapper(planToDuplicate.categories, categories);
              }
              if (products) {
                planToDuplicate.products = IdToDataMapper(planToDuplicate.products, products);
              }
              if (subscribers) {
                planToDuplicate.subscribers = IdToDataMapper(planToDuplicate.subscribers, subscribers);
              }
              if (subscribersGroups) {
                planToDuplicate.subscribersGroups = IdToDataMapper(planToDuplicate.subscribersGroups, subscribersGroups);
              }
              planToDuplicate.name += ' copy';
              planToDuplicate.shortName = planToDuplicate.name;
              planToDuplicate.targetFolderId = this.selectedFolder._id;

              return this.peSubscriptionsApiService.createPlan(planToDuplicate);
            }),
            tap(plan => {
              const gridItem = this.peSubscriptionsGridService.plansToGridItemMapper([plan], this.canvas)[0];
              this.paginator.total += 1;
              this.store.dispatch(new PeGridItemsActions.AddItem(gridItem));
              const condition = this.translateService.translate('subscriptions-app.notify.successfuly_duplicated');
              const notify = `${this.intro} "${plan.name}" ${condition}`;
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
    const items = this.peGridService.selectedItems
      .filter(gridItem => gridItem.type === PeGridItemType.Item);
    const foldersIds = this.peGridService.selectedFoldersIds;
    const itemsToDelete$ = items.length
      ? items.map(plan => this.peSubscriptionsApiService
        .deletePlan(plan.serviceEntityId)
        .pipe(
          tap(() => {
            this.store.dispatch(new PeGridItemsActions.DeleteItems([plan.id]));
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

    this.peSubscriptionsGridService.confirmation$
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
            items.length && foldersIds.length
              ? 'subscriptions-app.notify.all_selected_items'
              : items.length
                ? 'subscriptions-app.notify.all_selected_plans'
                : 'subscriptions-app.notify.all_selected_folders',
          );
          const condition = this.translateService.translate('subscriptions-app.notify.successfuly_deleted');
          const notify = `${intro} ${condition}`;
          this.showSnackbar(notify);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const deleteFolders = 'folders.confirm_dialog.delete.';
    const deletePlans = 'subscriptions-app.confirm_dialog.delete.';
    const itemsTitle = items.length
      ? items.length > 1
        ? `${deletePlans}plans.title`
        : `${deletePlans}plan.title`
      : null;
    const foldersTitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.title`
        : `${deleteFolders}folder.title`
      : null;
    const title = itemsTitle && foldersTitle
      ? `${deletePlans}items.title`
      : !!itemsTitle
        ? itemsTitle
        : foldersTitle;
    const itemsSubtitle = items.length
      ? items.length > 1
        ? `${deletePlans}plans.subtitle`
        : `${deletePlans}plan.subtitle`
      : null;
    const foldersSubtitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.subtitle`
        : `${deleteFolders}folder.subtitle`
      : null;
    const subtitle = itemsSubtitle && foldersSubtitle
      ? `${deletePlans}items.subtitle`
      : !!itemsSubtitle
        ? itemsSubtitle
        : foldersSubtitle;

    const headings: Headings = {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };

    this.peSubscriptionsGridService.openConfirmDialog(headings);
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
