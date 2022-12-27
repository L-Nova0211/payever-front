import { ChangeDetectionStrategy, Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Select, Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, merge, Observable, Subject, from, of } from 'rxjs';
import { catchError, debounceTime, filter,  map,  retry, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import { PebEditorApi, PebEditorWs, PebEditorWsEvents } from '@pe/builder-api';
import { PebScreen, PebShapesShape,  shapeMigrations, pebGenerateId  } from '@pe/builder-core';
import { getElementKitTransformationDeep, PebElementKitDeep, PebElementTransformationDeep } from '@pe/builder-core';
import { PebEditorState } from '@pe/builder-core';
import { PebEditorOptionsState } from '@pe/builder-renderer';
import { AppThemeEnum, AppType, APP_TYPE, EnvironmentConfigInterface, PeDataGridPaginator, PE_ENV } from '@pe/common';
import { PeDestroyService, StopLoading, StartLoading } from '@pe/common';
import { PeGridItem, PeGridItemType } from '@pe/common';
import { FolderItem, FolderService } from '@pe/folders';
import { PeFoldersActionsEnum, PeFoldersActionsService, RootFolderItem } from '@pe/folders';
import { PeGridService, PeGridSortingInterface, PeGridState, PeGridView, PeGridViewportService } from '@pe/grid';
import { GRID_LIST_ITEMS_TYPES, PeFilterChange, PeGridMenuItem } from '@pe/grid';
import { PeGridQueryParamsService, PeGridSearchFiltersInterface } from '@pe/grid';
import { GridQueryParams, PeGridItemsActions, PeGridMenu } from '@pe/grid';
import { PeFilterConditions, PeGridSortingDirectionEnum } from '@pe/grid';

import { DEFAULT_CONTEXT_MENU_ITEMS, SideNavMenuActions, TABLE_DISPLAYED_COLUMNS } from './shapes.interface';
import { TOOLBAR_CONFIG, TransformationsStore, VIEWPORT_CONTEXT_MENU } from './shapes.interface';
import { ITEM_CONTEXT_MENU, MIN_ITEM_WIDTH, OptionsMenu, ROOT_ITEM } from './shapes.interface';
import { DEFAULT_ORDER_BY, FOLDERS_SIDENAV_MENU } from './shapes.interface';
import { VIEW_MENU } from './shapes.interface';


@Component({
  selector: 'peb-shapes',
  templateUrl: './shapes.component.html',
  styleUrls: ['./shapes.component.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PebShapesComponent implements OnInit {

  @Select(PeGridState.gridItems()) gridItems$: Observable<PeGridItem[]>;
  @Select(PebEditorOptionsState.screen) screen$: Observable<PebScreen>;

  public readonly foldersTree$ = new BehaviorSubject<FolderItem[]>(null);

  private readonly onSelectFolder$ = new Subject<any>();

  public viewportTitle: string;
  public selectedFolder: FolderItem;
  public paginator: PeDataGridPaginator;
  public gridLayout = PeGridView.List;
  public listItem = {};
  public shapesItem = {};
  public scrollBottomOffset = 1;
  public readonly theme = AppThemeEnum.default;
  public readonly viewMenu: PeGridMenu = VIEW_MENU;
  public readonly foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly toolbar = TOOLBAR_CONFIG;
  public readonly rootFolder: RootFolderItem = ROOT_ITEM;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  public folderActions = PeFoldersActionsEnum;

  public viewportContextMenu$ = this.onSelectFolder$.pipe(
    filter(folder => !!folder ),
    map((folder) => folder?.basic === false ? this.viewportContextMenu : [])
  );

  isLoading$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

  private sortingOrder: PeGridSortingInterface = DEFAULT_ORDER_BY;
  private itemTransformationsStore:TransformationsStore = {};
  private pagination = { pageSize: 500 };
  private shapeItems = [];
  private formattedConfiguration: any = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public dialogData: any,
    public dialogRef: MatDialogRef<PebShapesComponent>,
    public state: PebEditorState,
    private editorWs: PebEditorWs,
    private store: Store,
    private peFolderService: FolderService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peFoldersActionsService: PeFoldersActionsService,
    private destroyed$: PeDestroyService,
    private peGridService: PeGridService,
    private api: PebEditorApi,
    private peGridViewportService: PeGridViewportService,
    @Inject(APP_TYPE) private appType: AppType,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
  ) {
  }

  ngOnInit() {
    this.store.dispatch(new StartLoading(this.appType));

    this.initPagination();
    this.createItem();
    this.getShapeAlbums();

    merge(
      this.getShapeAlbum$,
      this.getShape$,
      this.deleteShape$,
      this.selectFolderListener$,
    ).pipe(
      takeUntil(this.destroyed$),
      retry(),
    ).subscribe();
  }

  private get getShapeAlbum$(): any {
    return this.editorWs.on(PebEditorWsEvents.GetShapeAlbum).pipe(
      filter(message => !!message.data),
      map(message => this.folderFlatToTree(message.data.shapeAlbums) ?? []),
      switchMap(folders => {
        this.foldersTree$.next(cloneDeep(folders));

        this.store.dispatch(new StopLoading(this.appType));

        const selectedFolderId = this.startFolderId();

        this.selectedFolder = !selectedFolderId
        ? ROOT_ITEM as any
        : this.peFolderService.getFolderFromTreeById(folders, selectedFolderId);

        return this.store.select(PeGridState.folders());
       }),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
      }),
    );
  }

  private get deleteShape$() {
    return this.editorWs.on(PebEditorWsEvents.DeleteShape).pipe(
      debounceTime(200),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
      }),
    );
  }

  private get getShape$() {
    return this.editorWs.on(PebEditorWsEvents.GetShapeWithFilter).pipe(
      filter(message => !!message.data),
      tap((message) => {
        this.paginator.total = message.data?.count || 0;
      }),
      map(message => message.data.shapes ?? []),
      map((shapes: PebShapesShape[]) => shapes.filter(shape => !!shape.screen)),
      switchMap((shapes: PebShapesShape[]) => {
        const getFilterCondition = (title: string): boolean => this.formattedConfiguration
          .every((filter) => {
            const isTitleIncludesValue = title.toLowerCase().includes(filter.value);

            return filter.condition === PeFilterConditions.Contains
              ? isTitleIncludesValue
              : !isTitleIncludesValue;
          });
        const { direction, orderBy } = this.sortingOrder;
        const sortingDirection = direction === PeGridSortingDirectionEnum.Descending ? -1 : 1;
        const shapesCount = shapes.length;
        const setShape = (shape: PebShapesShape) => {
          this.listItem[shape.id] = shape;
          this.shapeItems[shape.id] = this.getShapeItems(shape);
        };

        if (!this.formattedConfiguration.length) {
          this.listItem = { };
          this.shapeItems = [];
        }

        const shapes$ = this.formattedConfiguration.length
          ? of(Object.values(this.listItem) as PebShapesShape[])
          : from(shapeMigrations([...shapes], this.env));

        return shapes$
          .pipe(
            map((shapesAfterMigrations) => {
              const filteredShapes = shapesAfterMigrations
                .filter((shape) => {
                  const filterCondition = getFilterCondition(shape.title);
                  filterCondition && setShape(shape);

                  return filterCondition;
                });

              this.paginator.total += filteredShapes.length - shapesCount;

              return filteredShapes
                .sort((a, b) => a[orderBy] > b[orderBy]
                  ? sortingDirection
                  : a[orderBy] < b[orderBy]
                    ? -1 * sortingDirection
                    : 0);
            }));
      }),
      map(shapes => shapes.map(shape => {
        const result = {
          id: shape.id,
          title: shape.title,
          basic: true,
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
          image: null,
          type: PeGridItemType.Item,
        };

        return result as PeGridItem;
      })),
      tap(parsedItem => {
        this.isLoading$.next(false);
        this.store.dispatch(new PeGridItemsActions.OpenFolder(parsedItem));
      }),
      catchError((err) => {
        this.isLoading$.next(false);

        return of(err);
      }),
    );
  }

  public get getSelectedFolder(): FolderItem {
    return this.selectedFolder?._id ? this.selectedFolder : null;
  }

  private get selectFolderListener$() {
    return this.onSelectFolder$
    .pipe(
      tap((folder: FolderItem) => {
        const isRootFolder = !folder?._id;
        const { _id = null } = folder;
        this.selectedFolder = !isRootFolder ? folder : ROOT_ITEM;
        this.peFoldersActionsService.lastSelectedFolderId = _id;
        this.peGridQueryParamsService.folderToParams(_id);
        this.viewportTitle = folder.name;
        this.paginator.total = 0;
        this.store.dispatch(new PeGridItemsActions.OpenFolder([]));

        this.isLoading$.next(true);
        this.getShapesWithFilter(_id, this.formattedConfiguration);
      }),
    )
  }

  public get isListView(): boolean {
    return GRID_LIST_ITEMS_TYPES.includes(this.peGridViewportService.view);
  }

  public close() {
    this.dialogRef.close();
  }

  public filtersChange(filters: PeFilterChange[]): void {
    const filterConfiguration = this.peGridService.filtersChange(filters);
    this.formattedConfiguration = this.formatFilters(filterConfiguration) ;
    const albumId = this.selectedFolder?._id ?? null;
    this.getShapesWithFilter(albumId, this.formattedConfiguration);
  }

  public getShapeItems(event): any {
    const item = this.getEventByList(event.id);
    const transformation = this.getTransformation(item?.elementKit, item.id);
    const styles = transformation.styles['desktop'][transformation.definition.id];
    const max = 100;
    const scale = styles.width > styles.height ? max / styles.width : max / styles.height;
    const renderer = {
      elm: transformation,
      styles,
      stylesheet: this.getStylesheet(transformation),
      scale,
    }

    return renderer;
  }

  public actionClick(event) {
    const shape = this.getEventByList(event.id);
    this.closeDialog({ type: 'appendElement', payload: shape });
  }

  public getEventByList(id) {
    return this.listItem[id];
  }

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
  }

  public sortChange(sortingOrder: PeGridSortingInterface): void {
    this.sortingOrder = sortingOrder;
    this.onSelectFolder(this.selectedFolder);
  }

  public optionsChange(option: OptionsMenu): void {
    switch (option) {
      case OptionsMenu.SelectAll:
        this.selectAll();
        break;
      case OptionsMenu.DeselectAll:
        this.deselectAll();
        break;
      case OptionsMenu.Delete:
        this.deleteItems(this.peGridService.selectedItems);
        break;
      case OptionsMenu.Duplicate:
        break;
    }
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case SideNavMenuActions.NewFolder:
        this.createFolder();
        break;
    }
  }

  public createFolder(event = null) {
    if (!event) {
      this.peFolderService.createFolder('');

      return;
    }

    const album = {
      name: event.data.name,
      type: null,
      parent: event.data.parentFolderId,
      menuItems: null,
    };

    this.api.postShapeAlbum(album).pipe(
      take(1),
      tap((result) => {
        result.menuItems = DEFAULT_CONTEXT_MENU_ITEMS;
        result.parent = result.parentFolderId;

        event.apply(result);
      }),
    ).subscribe();
  }

  public deleteFolder(event) {
    const albumId = event.data._id

    this.api.deleteShapeAlbum(albumId).pipe(
      take(1),
      tap(() => {
        event.apply(event.data);
      }),
    ).subscribe();
  }

  public updateFolder(event) {
    const album = event.data;
    if (!album.id) {
      this.createFolder(event);

      return;
    }

    album.parent = album.parentFolderId;

    this.api.patchShapeAlbum(album.id, album).pipe(
      take(1),
      tap(() => {
        event.apply(event.data);
      }),
    ).subscribe();
  }

  private deleteItems(selectedItems) {
    selectedItems.forEach(item => this.editorWs.deleteShape({ shapeId: item.id }));
  }

  private selectAll() {
    this.gridItems$.pipe(
      take(1),
      tap((gridItems) => {
        this.peGridService.selectedItems = gridItems;
      }),
    ).subscribe();
  }

  private deselectAll() {
    this.peGridService.selectedItems = [];
  }

  private initPagination(): void {
    this.paginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  }

  private createItem() {
    if (!this.dialogData.elementKit) { return; }
    this.screen$.pipe(
      take(1),
      switchMap((screen) => {
        const newElement: PebShapesShape = {
          elementKit: this.dialogData.elementKit,
          id: pebGenerateId(),
          title: 'Untitled',
          description: 'No tag',
          album: null,
          screen: screen,
        };

        return this.api.postShape(newElement);
      }),
    ).subscribe();
  }

  private perPageCount(): number {
    const items = Math.ceil((window.innerWidth / MIN_ITEM_WIDTH) * (window.innerHeight / MIN_ITEM_WIDTH));

    return Math.ceil(items + items / 4);
  }

  private formatFilters(filters: PeGridSearchFiltersInterface) {
    const filtersFormatted = [];

    if (!filters) { return filtersFormatted; }

    Object.keys(filters).forEach((field) => {
      filters[field].forEach(({ condition, value }) => {
        value.forEach((filterValue) => {
          const value = typeof filterValue === 'string' ? filterValue.toLowerCase() : filterValue;
          filtersFormatted.push({ field, condition, value });
        });
      });
    });

    return filtersFormatted;
  }

   private getDeepChild(folders, parent) {
    const elements = [];

    folders.forEach((folder) => {
      folder.parent = !parent && !folder.parent ? null : folder.parent;

      if (folder.parent !== parent) { return; }

      folder.children = this.getDeepChild(folders, folder.id);
      folder.isHideMenu = folder.basic;
      folder.isProtected = folder.basic;
      folder.menuItems = DEFAULT_CONTEXT_MENU_ITEMS;
      folder._id = folder.id;
      folder.parentFolderId = parent;
      elements.push(folder);
    });

    return elements;
  }

  private folderFlatToTree(folders) {
    const message = this.getDeepChild(cloneDeep(folders), null);

    return message;
  }

  private getTransformation(elementKit: PebElementKitDeep, id: string): PebElementTransformationDeep {
    const storedTransformation = this.getItemTransformation(id);
    if (storedTransformation) {
      return storedTransformation;
    }
    let transformation = elementKit ? getElementKitTransformationDeep(elementKit) : null;
    if (transformation?.contextSchema && Object.keys(transformation.contextSchema).length) {
      const context = this.dialogData.contextBuilder?.buildSchema(transformation.contextSchema) ?? {};
      transformation = { ...transformation, context };
    }

    this.setItemTransformation(id, transformation);

    return transformation;
  }

  private getItemTransformation(key: string) {
    return this.itemTransformationsStore[key] ?? null;
  }

  private setItemTransformation(key: string, elementTransformation: PebElementTransformationDeep): void {
    this.itemTransformationsStore = { ...this.itemTransformationsStore, [key]: elementTransformation };
  }

  private getStylesheet(transformation: PebElementTransformationDeep, screen = 'desktop') {
    return {
      ...transformation.styles[screen],
      [transformation.definition.id]: transformation.styles[screen]?.[transformation.definition.id],
    };
  }

  private startFolderId(): string {
    return <string> this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder)
      ?? this.peFoldersActionsService.lastSelectedFolderId
      ?? null;
  }

  private getShapeAlbums(): void {
    this.editorWs.getShapeAlbums();
  }

  private closeDialog(result: any): void {
    this.dialogRef.close(result);
  }

  private getShapesWithFilter(albumId?: string, filters = [], append = false): void {
    const { direction, orderBy } = this.sortingOrder;

    const request: any = {
      filters,
      pagination: {
        offset: this.shapeItems?.length ?? 0,
        limit: this.pagination.pageSize,
      },
    }

    request.pagination[direction] = orderBy;

    if (albumId) { request.album = albumId; }

    this.editorWs.getShapesWithFilter(request);
  }

}
