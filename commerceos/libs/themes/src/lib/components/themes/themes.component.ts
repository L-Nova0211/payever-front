import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, forkJoin, fromEvent, merge, of, Subject } from 'rxjs';
import {
  catchError,
  debounceTime,
  filter,
  finalize,
  map,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
} from 'rxjs/operators';

import { PebEditorApi } from '@pe/builder-api';
import { PebEnvService, PebScreen } from '@pe/builder-core';
import { PebViewerPreviewDialog } from '@pe/builder-viewer';
import {
  AppThemeEnum,
  AppType,
  APP_TYPE,
  MessageBus,
  PeBuilderEditorRoutingPathsEnum,
  PeDataGridPaginator,
  PeDestroyService,
  PePreloaderService,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import {
  FolderApply,
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
  FolderService,
  ID_OF_DEFAULT_FOLDER,
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

import { PeThemeTypesEnum } from '../../enums';
import { ThemesApi, PeThemesGridService, THEMES_API_PATH } from '../../services';
import { PeThemeEditorComponent } from '../theme-editor';

import {
  FOLDERS_SIDENAV_MENU,
  ITEM_CONTEXT_MENU,
  TABLE_DISPLAYED_COLUMNS,
  TOOLBAR_CONFIG,
  VIEWPORT_CONTEXT_MENU,
  VIEW_MENU,
} from './menu-constants';

const SIDENAV_NAME = 'app-theme-sidenav';

@Component({
  selector: 'peb-themes',
  templateUrl: './themes.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeThemesComponent implements OnInit, OnDestroy {

  @Input() public readonly theme = this.pebEnvService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.pebEnvService.businessData.themeSettings.theme]
    : AppThemeEnum.default;;

  @Input() public useInstantInstall = false;

  @Input() isEmbedGrid = true;

  @Output() installed = new EventEmitter<any>();

  private copiedItem: PeGridItem = null;
  private filterConfiguration: PeGridSearchFiltersInterface;
  private isFoldersLoading$ = new BehaviorSubject<boolean>(true);
  private isNewThemeCreating = false;
  private isPreview = false;
  private onSelectFolder$ = new Subject<FolderItem>();
  private saveFolder$ = new BehaviorSubject(null);
  private saveTheme$ = new BehaviorSubject(null);
  private sortingOrder: PeGridSortingInterface = {
    direction: PeGridSortingDirectionEnum.Ascending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  };

  public folderActions = PeFoldersActionsEnum;
  public foldersTree$ = new Subject<FolderItem[]>();
  public gridItems: PeGridItem[] = [];
  public gridLayout = PeGridView.BigListCover;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public rootTree: FolderItem[] = [];
  public viewportTitle: string;
  public mobileTitle$ = new BehaviorSubject<string>('');

  private readonly cancelBtn = this.translateService.translate('folders.actions.cancel');
  private readonly deleteBtn = this.translateService.translate('folders.actions.delete');
  private readonly intro = this.translateService.translate('builder-themes.notify.theme');

  public readonly foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly viewMenu: PeGridMenu = VIEW_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  public readonly toolbar$ = new BehaviorSubject<any>(TOOLBAR_CONFIG);
  public readonly rootFolder: FolderItem = {
    _id: null,
    children: [],
    image: 'assets/icons/folder.svg',
    name: this.translateService.translate('builder-themes.fields.all_themes'),
    position: null,
  };

  public selectedFolder = this.rootFolder;

  public readonly gridItems$ = this.store.select(PeGridState.gridItems())
    .pipe(
      skip(2),
      startWith([]),
      tap(gridItems => { this.gridItems = gridItems; }));

  private readonly confirmationDialogOpener$ = this.messageBus
    .listen('confirm.dialog.open')
    .pipe(
      tap((headings: Headings) => {
        this.confirmScreenService.show(headings, false);
      }),
    );

  private readonly initFoldersTree$ = of(this.pebEnvService.applicationId)
    .pipe(
      switchMap(applicationId => {
        this.peFoldersApiService.applicationId$.next(applicationId);
        this.peFoldersApiService.hostPath$.next(this.themeApiPath + '/api');

        return forkJoin([
          this.peFoldersApiService.getDefaultFolder(),
          this.peFoldersApiService.getFoldersTree(),
          this.peFoldersApiService.getRootFolder(),
        ]);
      }),
      map(([defaultTree, foldersTree, rootFolder]) => {
        this.rootFolder._id = rootFolder._id;
        const tree = [...defaultTree, ...foldersTree]
          .map((folder: FolderItem) => {
            folder.name = folder.name.replace('Payever', 'payever');

            return folder;
          });

        return tree;
      }),
      switchMap(tree => {
        this.foldersTree$.next(cloneDeep(tree));
        this.setRootTree(tree);
        const selectedFolderId = this.startFolderId ?? this.rootFolder._id;
        this.selectedFolder = this.peFolderService.getFolderFromTreeById(tree, selectedFolderId, this.rootFolder);
        this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, selectedFolderId));
        this.isFoldersLoading$.next(false);

        return this.store.select(PeGridState.folders());
      }),
      take(1),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
      }),
      catchError((err) => {
        this.isFoldersLoading$.next(false);

        return of(err);
      })
    );

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
        }
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
        this.store.dispatch(new PeGridItemsActions.OpenFolder([]));
        this.mobileTitle$.next(folder.name);
        this.setGridItems(folder);
        this.deselectAllItems();
      }));

  private readonly themeEditor$ = this.saveTheme$
    .pipe(
      skip(1),
      tap((theme: any) => {
        if (theme) {
          const gridItem = this.peThemesGridService.themesToGridItemMapper([theme])[0];
          const isDefaultFolder = !this.selectedFolder?.isProtected;
          const isTemplateTheme = theme.type === PeThemeTypesEnum.Template;
          const storeAction = isDefaultFolder && isTemplateTheme
            ? new PeGridItemsActions.DeleteItems([gridItem.id])
            : new PeGridItemsActions.EditItem(gridItem);
          this.store.dispatch(storeAction);
          const condition = this.translateService.translate('builder-themes.notify.successfuly_updated');
          const notify = `${this.intro} "${theme.name}" ${condition}`;
          this.peOverlayWidgetService.close();
          this.showSnackbar(notify);
        }
      }));

  private readonly sidenavToggle$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((active: boolean) => {
        this.headerService.toggleSidenavActive(SIDENAV_NAME, active);
      }));


  constructor(
    // Angular
    private cdr: ChangeDetectorRef,
    private matDialog: MatDialog,
    private router: Router,
    private store: Store,
    // Pe Services
    @Inject(APP_TYPE) private appType: AppType,
    private messageBus: MessageBus,
    private pebEditorApi: PebEditorApi,
    private pebEnvService: PebEnvService,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFoldersApiService: PeFoldersApiService,
    private peFolderService: FolderService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peGridService: PeGridService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private pePreloaderService: PePreloaderService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    // Themes Services
    @Inject(THEMES_API_PATH) private themeApiPath: string,
    private themesApi: ThemesApi,
    private peThemesGridService: PeThemesGridService,
    private peGridSidenavService: PeGridSidenavService,
    private headerService: PePlatformHeaderService,
    private confirmScreenService: ConfirmScreenService,
  ) {
    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);

    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.peThemesGridService.lastGridView;
    this.peThemesGridService.lastGridView = <PeGridView>view;
    this.gridLayout = <PeGridView>view ?? PeGridView.List;
  }

  ngOnDestroy(): void {
    this.peFoldersApiService.applicationId$.next(null);
    this.peFoldersApiService.hostPath$.next(null);
    this.store.dispatch(new PeGridStoreActions.Clear());
    this.peGridQueryParamsService.destroy();
    this.headerService.removeSidenav(SIDENAV_NAME);
    this.pePreloaderService.stopLoading(this.appType)
  }

  ngOnInit(): void {
    this.headerService.assignSidenavItem({
      name: SIDENAV_NAME,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate('builder-themes.title'),
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
      this.themeEditor$,
      setFoldersTree$,
      windowResizeListener$,
      this.sidenavToggle$,
      this.confirmationDialogOpener$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  toggleSidebar() {
    this.peGridSidenavService.toggleViewSidebar();
    this.cdr.detectChanges();
  }

  public get getSelectedFolder(): FolderItem {
    return this.selectedFolder?._id === this.rootFolder._id ? null : this.selectedFolder;
  }

  public get showAddNewItem(): boolean {
    return !this.selectedFolder?.isProtected;
  }

  private get startFolderId(): string {
    return <string> this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder)
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
        totalShift = isInSelectedFolder ?  1 : 0;
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

  private checkOpenPreview(folderItems: PeGridItem[]): void {
    const previewParam: string = <string> this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.OpenPreview);
    if (previewParam) {
      const theme = folderItems.find(item => item.id = previewParam);
      this.onOpenPreview(theme);
    }
  }

  private setGridItems(folder: FolderItem): void {
    this.isLoading$.next(true);
    const folderId = folder?.isProtected
      ? ID_OF_DEFAULT_FOLDER
      : folder._id;
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
            ? this.peThemesGridService.themesToGridItemMapper(collection)
            : [];
          const uniqItems = items.filter(item => !prevGridItems.some(gridItem => gridItem.id === item.id));
          const gridItems = [...prevGridItems, ...uniqItems];
          this.paginator.page = pagination_data.page;
          this.paginator.total = pagination_data.total + folderChildren.length;
          gridItems.length && this.store.dispatch(new PeGridItemsActions.OpenFolder(gridItems));
          this.isLoading$.next(false);
        }),
        catchError((err) => {
          this.isLoading$.next(false);

          return of(err);
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
    const currentPage = Math.floor(numberOfgridItems/perPage);
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
    const loadMore = total/perPage > page;
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
    this.peThemesGridService.lastGridView = view;
  }

  public createByHand(): void {
    if (!this.isNewThemeCreating) {
      this.isNewThemeCreating = true;
      this.themesApi
        .createApplicationTheme('New theme', this.selectedFolder._id)
        .pipe(
          tap(() => {
            const url = this.router.url.replace(PeBuilderEditorRoutingPathsEnum.Themes, PeBuilderEditorRoutingPathsEnum.BuilderEditor);
            this.router.navigate([url]);
            this.headerService.removeSidenav(SIDENAV_NAME);
          }),
          takeUntil(this.destroy$))
        .subscribe();
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

  public actionClick(gridItem: PeGridItem, preview?: boolean): void {
    if (gridItem.type === PeGridItemType.Folder) {
      const { children, isProtected, position } = gridItem.data;
      this.selectedFolder = {
        _id: gridItem.id,
        children: children,
        isProtected: isProtected,
        name: gridItem.title ,
        position: position,
      };
      this.onSelectFolder(this.selectedFolder);
    } else if (gridItem.type === PeGridItemType.Item && preview) {
      this.onOpenPreview(gridItem);
    } else {
      gridItem.itemLoader$.next(true);
      const { data: { isInstalled }, serviceEntityId } = gridItem;
      const themeAction$ = isInstalled
        ? this.themesApi.switchTemplateTheme(serviceEntityId)
        : this.themesApi.installTemplateTheme(serviceEntityId);
      const condition = isInstalled
        ? 'builder-themes.messages.theme_switched'
        : 'builder-themes.messages.theme_installed';
      const notify = this.translateService.translate(condition);
      const url = this.router.url.replace(
        PeBuilderEditorRoutingPathsEnum.Themes,
        PeBuilderEditorRoutingPathsEnum.BuilderEditor,
      );

      themeAction$
        .pipe(
          finalize(() => {
            this.router.navigate([url]).then(() => {
              this.showSnackbar(notify, true);
              this.headerService.removeSidenav(SIDENAV_NAME);
            });
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }
  }

  public onOpenPreview(theme: PeGridItem): void {
    if (!this.isPreview) {
      theme?.itemLoader$?.next(true);
      const themeId = theme.serviceEntityId;

      this.pebEditorApi
        .getThemeDetail(themeId)
        .pipe(
          switchMap(snapshot => {
            const snapshot$ = of(snapshot);
            const pages$ = forkJoin(
              snapshot.pages.map(page => this.peThemesGridService
                .openPage(page.id, themeId, PebScreen.Desktop))
            );

            return forkJoin([
              pages$,
              snapshot$,
            ]);
          }),
          map(([pages, snapshot]) => {
            this.isPreview = false;
            theme?.itemLoader$?.next(false);

            return { snapshot, pages };
          }),
          switchMap(themeSnapshot => {
            const dialog = this.matDialog
              .open(
                PebViewerPreviewDialog,
                {
                  position: {
                    top: '0',
                    left: '0',
                  },
                  height: '100vh',
                  maxWidth: '100vw',
                  width: '100vw',
                  panelClass: 'themes-preview-dialog',
                  data: {
                    themeSnapshot,
                  },
                }
              );

            const afterOpened$ = dialog
              .afterOpened()
              .pipe(
                tap(() => {
                  setTimeout(() => {
                    this.peGridQueryParamsService.previewToParams(themeId);
                  })
                }));

            const afterClosed$ = dialog
              .afterClosed()
              .pipe(
                tap(() => {
                  this.peGridQueryParamsService.deleteQueryParamByName(GridQueryParams.OpenPreview);
                }));

            return merge(
              afterClosed$,
              afterOpened$,
            );
          }),
          takeUntil(this.destroy$))
        .subscribe();

      this.isPreview = true;
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
        };
    const formTitle = isFolder
      ? gridItem?.title ?? this.translateService.translate('folders.folder_editor.create_folder')
      : gridItem?.title;
    const component = isFolder
      ? PeFolderEditorComponent
      : PeThemeEditorComponent;
    const saveSubject$ = isFolder
      ? this.saveFolder$
      : this.saveTheme$;
    const backdropClick = () => {
      if (isFolder) {
        this.peFolderService.backdropClick();
      } else {
        this.peThemesGridService.backdropClick();
      }
    };

    const config: PeOverlayConfig = {
      hasBackdrop: true,
      backdropClass: 'settings-backdrop',
      backdropClick: backdropClick,
      data: itemData,
      headerConfig: {
        backBtnTitle: this.translateService.translate('builder-themes.actions.cancel'),
        doneBtnTitle: this.translateService.translate('builder-themes.actions.save'),
        onSaveSubject$: saveSubject$,
        theme: this.theme,
        title: formTitle,
      },
      component: component,
    }
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
        this.themesApi
          .duplicateTemplateTheme(item.serviceEntityId, this.selectedFolder._id)
          .pipe(
            tap(theme => {
              const themeToMap = {
                isFolder: false,
                isActive: false,
                type: PeThemeTypesEnum.Application,
                ...theme,
              };
              const mappedTheme = this.peThemesGridService.themesToGridItemMapper([themeToMap]);
              this.store.dispatch(new PeGridItemsActions.AddItem(mappedTheme[0]));
              this.paginator.total += 1;
              const notify = this.translateService.translate('builder-themes.messages.theme_duplicated');
              this.showSnackbar(notify, true);
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
    const activeThemesIds = items
      .filter(theme => theme.data.isActive)
      .map(theme => theme.id);

    if (activeThemesIds.length) {
      const message = activeThemesIds.length > 1
        ? 'builder-themes.messages.themes_not_delete_active_theme'
        : 'builder-themes.messages.theme_not_delete_active_theme';
      const notify = this.translateService.translate(message);
      this.showSnackbar(notify, false);

      return;
    }

    const itemsToDelete$ = items.length
      ? items.map(theme => this.themesApi
          .deleteTemplateTheme(theme.serviceEntityId)
          .pipe(
            tap(() => {
              this.store.dispatch(new PeGridItemsActions.DeleteItems([theme.id]));
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

    this.peThemesGridService.confirmation$
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
              ? 'builder-themes.notify.all_selected_items'
              : items.length
                ? 'builder-themes.notify.all_selected_themes'
                : 'builder-themes.notify.all_selected_folders',
          );
          const condition = this.translateService.translate('builder-themes.notify.successfuly_deleted');
          const notify = `${intro} ${condition}`;
          this.showSnackbar(notify);
        }),
        takeUntil(this.destroy$))
      .subscribe();

    const deleteFolders = 'folders.confirm_dialog.delete.';
    const deletePlans = 'builder-themes.confirm_dialog.delete.';
    const itemsTitle = items.length
      ? items.length > 1
        ? `${deletePlans}themes.title`
        : `${deletePlans}theme.title`
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
        ? `${deletePlans}themes.subtitle`
        : `${deletePlans}theme.subtitle`
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

    this.peThemesGridService.openConfirmDialog(headings);
  }

  private showSnackbar(notify: string, success = true): void {
    const iconId = success ? 'icon-commerceos-success' : 'icon-alert-24';
    const iconColor = success ? '#00B640' : '#E2BB0B';
    this.snackbarService.toggle(true, {
      content: notify,
      duration: 5000,
      iconColor,
      iconId,
      iconSize: 24,
    });
  }
}
