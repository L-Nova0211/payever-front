import { HttpResponse } from '@angular/common/http';
import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Output,
  ViewChild,
} from '@angular/core';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { ApmService } from '@elastic/apm-rum-angular';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, EMPTY, forkJoin, fromEvent, merge, of, Subject } from 'rxjs';
import { catchError, filter, skip, startWith, switchMap, take, takeUntil, tap } from 'rxjs/operators';

import {
  AppThemeEnum,
  AppType,
  EnvironmentConfigInterface,
  EnvService,
  MessageBus,
  PeDataGridPaginator,
  PeDestroyService,
  PePreloaderService,
  PE_ENV,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
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
  RootFolderItem,
} from '@pe/folders';
import {
  GridQueryParams,
  MIN_ITEM_WIDTH,
  PeFilterChange,
  PeFoldersActions,
  PeGridItem,
  PeGridItemContextSelect,
  PeGridItemsActions,
  PeGridItemType,
  PeGridMenu,
  PeGridMenuItem,
  PeGridQueryParamsService,
  PeGridSearchDataInterface,
  PeGridSearchFiltersInterface,
  PeGridService,
  PeGridSidenavService,
  PeGridSortingDirectionEnum,
  PeGridSortingInterface,
  PeGridSortingOrderByEnum,
  PeGridState,
  PeGridStoreActions,
  PeGridView,
  PeGridViewportService,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PeOverlayConfig, PeOverlayRef, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';
import { AddContacts, ContactsAppState } from '@pe/shared/contacts';
import { SnackbarService } from '@pe/snackbar';

import { ContactComponent, ContactsWidgetComponent } from '../../components';
import { Contact, ContactMainInfo } from '../../interfaces';
import { ContactsGQLService, ContactsListService, ContactsRuleService, ImportApiService, FieldsGQLService } from '../../services';
import { getContactDisplayFields } from '../../utils';

import {
  ContextMenu,
  FileType,
  FOLDERS_SIDENAV_MENU,
  ITEM_CONTEXT_MENU,
  MORE_MENUS,
  OptionsMenu,
  SideNavMenuActions,
  TABLE_DISPLAYED_COLUMNS,
  TOOLBAR_CONFIG,
  VIEWPORT_CONTEXT_MENU,
  VIEW_MENU,
} from './menu-constants';

const APP_NAME = AppType.Contacts;

@Component({
  selector: 'pe-contacts-list',
  templateUrl: './contacts-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeContactsListComponent implements OnDestroy, OnInit {
  @SelectSnapshot(ContactsAppState.popupMode) popupMode: boolean;

  @ViewChild('csvFileInput') csvFileInput: ElementRef<HTMLInputElement>;
  @ViewChild('xmlFileInput') xmlFileInput: ElementRef<HTMLInputElement>;

  @Input() preSelectedItems: any[];
  @Output() selectedItemChanged = new EventEmitter<any>();

  private copiedItem: PeGridItem;
  private editContactSubject$ = new BehaviorSubject(null);
  private fileType = FileType;
  private filterConfiguration: PeGridSearchFiltersInterface;
  private onSelectFolder$ = new Subject<FolderItem>();
  private onCreateFolder$ = new Subject<FolderItem>();
  private overwrite = false;
  private overwriteExistingStream$ = new BehaviorSubject<boolean>(false);
  private peOverlayRef: PeOverlayRef;
  private resizeTimeout: any;
  private saveFolderSubject$ = new BehaviorSubject(null);
  private saveContactSubject$ = new BehaviorSubject(null);
  private onClosedDialogSubject$ = new Subject();

  private sortingOrder: PeGridSortingInterface = {
    direction: PeGridSortingDirectionEnum.Descending,
    orderBy: PeGridSortingOrderByEnum.CreationDate,
  };

  public folderActions = PeFoldersActionsEnum;
  public foldersTree$ = new Subject<FolderItem[]>();
  public gridItems: PeGridItem[] = [];
  public gridLayout = PeGridView.BigListCover;
  public isLoading$ = new BehaviorSubject<boolean>(false);
  public isFoldersLoading$ = new BehaviorSubject<boolean>(true);
  public paginator: PeDataGridPaginator = { page: 1, perPage: this.perPageCount(), total: 0 };
  public rootTree: FolderItem[] = [];
  public scrollBottomOffset = 1;
  public selectedFolder: FolderItem = null;
  public viewportTitle: string;
  public foldersSidenavMenu = FOLDERS_SIDENAV_MENU;
  public viewMenu: PeGridMenu = VIEW_MENU;

  private readonly cancelBtn = this.translateService.translate('actions.cancel');
  private readonly closeBtn = this.translateService.translate('actions.close');
  private readonly deleteBtn = this.translateService.translate('actions.delete');
  private readonly TOOLBAR_CUSTOM_MENU = [
    {
      title: 'contacts-app.menu.import',
      items: [
        {
          icon: 'icon-export-csv',
          label: 'CSV',
          onClick: () => {
            this.selectImportFile(FileType.CSV, { overwrite: this.overwrite });
          },
        },
        {
          icon: 'icon-export-xlsx',
          label: 'XML',
          onClick: () => {
            this.selectImportFile(FileType.XML, { overwrite: this.overwrite });
          },
        },
      ],
    },
  ];

  public readonly itemContextMenu = ITEM_CONTEXT_MENU;
  public readonly moreMenus = MORE_MENUS;
  public readonly viewportContextMenu = VIEWPORT_CONTEXT_MENU;
  public readonly tableDisplayedColumns = TABLE_DISPLAYED_COLUMNS;
  public readonly toolbar$ = new BehaviorSubject<any>({
    ...TOOLBAR_CONFIG,
    customMenus: this.TOOLBAR_CUSTOM_MENU,
  });

  public readonly rootFolder: RootFolderItem = {
    _id: null,
    name: this.translateService.translate('contacts-app.all_contacts'),
    image: 'assets/icons/folder.svg',
  };

  mobileTitle$ = new BehaviorSubject<string>(this.rootFolder.name);

  public readonly theme = this.envService.businessData?.themeSettings?.theme
    ? AppThemeEnum[this.envService.businessData.themeSettings.theme]
    : AppThemeEnum.default;

  private readonly ICONS = {
    'alert-icon': 'alert.svg',
    'image-placeholder': 'image-placeholder.svg',
    'add-theme': 'add-theme.svg',
    'icon-export-csv': `${this.env.custom.cdn}/icons-transactions/icon-export-csv.svg`,
    'icon-export-xlsx': `${this.env.custom.cdn}/icons-transactions/icon-export-xlsx.svg`,
  };

  private readonly confirmationDialogOpener$ = this.messageBus
    .listen('confirm.dialog.open')
    .pipe(
      tap((headings: Headings) => {
        this.confirmScreenService.show(headings, false);
      }));

  public readonly gridItems$ = this.store.select(PeGridState.gridItems(APP_NAME))
    .pipe(
      skip(2),
      startWith([]),
      tap((gridItems) => { this.gridItems = gridItems }));

  private readonly initFoldersTree$ = this.peFoldersApiService.getFoldersTree()
    .pipe(
      switchMap((tree: FolderItem[]) => {
        this.foldersTree$.next(cloneDeep(tree));
        this.rootTree = tree.filter((folder) => {
          return folder && !folder.parentFolderId && !folder.isHeadline;
        });
        const selectedFolderId = this.startFolderId();
        this.selectedFolder = this.peFolderService.getFolderFromTreeById(tree, selectedFolderId);
        this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, selectedFolderId, APP_NAME));
        this.isFoldersLoading$.next(false);

        return this.store.select(PeGridState.folders(APP_NAME));
      }),
      take(1),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
      }));

  private readonly getFoldersTree$ = this.store.select(PeGridState.folders(APP_NAME))
    .pipe(
      tap((folders) => {
        this.rootTree = folders.filter((folder) => {
          return folder && !folder.parentFolderId && !folder.isHeadline;
        });
      }));

  private readonly foldersChangeListener$ = this.peFoldersActionsService.folderChange$
    .pipe(
      tap(({ folder, action }) => {
        this.restructureFoldersTree(folder, action);
        this.deselectAllItems();
      }));

  private readonly folderEditor$ = this.saveFolderSubject$
    .pipe(
      filter((data) => {
        return Boolean(data);
      }),
      tap(({ actionType, updatedFolder }: PeFolderEditorDataToSaveInterface) => {
        const folder: FolderApply = {
          _id: updatedFolder._id,
          name: updatedFolder.name,
          image: updatedFolder.image,
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
      skip(2),
      tap((folder: FolderItem) => {
        const isRootFolder = !folder?._id;
        this.mobileTitle$.next(folder?.name ?? this.rootFolder.name);
        this.selectedFolder = !isRootFolder ? folder : null;
        this.contactsListService.selectedFolder = folder;
        this.peFoldersActionsService.lastSelectedFolderId = folder?._id;
        this.peGridQueryParamsService.folderToParams(folder?._id);
        this.viewportTitle = isRootFolder ? this.rootFolder.name : folder.name;
        this.paginator.page = 1;
        this.paginator.total = 0;
        this.store.dispatch(new PeGridItemsActions.OpenFolder([], APP_NAME));
        this.setGridItems(folder);
        this.deselectAllItems();
      }));

  private readonly createFolderListener$ = this.onCreateFolder$.pipe(switchMap(() => this.initFoldersTree$));
  private readonly contactEditor$ = this.saveContactSubject$
    .pipe(
      skip(1),
      tap((contactData) => {
        this.peOverlayRef.close();
        const contactItem: ContactMainInfo = getContactDisplayFields(contactData.contact);
        const contactId = contactData.contactId;
        contactItem['_id'] = contactId
          ? contactId.split('|')[0]
          : contactItem.id;
        contactItem['serviceEntityId'] = contactId
          ? contactId.split('|')[1]
          : contactItem.id;

        const gridItem = this.contactsListService.contactsToGridItemMapper([contactItem])[0];
        const storeAction = contactId
          ? new PeGridItemsActions.EditItem(gridItem, APP_NAME)
          : new PeGridItemsActions.AddItem(gridItem, APP_NAME);
        this.paginator.total += contactId ? 0 : 1;
        this.store.dispatch(storeAction);
      }));

  private readonly openEditor$ = this.editContactSubject$
    .pipe(
      skip(1),
      tap((contact) => {
        this.peOverlayRef.close();
        this.openEditor(contact);
      }));

  private readonly gridSidenavToggle$ = this.messageBus
    .listen('contacts-app.grid-sidenav.toggle')
    .pipe(
      tap(() => {
        this.peGridSidenavService.toggleViewSidebar();
      }));

  private readonly windowResizeListener$ = fromEvent(window, 'resize')
    .pipe(
      tap(() => {
        if (this.resizeTimeout) {
          clearTimeout(this.resizeTimeout);
        }
        this.resizeTimeout = setTimeout((() => {
          this.loadItemAfterAction();
        }).bind(this),
          1000,
        );
      }),
    );

  private readonly selectedItems$ = this.peGridService.selectedItems$.pipe(
    tap(items => {
      this.store.dispatch(new AddContacts(items));
    }),
  );

  private readonly deviceTypeChange$ = this.peGridViewportService.deviceTypeChange$
    .pipe(
      filter(() => !this.popupMode),
      tap(({ isMobile }) => {
        this.pePlatformHeaderService.assignConfig({
          isShowDataGridToggleComponent: !isMobile,
          isShowMainItem: isMobile,
          isShowSubheader: isMobile,
        } as PePlatformHeaderConfig);
      })
    );

  private readonly toggleOpenStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      filter(() => !this.popupMode),
      tap((open: boolean) => {
        this.pePlatformHeaderService.assignConfig({
          isShowMainItem: this.peGridViewportService.isMobile && !open,
        } as PePlatformHeaderConfig);
      }),
    );

  constructor(
    // Angular
    private apmService: ApmService,
    private cdr: ChangeDetectorRef,
    private domSanitizer: DomSanitizer,
    private iconRegistry: MatIconRegistry,
    private store: Store,
    // Pe
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private confirmScreenService: ConfirmScreenService,
    private envService: EnvService,
    private importApiService: ImportApiService,
    private mediaService: MediaService,
    private messageBus: MessageBus,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFoldersApiService: PeFoldersApiService,
    private peFolderService: FolderService,
    private peGridQueryParamsService: PeGridQueryParamsService,
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,
    private route: ActivatedRoute,
    private pePreloaderService: PePreloaderService,
    private pePlatformHeaderService: PePlatformHeaderService,
    private peGridViewportService: PeGridViewportService,
    // Contacts Services
    private fieldsService: FieldsGQLService,
    private contactsApiService: ContactsGQLService,
    private contactsListService: ContactsListService,
    private contactsRulesService: ContactsRuleService,
  ) {
    this.store.dispatch(new PeGridStoreActions.Create(APP_NAME));
    this.pePreloaderService.startLoading(APP_NAME);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], APP_NAME);
    const view = this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.View)
      ?? this.contactsListService.lastGridView;
    this.contactsListService.lastGridView = <PeGridView>view;
    this.gridLayout = this.popupMode ? PeGridView.List : <PeGridView>view ?? PeGridView.BigListCover;

    Object.entries(this.ICONS).forEach(([name, path]) => {
      this.iconRegistry.addSvgIcon(name, this.domSanitizer.bypassSecurityTrustResourceUrl(path));
    });
  }

  ngOnDestroy(): void {
    this.store.dispatch(new PeGridStoreActions.Clear(APP_NAME));
    this.peGridQueryParamsService.destroy();
    this.peFoldersApiService.hostPath$.next(null);
    this.deselectAllItems();
  }

  ngOnInit(): void {
    if (this.route.snapshot.params.contactId) {
      const contact: Contact = this.route.snapshot.data.contact;
      this.openEditor({ ...contact, id: contact._id } as any, null, true);
    }

    this.foldersSidenavMenu = this.popupMode ? null : this.foldersSidenavMenu;
    if (this.popupMode) {
      this.viewMenu.items[1].value = PeGridView.List;
      this.viewMenu.items[1].minItemWidth = 230;
    } else {
      this.viewMenu.items[1].value = PeGridView.BigListCover;
      this.viewMenu.items[1].minItemWidth = 290;
    }

    if (!this.popupMode) {
      this.pePlatformHeaderService.assignConfig({
        mainItem: {
          title: this.translateService.translate('contacts-app.sidebar.title'),
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
    }

    merge(
      this.deviceTypeChange$,
      this.toggleOpenStatus$,
      this.confirmationDialogOpener$,
      this.gridItems$,
      this.initFoldersTree$,
      this.getFoldersTree$,
      this.selectFolderListener$,
      this.foldersChangeListener$,
      this.folderEditor$,
      this.openEditor$,
      this.contactEditor$,
      this.createFolderListener$,
      this.gridSidenavToggle$,
      this.windowResizeListener$,
      this.selectedItems$,
    )
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  onMoreContentContextMenu({ menuItem }: PeGridItemContextSelect, gridItem: PeGridItem) {
    switch (menuItem?.value) {
      case ContextMenu.Approve:
        break;
      case ContextMenu.Deny:
        break;
      case ContextMenu.Delete:
        this.deleteGridItems([gridItem.id], []);
        break;
    }
  }

  public get showAddNewItem(): boolean {
    return this.selectedFolder?.isProtected ? false : true;
  }

  private startFolderId(): string {
    return (
      <string>this.peGridQueryParamsService.getQueryParamByName(GridQueryParams.SelectedFolder) ??
      this.peFoldersActionsService.lastSelectedFolderId ??
      null
    );
  }

  private restructureFoldersTree(folder: FolderItem, action: PeFoldersActionsEnum): void {
    const selectedFolderId = this.selectedFolder?._id ?? null;
    const isInSelectedFolder = folder.parentFolderId === selectedFolderId;
    const isExistingInGrid = this.gridItems.some(gridItem => gridItem.id === folder._id);

    let totalShift = 0;
    switch (action) {
      case PeFoldersActionsEnum.Create:
        totalShift = isInSelectedFolder ? 1 : 0;
        this.store.dispatch(new PeFoldersActions.Create(folder, selectedFolderId, APP_NAME));
        break;
      case PeFoldersActionsEnum.Update:
        totalShift = !isExistingInGrid && isInSelectedFolder ? 1 : isExistingInGrid && !isInSelectedFolder ? -1 : 0;
        this.store.dispatch(new PeFoldersActions.Update(folder, selectedFolderId, APP_NAME));
        break;
      case PeFoldersActionsEnum.Delete:
        totalShift = isExistingInGrid ? -1 : 0;
        this.store.dispatch(new PeFoldersActions.Delete(folder, APP_NAME));
        this.peFolderService.deleteNode$.next(folder._id);
        break;
    }
    this.paginator.total += totalShift;
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case SideNavMenuActions.NewFolder:
        const folder = this.translateService.translate('folders.action.create.new_folder');
        this.peFolderService.createFolder(folder);
        break;
      case SideNavMenuActions.NewHeadline:
        const headline = this.translateService.translate('folders.action.create.new_headline');
        this.peFolderService.createHeadline(headline);
        break;
      case SideNavMenuActions.Rules:
        this.contactsRulesService.openRules(this.theme);
        break;
    }
  }

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
  }

  private setGridItems(folder: FolderItem): void {
    this.isLoading$.next(true);
    const isRootFolder = !folder?._id;
    const folderId = folder?._id && folder?.isProtected ? 'default' : folder?._id ?? null;
    this.peFoldersApiService
      .getFolderItems(folderId, this.getSearchData())
      .pipe(
        tap(folderItems => {
          const { pagination_data, collection } = folderItems;
          const folderChildren = isRootFolder ? this.rootTree : collection.filter((collectionItem: any) => collectionItem.isFolder);
          const prevGridItems =
            pagination_data.page > 1 ? this.gridItems : this.peGridService.foldersToGridItemMapper(folderChildren);
          const items = collection.length
            ? this.contactsListService.contactsToGridItemMapper(collection.filter(
              (collectionItem: any) => !collectionItem.isFolder)
            )
            : [];
          const uniqItems = items.filter(item => {
            return !prevGridItems.some(gridItem => gridItem.id === item.id);
          });
          const gridItems = [...prevGridItems, ...uniqItems];
          this.paginator.page = pagination_data.page;
          this.paginator.total = pagination_data.total + folderChildren.length;
          if (gridItems.length) {
            this.store.dispatch(new PeGridItemsActions.OpenFolder(gridItems, APP_NAME));
          }
          this.isLoading$.next(false);
        }),
        takeUntil(this.destroy$),
      )
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
    this.peFoldersActionsService.folderAction(event, action).pipe(take(1), takeUntil(this.destroy$)).subscribe();
  }

  public onPositionsChanged(positions: FolderPosition[]): void {
    const selectedFolderId = this.selectedFolder?._id ?? null;
    this.peFoldersActionsService
      .onUpdatePositions(positions)
      .pipe(
        switchMap(() => this.peFoldersApiService.getFoldersTree()),
        tap((tree: FolderItem[]) => {
          this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, selectedFolderId, APP_NAME));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private loadItemAfterAction(): void {
    const numberOfgridItems = this.gridItems.filter(gridItem => gridItem.type === PeGridItemType.Item).length;
    const perPage = this.perPageCount();
    const currentPage = Math.floor(numberOfgridItems / perPage);
    this.paginator.perPage = perPage;
    this.paginator.page = currentPage;
    if (numberOfgridItems <= perPage) {
      this.scrolledToEnd();
    }
  }

  private perPageCount(): number {
    const items = Math.ceil((window.innerWidth / MIN_ITEM_WIDTH) * (window.innerHeight / MIN_ITEM_WIDTH));

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

  public optionsChange(option: OptionsMenu): void {
    switch (option) {
      case OptionsMenu.SelectAll:
        this.peGridService.selectedItems = this.gridItems;
        break;
      case OptionsMenu.DeselectAll:
        this.deselectAllItems();
        break;
      case OptionsMenu.Delete:
        if (this.peGridService.selectedItemsIds.length || this.peGridService.selectedFoldersIds.length) {
          this.showConfirmDialog(OptionsMenu.Delete);
        }
        break;
      case OptionsMenu.Duplicate:
        this.duplicateItems();
        this.deselectAllItems();
        break;
    }
  }

  private deselectAllItems(): void {
    this.peGridService.selectedItems = [];
  }

  private deleteGridItems(itemsIds: string[], foldersIds: string[]): void {
    if (itemsIds.length) {
      itemsIds.forEach(themeId => {
        this.deleteContact(themeId);
      });
    }
    if (foldersIds.length) {
      foldersIds.forEach(folderId => {
        const folderData = this.peFolderService.getFolderFromTreeById(this.rootTree, folderId);
        const folder: FolderItem = { _id: folderId, name: folderData.name, position: folderData.position };
        const event: FolderOutputEvent = { data: folder };
        this.folderAction(event, PeFoldersActionsEnum.Delete);
      });
    }
  }

  private deleteContact(contactId: string): void {
    this.contactsApiService
      .deleteContact(contactId)
      .pipe(
        tap(() => {
          this.store.dispatch(new PeGridItemsActions.DeleteItems([contactId], APP_NAME));
          this.paginator.total -= 1;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  public sortChange(sortingOrder: PeGridSortingInterface): void {
    this.sortingOrder = sortingOrder;
    this.paginator.page = 1;
    this.onSelectFolder(this.selectedFolder);
  }

  public viewChange(view: PeGridView): void {
    this.contactsListService.lastGridView = view;
  }

  public itemContextSelect(event: PeGridItemContextSelect): void {
    const { menuItem } = event;
    const action = menuItem.value;
    switch (action) {
      case ContextMenu.AddFolder:
        this.createFolder();
        break;
      case ContextMenu.Paste:
        this.paste();
        break;
    }
  }

  public createByHand(): void {
    this.openEditor();
  }

  public moveToFolder(event: MoveIntoFolderEvent): void {
    const { folder, moveItems } = event;
    if (moveItems?.length) {
      moveItems.forEach((moveItem: PeMoveToFolderItem) => {
        if (moveItem.type === PeGridItemType.Item) {
          if (!folder.isHeadline) {
            const moveItemId = moveItem.data.id.split('|')[0];
            this.peFoldersApiService.moveToFolder(moveItemId, folder._id).pipe(takeUntil(this.destroy$)).subscribe();
          }
        } else if (moveItem.type === PeGridItemType.Folder) {
          this.peFolderService.folderIntoFolder$.next({
            intoId: folder._id,
            moveId: moveItem.id,
          });
        }
        if (folder._id !== this.selectedFolder?._id) {
          this.store.dispatch(new PeGridItemsActions.DeleteItems([moveItem.id], APP_NAME));
        }
      });
    }
    this.paginator.total -= moveItems.length;
    this.deselectAllItems();
  }

  public dropIntoFolder(gridItem: PeGridItem): PeMoveToFolderItem[] {
    return [...new Set([...this.peGridService.selectedItems, gridItem])];
  }

  public actionClick(gridItem: PeGridItem): void {
    if (this.popupMode) {
      return;
    }

    if (gridItem.type === PeGridItemType.Folder) {
      this.selectedFolder = {
        _id: gridItem.id,
        name: gridItem.title,
        position: gridItem.data.position,
        children: gridItem.data.children,
      };
      this.onSelectFolder(this.selectedFolder);
    } else {
      this.openEditor(gridItem, null, true);
    }
  }

  private openEditor(gridItem?: PeGridItem, actionData?: PeFolderEditorActionDataInterface, isPreview?: boolean): void {
    const isFolder = !!actionData;
    const itemData = isFolder
      ? {
        ...actionData,
        item: gridItem,
        nextPosition: this.peFolderService.nextPosition,
      }
      : gridItem
        ? {
          item: gridItem,
          theme: this.theme,
          onSelectFolder: this.onSelectFolder$,
          onCreateFolder: this.onCreateFolder$,
        }
        : { theme: this.theme };
    const formTitle = isFolder
      ? gridItem?.title ?? this.translateService.translate('folders.folder_editor.create_folder')
      : gridItem?.title ?? this.translateService.translate('contacts-app.contact_editor.create_contact');
    const component = isFolder ? PeFolderEditorComponent : isPreview ? ContactsWidgetComponent : ContactComponent;
    const saveSubject$ = isFolder
      ? this.saveFolderSubject$
      : isPreview
        ? this.editContactSubject$
        : this.saveContactSubject$;
    const backBtnCallback = isPreview
      ? () => this.peOverlayRef.close()
      : () => {
        this.showConfirmDialog(null, gridItem ? gridItem : null, isFolder);
      };
    const doneBtnCallback = isPreview ? () => this.peOverlayRef.close() : () => { };
    const config: PeOverlayConfig = {
      backdropClass: 'settings-backdrop',
      backdropClick: backBtnCallback,
      data: itemData,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: backBtnCallback,
        backBtnTitle: this.translateService.translate('contacts-app.actions.cancel'),
        doneBtnCallback: doneBtnCallback,
        doneBtnTitle: this.translateService.translate('contacts-app.actions.save'),
        onSaveSubject$: saveSubject$,
        removeContentPadding: !isFolder && !isPreview,
        theme: this.theme,
        title: formTitle,
      },
      component: component,
    };

    this.onClosedDialogSubject$.pipe(
      switchMap(() => {
          return (config.data.customFields && config.data.customFields.length > 0)
            ? forkJoin(
                config.data.customFields
                  .filter(field => !field.showDefault && !itemData.item?.id)
                  .map(field =>
                    this.fieldsService.deleteField(this.envService.businessId, field._id)
                  )
              )
            : EMPTY;
        }),
        takeUntil(this.destroy$),
    ).subscribe();

    this.peOverlayRef = this.peOverlayWidgetService.open(config);
  }

  private showConfirmDialog(event: ContextMenu | OptionsMenu, gridItem?: PeGridItem, isFolder?: boolean, data: any = null): void {
    let headings = null;
    switch (event) {
      case ContextMenu.Delete:
      case OptionsMenu.Delete:
        headings = this.delete();
        break;
      default:
        headings = this.close(gridItem, isFolder);
        break;
    }

    this.confirmScreenService.show(headings, false);
  }

  private close(gridItem: PeGridItem, isFolder: boolean): Headings {
    const editing = !!gridItem;
    this.contactsListService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.onClosedDialogSubject$.next();
          this.peOverlayRef.close();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    const title = !isFolder
      ? editing
        ? 'contacts-app.confirm_dialog.cancel.contact_editor.editing.title'
        : 'contacts-app.confirm_dialog.cancel.contact_editor.creating.title'
      : editing
        ? 'folders.confirm_dialog.cancel.folder_editor.editing.title'
        : 'folders.confirm_dialog.cancel.folder_editor.creating.title';
    const subtitle = !isFolder
      ? editing
        ? 'contacts-app.confirm_dialog.cancel.contact_editor.editing.subtitle'
        : 'contacts-app.confirm_dialog.cancel.contact_editor.creating.subtitle'
      : editing
        ? 'folders.confirm_dialog.cancel.folder_editor.editing.subtitle'
        : 'folders.confirm_dialog.cancel.folder_editor.creating.subtitle';

    return {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.closeBtn,
      declineBtnText: this.cancelBtn,
    };
  }

  private delete(): Headings {
    const itemsIds = this.peGridService.selectedItemsIds;
    const foldersIds = this.peGridService.selectedFoldersIds;
    this.contactsListService.confirmation$
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.deleteGridItems(itemsIds, foldersIds);
          this.deselectAllItems();
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();

    const deleteFolders = 'folders.confirm_dialog.delete.';
    const deletePlans = 'contacts-app.confirm_dialog.delete.';
    const itemsTitle = itemsIds.length
      ? itemsIds.length > 1
        ? `${deletePlans}contacts.title`
        : `${deletePlans}contact.title`
      : null;
    const foldersTitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.title`
        : `${deleteFolders}folder.title`
      : null;
    const title = itemsTitle && foldersTitle ? `${deletePlans}items.title` : !!itemsTitle ? itemsTitle : foldersTitle;
    const itemsSubtitle = itemsIds.length
      ? itemsIds.length > 1
        ? `${deletePlans}contacts.subtitle`
        : `${deletePlans}contact.subtitle`
      : null;
    const foldersSubtitle = foldersIds.length
      ? foldersIds.length > 1
        ? `${deleteFolders}folders.subtitle`
        : `${deleteFolders}folder.subtitle`
      : null;
    const subtitle =
      itemsSubtitle && foldersSubtitle
        ? `${deletePlans}items.subtitle`
        : !!itemsSubtitle
          ? itemsSubtitle
          : foldersSubtitle;

    return {
      title: this.translateService.translate(title),
      subtitle: this.translateService.translate(subtitle),
      confirmBtnText: this.deleteBtn,
      declineBtnText: this.cancelBtn,
    };
  }

  public onItemContentContextMenu(event: PeGridItemContextSelect): void {
    const { gridItem, menuItem } = event;
    const action = menuItem.value;
    switch (action) {
      case ContextMenu.Edit:
        this.edit(gridItem);
        break;
      case ContextMenu.Copy:
        this.copy(gridItem);
        break;
      case ContextMenu.Paste:
        this.paste();
        break;
      case ContextMenu.Duplicate:
        this.duplicate(gridItem);
        break;
      case ContextMenu.Delete:
        this.peGridService.selectedItems = [gridItem];
        this.showConfirmDialog(ContextMenu.Delete);
        break;
      case ContextMenu.AddFolder:
        this.createFolder();
        break;
    }
  }

  private createFolder(): void {
    const actionData: PeFolderEditorActionDataInterface = {
      actionType: PeFoldersActionsEnum.Create,
      activeItem: this.selectedFolder,
    };
    this.openEditor(null, actionData);
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
    this.changePasteMenuItemStatus(this.itemContextMenu, ContextMenu.Copy);
    this.changePasteMenuItemStatus(this.viewportContextMenu, ContextMenu.Copy);
  }

  private paste(): void {
    const gridItem: PeGridItem = this.copiedItem;

    if (gridItem.type == PeGridItemType.Folder) {
      this.peFolderService.duplicateFolder$.next(gridItem.id);
    } else {
      const folderId = this.selectedFolder?._id ?? null;
      const gridItemId = gridItem.id;
      this.contactsApiService
        .copyContacts(folderId, [gridItemId])
        .pipe(
          tap(contacts => {
            const contactItem: ContactMainInfo = getContactDisplayFields(contacts[0]);
            const copiedItem = this.contactsListService.contactsToGridItemMapper([contactItem])[0];
            this.paginator.total += 1;
            this.store.dispatch(new PeGridItemsActions.AddItem(copiedItem, APP_NAME));
          }),
          takeUntil(this.destroy$),
        )
        .subscribe();
    }

    this.copiedItem = null;
    this.changePasteMenuItemStatus(this.itemContextMenu, ContextMenu.Paste);
    this.changePasteMenuItemStatus(this.viewportContextMenu, ContextMenu.Paste);
  }

  private changePasteMenuItemStatus(menu: PeGridMenu, action: ContextMenu): void {
    const { items } = menu;
    if (items.length) {
      const pasteItem = items.find(menuItem => {
        return menuItem.value === ContextMenu.Paste;
      });
      if (action === ContextMenu.Copy) {
        pasteItem.disabled = false;
      } else if (action === ContextMenu.Paste) {
        pasteItem.disabled = true;
      }
    }
  }

  private duplicateItems(): void {
    const folderIds = this.peGridService.selectedFoldersIds;
    const itemIds = this.peGridService.selectedItemsIds;
    if (itemIds.length) {
      itemIds.forEach(itemId => {
        this.copiedItem = {
          columns: [],
          id: itemId,
          image: '',
          title: '',
          type: PeGridItemType.Item,
        };
        this.paste();
      });
    }
    if (folderIds.length) {
      folderIds.forEach(folderId => this.peFolderService.duplicateFolder$.next(folderId));
    }
  }

  private duplicate(gridItem: PeGridItem): void {
    this.copy(gridItem);
    this.paste();
  }

  private selectImportFile(type: FileType, payload: any): void {
    this.overwriteExistingStream$.next(payload.overwrite);
    if (type === FileType.CSV && this.csvFileInput) {
      this.csvFileInput.nativeElement.click();
    } else if (type === FileType.XML && this.xmlFileInput) {
      this.xmlFileInput.nativeElement.click();
    }
  }

  public onExport(event: any): void {
    const fileList: FileList = event.target.files;
    const file: File = fileList.item(0);
    if (file) {
      this.mediaService
        .uploadFile(file)
        .pipe(
          filter(result => result instanceof HttpResponse),
          switchMap((result: HttpResponse<{ id: string; url: string }>) => {
            return this.importApiService.importFromFile(
              this.envService.businessId,
              result.body.url,
              this.overwriteExistingStream$.value,
            );
          }),
          tap(() => {
            const notify = this.translateService.translate('contacts-app.messages.upload_process');
            this.snackbarService.toggle(true, {
              content: notify,
              duration: 2500,
              iconColor: '#00B640',
              iconId: 'icon-commerceos-success',
              iconSize: 24,
            });
          }),
          catchError(error => {
            const errorMsg = error.error?.message
              ? `${this.translateService.translate('contacts-app.error')}: ${error.error?.message}`
              : this.translateService.translate('contacts-app.messages.upload_failed');
            this.apmService.apm.captureError(errorMsg);

            return of(error);
          }),
          takeUntil(this.destroy$),
        )
        .subscribe();
    }
  }
}
