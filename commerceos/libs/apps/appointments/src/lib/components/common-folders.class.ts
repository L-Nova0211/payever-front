import { Injector } from '@angular/core';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, forkJoin, merge, Subject } from 'rxjs';
import { filter, skip, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  FolderApply,
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
  FolderService,
  MoveIntoFolderEvent,
  PeFolderEditorActionDataInterface,
  PeFolderEditorDataToSaveInterface,
  PeFoldersActionsEnum,
  PeFoldersActionsService,
  PeFoldersApiService,
  PeMoveToFolderItem,
} from '@pe/folders';
import {
  GridQueryParams,
  PeFoldersActions,
  PeGridItem,
  PeGridItemsActions,
  PeGridItemType,
  PeGridMenuItem,
  PeGridSideNavMenuActionsEnum,
  PeGridSidenavService,
  PeGridState,
} from '@pe/grid';
import { PePlatformHeaderService } from '@pe/platform-header';

import { PeGridCommonClassDirective } from './common-grid.class';

export class PeGridWithFoldersCommonClass extends PeGridCommonClassDirective {
  protected peFolderService = this.injector.get(FolderService);
  protected peFoldersActionsService = this.injector.get(PeFoldersActionsService);
  protected peFoldersApiService = this.injector.get(PeFoldersApiService);
  protected peGridSidenavService = this.injector.get(PeGridSidenavService);
  protected pePlatformHeaderService = this.injector.get(PePlatformHeaderService);

  public folderActions = PeFoldersActionsEnum;
  public rootTree: FolderItem[] = [];
  public readonly foldersTree$ = new Subject<FolderItem[]>();
  protected readonly isFoldersLoading$ = new BehaviorSubject<boolean>(true);
  protected readonly saveFolder$ = new BehaviorSubject<any>(null);

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

  private readonly initFoldersTree$ = forkJoin([
    this.peFoldersApiService.getFoldersTree(),
    this.peFoldersApiService.getRootFolder(),
  ])
    .pipe(
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

  protected readonly selectFolderListener$ = this.onSelectFolder$
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
        this.deselectAllItems();
      }));

  constructor(protected injector: Injector) {
    super(injector);

    const setFoldersTree$ = this.store
      .select(PeGridState.folders())
      .pipe(tap(this.setRootTree));

    merge(
      this.foldersChangeListener$,
      this.folderEditor$,
      this.initFoldersTree$,
      setFoldersTree$,
    ).pipe(takeUntil(this.destroy$)).subscribe();
  }

  public get getSelectedFolder(): FolderItem {
    return this.selectedFolder?._id === this.rootFolder._id ? null : this.selectedFolder;
  }

  private get startFolderId(): string {
    return <string> this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder)
      ?? this.peFoldersActionsService.lastSelectedFolderId;
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

  private readonly setRootTree = (folders: FolderItem[]) => {
    this.rootTree = folders
      .filter(folder => folder
        && folder.parentFolderId === this.rootFolder._id
        && !folder.isHeadline
        && !folder.isProtected);
  }

  protected createFolder(): void {
    const actionData: PeFolderEditorActionDataInterface = {
      actionType: PeFoldersActionsEnum.Create,
      activeItem: this.selectedFolder,
    };
    this.openEditor$.next({ actionData, gridItem: null });
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

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
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
}
