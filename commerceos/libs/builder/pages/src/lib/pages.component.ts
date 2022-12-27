import { EventEmitter, Inject, OnDestroy, OnInit, Output } from '@angular/core';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, EMPTY, merge, of, Subject } from 'rxjs';
import { delay, skip, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi, PebEditorWs } from '@pe/builder-api';
import { PebEditorState, PebEnvService, PebPageType, PebPageVariant } from '@pe/builder-core';
import { AppThemeEnum, PeDataGridFilter, PeDataGridPaginator } from '@pe/common';
import { PeDestroyService, PeGridItem, PeGridItemType } from '@pe/common';
import { PeFoldersActions, PeGridItemsActions, PeGridMenu, PeGridMenuItem } from '@pe/grid';
import { ContactsAppState } from '@pe/shared/contacts';

import { FOLDERS_SIDENAV_MENU, PagesDialogDataInterface, SideNavMenuActions, TABLE_DISPLAYED_COLUMNS, TOOLBAR_CONFIG, VIEW_MENU } from './pages.interface';

import { PeGridQueryParamsService,  PeGridService, PeGridState, PeGridView } from '@pe/grid';
import { GridQueryParams, MIN_ITEM_WIDTH } from '@pe/grid';
import { FolderItem, FolderOutputEvent, FolderService, PeFoldersActionsEnum, PeFoldersActionsService, PeFoldersApiService, RootFolderItem } from '@pe/folders';
import { PebEditorStore } from '@pe/builder-services';
import { PageAlbumInterface } from './pages.constants';


@Component({
  selector: 'peb-pages',
  templateUrl: './pages.component.html',
  styleUrls: ['./pages.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebPagesComponent implements OnInit, OnDestroy {

  @SelectSnapshot(ContactsAppState.popupMode) popupMode: boolean;

  @Output() createPage = new EventEmitter<any>();

  public readonly gridItems$ = this.store.select(PeGridState.gridItems())
  .pipe(
    skip(2),
    startWith([]),
  );

  private readonly TOOLBAR_CUSTOM_MENU = [];

  public readonly toolbar$ = new BehaviorSubject<any>({
    ...TOOLBAR_CONFIG,
    customMenus: this.TOOLBAR_CUSTOM_MENU,
  });

  public isLoading$ = new BehaviorSubject<boolean>(false);
  public foldersTree$ = new Subject<FolderItem[]>();
  private onSelectFolder$ = new Subject<FolderItem>();

  public viewMenu: PeGridMenu = VIEW_MENU;
  public foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public folderActions = PeFoldersActionsEnum;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;

  public filters: PeDataGridFilter[] = [];
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public selectedFolder: FolderItem = null;
  public gridLayout = PeGridView.List;

  private themeId: string;

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  public readonly rootFolder: RootFolderItem = {
    _id: null,
    name: 'All pages',
    image: 'assets/icons/folder.svg',
  };


  public viewportTitle: string;

  private albumId: string;

   constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: PagesDialogDataInterface,
    public dialogRef: MatDialogRef<PebPagesComponent>,
    private editorState: PebEditorState,
    private editorApi: PebEditorApi,
    private envService: PebEnvService,
    private store: Store,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFolderService: FolderService,
    private readonly destroy$: PeDestroyService,
    private peFoldersApiService: PeFoldersApiService,
    private editorStore: PebEditorStore,
    private editorWs: PebEditorWs,
  ) {
    this.themeId = this.editorStore.theme.id;
  }

  ngOnInit() {

    merge(
      this.initFoldersTree$,
      this.selectFolderListener$,
    ).pipe(takeUntil(this.destroy$)).subscribe();

  }

  ngOnDestroy() {
    this.peFoldersApiService.hostPath$.next(null);
  }

  private get initFoldersTree$(): any {
    const shopId = this.envService.applicationId;
    const themeId = this.themeId;

    return this.editorApi.getPageAlbumsTree(shopId, themeId).pipe(
      switchMap((tree: FolderItem[]) => {
        if (tree.length > 0) { return of(tree); }

        this.createFolderWithPage$.subscribe();

        return EMPTY;
      }),
      switchMap((tree: FolderItem[]) => {
        this.foldersTree$.next(cloneDeep(tree.map((folder: any) => {
          folder._id = folder.id;

          return folder;
        })));

        const selectedFolderId = this.startFolderId();
        this.selectedFolder = this.peFolderService.getFolderFromTreeById(tree, selectedFolderId);
        this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, selectedFolderId));

        return this.store.select(PeGridState.folders());
      }),
      take(1),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
      })
    );
  }

  private get createFolderWithPage$() {
    const album: PageAlbumInterface = {
      parent: null,
      name: 'General',
      icon: null,
      description: null,
    };

    return this.editorApi.createPageAlbum(
      this.envService.applicationId,
      this.themeId,
      album
    ).pipe(
      switchMap(() => this.initFoldersTree$),
    );
  }

  private get selectFolderListener$() {
    return this.onSelectFolder$
    .pipe(
      skip(1),
      tap((folder: FolderItem) => {
        const isRootFolder = !folder?._id;
        this.selectedFolder = !isRootFolder ? folder : null;
        this.peFoldersActionsService.lastSelectedFolderId = folder?._id;
        this.peGridQueryParamsService.folderToParams(folder?._id);
        this.viewportTitle = isRootFolder ? this.rootFolder.name : folder.name;
        this.paginator.page = 1;
        this.paginator.total = 0;
        this.store.dispatch(new PeGridItemsActions.OpenFolder([]));
        this.setGridItems(folder);
      }))
  }

  public get showAddNewItem(): boolean {
    return this.selectedFolder?.isProtected ? false : true;
  };

  public createByHand() {
    this.onNewPage();
  }

  public actionClick(event) {
    this.onNewPage();
  }

  public folderAction(event: FolderOutputEvent, action: PeFoldersActionsEnum): void {
    this.peFoldersActionsService.folderAction(event, action)
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case SideNavMenuActions.NewFolder:

        break;
    }
  }

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
  }

  private setGridItems(folder: FolderItem): void {
    if (!folder?._id ) { return; }

    this.isLoading$.next(true);
    this.albumId = folder._id;

    const shopId = this.envService.applicationId;
    const themeId = this.themeId;
    const albumId = folder._id;

    this.editorApi.getPageByAlbum(shopId, themeId, albumId)
    .pipe(
      take(1),
      tap((gridItems) => {

        if (gridItems.length) {
          const parsedItem = gridItems.map((item) => {
            const result = {
              id: item.id,
              title: item.name,
              selected: false,
              itemLoader$: new BehaviorSubject<boolean>(false),
              status:'DRAFT',
              action: {
                label: 'Add',
              },
              columns: [
                {
                  name: 'name',
                  value: 'name',
                },
                {
                  name: 'action',
                  value: 'action',
                },
              ],
              image: 'assets/icons/folder-grid.png',
              type: PeGridItemType.Item,
            };

            return result as PeGridItem;
          });

          this.store.dispatch(new PeGridItemsActions.OpenFolder(parsedItem));
        }

        this.isLoading$.next(false);
      }),
      switchMap((gridItems) => {
        if (gridItems.length > 0) { return EMPTY; }

        return this.onCreatePage({
          pageName: 'Add blank',
          type: PebPageType.Master,
          masterId: null,
          albumId: folder?._id,
          activatePage: false,
        });
      }),
      tap(() => {
        this.setGridItems(folder);
      }),
    )
    .subscribe();
  }

  onNewPage(): void {
    this.dialogRef.close({ type: 'createPage', payload: {
      type: this.editorState.pagesView,
      albumId: this.albumId !== 'root' ? this.albumId : null,
    } });
  }

  close() {
    this.dialogRef.close();
  }

  private onCreatePage(input: { type, masterId, albumId, activatePage?, pageName? }) {
    return this.editorStore.createPage({
      name: input.pageName,
      variant: PebPageVariant.Default,
      type: input.type,
      masterId: input.masterId,
      activatePage: input.activatePage ?? true,
    }).pipe(
      tap(({ pageId, action }) => {
        const params = {
          action,
          themeId: this.themeId,
        };
        // this.editorWs.createMasterPage(params);
      }),
      delay(1000),
      switchMap(({ pageId } ) => {
        const shopId = this.envService.applicationId;
        const albumId = input.albumId;

        return this.editorApi.linkPageToAlbum(shopId, null, pageId, albumId);
      }),
    )
  }

  private startFolderId(): string {
    return <string>this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder)
      ?? this.peFoldersActionsService.lastSelectedFolderId
      ?? null;
  }

  private perPageCount(): number {
    const items = Math.ceil((window.innerWidth / MIN_ITEM_WIDTH) * (window.innerHeight / MIN_ITEM_WIDTH));

    return Math.ceil(items + items / 4);
  }

}
