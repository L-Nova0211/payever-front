import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnChanges,
  OnDestroy,
  OnInit,
  Optional,
  SimpleChanges,
} from '@angular/core';
import { Store } from '@ngxs/store';
import { BehaviorSubject, EMPTY, forkJoin, fromEvent, merge, of, Subject } from 'rxjs';
import {
  catchError,
  delay,
  filter,
  map,
  pairwise,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { AppType, APP_TYPE, PeDestroyService, PePreloaderService } from '@pe/common';
import {
  FolderItem,
  FolderOutputEvent,
  FolderPosition,
  FolderService,
  PeFoldersActionsEnum,
  PeFoldersActionsService,
} from '@pe/folders';
import {
  PeFoldersActions,
  PeGridItemsActions,
  PeGridMenuItem,
  PeGridService,
  PeGridSidenavService,
  PeGridState,
  PeGridStoreActions,
} from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PePlatformHeaderConfig, PePlatformHeaderService } from '@pe/platform-header';

import { liveChatFoldersMock, liveChatRootFolderMock } from '../../chat-folders.mock';
import { PeMessageSideNavMenuActions, PeMessageSidenavsEnum } from '../../enums';
import {
  PeMessageActiveFolderInterface,
  PeMessageConversationListConfig,
} from '../../interfaces';
import {
  MessageRuleService,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageConversationService,
  PeMessageIntegrationService,
  PeMessageNavService,
  PeMessageService,
} from '../../services';

import { PE_MESSAGE_FOLDERS_MENU } from './message-nav-menu.constant';

@Component({
  selector: 'pe-message-nav',
  templateUrl: './message-nav.component.html',
  styleUrls: ['./message-nav.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, PeGridService],
})
export class PeMessageNavComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {

  @Input() mobileView = false;
  @Input() isLiveChat = false;
  @Input() isEmbedChat = false;
  @Input() theme;

  public readonly rootFolder: FolderItem = {
    _id: null,
    children: [],
    image: this.peMessageNavService.defaultFolderIcon,
    name: this.translateService.translate('message-app.sidebar.all_messages'),
    position: 0,
  };

  private readonly setFolderAsActive$ = new BehaviorSubject<PeMessageActiveFolderInterface>({
    _id: this.rootFolder._id,
    isActiveRootFolder: true,
  });

  public readonly activeFolder$ = this.setFolderAsActive$
    .pipe(
      pairwise(),
      filter(([prevFolder, currFolder]) => {
        (window.innerWidth <= 720 || this.isEmbedChat || this.isLiveChat)
        && prevFolder && this.peGridSidenavService.toggleOpenStatus$.next(false);

        return prevFolder && prevFolder._id !== currFolder._id;
      }),
      map(([prevFolder, currFolder]) => currFolder));

  public readonly isLoading$ = this.peMessageConversationService.isLoading$;
  private readonly isFoldersLoading$ = new BehaviorSubject<boolean>(true);

  public readonly folderActions = PeFoldersActionsEnum;
  public rootTree: FolderItem[] = [];
  public selectedFolder: FolderItem;
  public readonly sidenavMenu = !this.isEmbedMode
    ? PE_MESSAGE_FOLDERS_MENU
    : null;

  public readonly folderTree$ = new Subject<FolderItem[]>();
  private readonly onSelectFolder$ = new Subject<FolderItem>();
  private readonly foldersChangeListener$ = this.peFoldersActionsService.folderChange$
    .pipe(
      tap(({ folder, action }) => {
        this.restructureFoldersTree(folder, action);
      }));

  private readonly selectFolderListener$ = this.onSelectFolder$
    .pipe(
      filter(Boolean),
      switchMap((folder: FolderItem) => {
        this.selectedFolder = folder;
        this.peFolderService.selectedFolder = folder;
        this.peFoldersActionsService.lastSelectedFolderId = folder._id;
        this.peMessageNavService.activeFolder = { _id: folder._id };
        const folderToActive: PeMessageActiveFolderInterface = {
          _id: folder._id,
          isActiveRootFolder: folder._id === this.rootFolder._id,
        };
        this.setFolderAsActive$.next(folderToActive);

        return folder._id === this.rootFolder._id
          ? (
            this.peMessageService.isLiveChat
              ? this.peMessageChatRoomListService.chatList$
              : this.peMessageChatRoomListService.getConversationList(this.conversationListConfig)
          )
          : EMPTY;
      }),
      filter(conversationList => conversationList?.length >= 0),
      tap((conversationList) => {
        const gridItems = this.peMessageConversationService.conversationToGridItemMapper(conversationList);
        this.store.dispatch(new PeGridItemsActions.OpenFolder(gridItems, this.appType));
        this.peMessageConversationService.isLoading$.next(false);
        const { checkForInvitation$ } = this.peMessageConversationService;
        !checkForInvitation$.value && checkForInvitation$.next(true);
      }));

  private readonly toggleSidenavStatus$ = this.peGridSidenavService.toggleOpenStatus$
    .pipe(
      tap((active: boolean) => {
        !this.isLiveChat && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].value
          && this.pePlatformHeaderService.toggleSidenavActive(PeMessageSidenavsEnum.Folders, active);
        this.cdr.detectChanges();
      }));

  private readonly windowResize$ = fromEvent(window, 'resize')
    .pipe(
      map(() => window.innerWidth <= 720),
      pairwise(),
      tap(([prev, curr]) => {
        prev !== curr && this.changeHeaderConfig(curr);
        prev !== curr && !curr && this.peGridSidenavService
          .sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(true);
      }));

  constructor(
    private cdr: ChangeDetectorRef,
    private store: Store,

    @Inject(APP_TYPE) private appType: AppType,
    private peFoldersActionsService: PeFoldersActionsService,
    private peFolderService: FolderService,
    private peGridService: PeGridService,
    private peGridSidenavService: PeGridSidenavService,
    @Optional() private pePlatformHeaderService: PePlatformHeaderService,
    private pePreloaderService: PePreloaderService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private messageRuleService: MessageRuleService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageNavService: PeMessageNavService,
    private peMessageService: PeMessageService,
  ) {
    (window as any)?.PayeverStatic?.IconLoader?.loadIcons([
      'widgets',
    ]);

    (window as any)?.PayeverStatic?.SvgIconsLoader?.loadIcons([
      'file-14',
      'social-whatsapp-12',
      'social-telegram-18',
      'social-instagram-12',
    ]);

    this.pePreloaderService.startLoading(this.appType);
    this.pePreloaderService.initFinishObservers([
      this.isLoading$,
      this.isFoldersLoading$,
    ], this.appType);
  }

  public get isEmbedMode(): boolean {
    return this.peMessageService.isLiveChat || this.peMessageService.isEmbedChat;
  }

  public get isNotMobile(): boolean {
    return window.innerWidth > 720;
  }

  private get conversationListConfig(): PeMessageConversationListConfig {
    return { todo: this.peMessageService.isEmbedChat ? this.peMessageService.app : null };
  }

  public get getSelectedFolder(): FolderItem {
    return this.selectedFolder?._id === this.rootFolder._id ? null : this.selectedFolder;
  }

  private get startFolderId(): string {
    return this.peFoldersActionsService.lastSelectedFolderId;
  }

  ngOnDestroy(): void {
    this.peMessageNavService.destroy();
    this.pePlatformHeaderService.removeSidenav(PeMessageSidenavsEnum.Folders);
    this.store.dispatch(new PeGridStoreActions.Clear(this.appType));
  }

  ngOnInit(): void {
    const { isEmbedChat, isLiveChat } = this.peMessageService;
    !isEmbedChat && !isLiveChat && this.addMobileHeader();
    this.store.dispatch(new PeGridStoreActions.Create(this.appType));

    const setFoldersTree$ = this.store
      .select(PeGridState.folders(this.appType))
      .pipe(tap(this.setRootTree));

    const initFolderTreeArr = isLiveChat
      // TODO: will need to replace mock by BE changes
      ? [
        of(liveChatFoldersMock as FolderItem[]).pipe(delay(10)),
        of(liveChatRootFolderMock as FolderItem),
      ]
      : [
        this.peMessageApiService.getFolderTree()
          .pipe(map(tree => tree.filter((folder: any) => folder.scope !== 'default'))), //temporary solution
        this.peMessageApiService.getRootFolder()
          .pipe(catchError(err => of({ _id: null }))),
      ];

    const initFolderTree$ = forkJoin(initFolderTreeArr).pipe(
      switchMap(([folderTree, rootFolder]) => this.initFolders(folderTree, rootFolder)),
      take(1),
      tap(() => {
        this.onSelectFolder(this.selectedFolder);
        this.isFoldersLoading$.next(false);
      })
    );

    merge(
      initFolderTree$,
      this.foldersChangeListener$,
      this.selectFolderListener$,
      setFoldersTree$,
      this.toggleSidenavStatus$,
      this.windowResize$,
    ).pipe(takeUntil(this.destroy$)).subscribe();

    // embed could be used like popup with todo inside commerceos
    if (isEmbedChat && !isLiveChat) {
      this.peMessageChatRoomListService.getConversationList(this.conversationListConfig).subscribe();
      // this.peMessageNavService.setFolderTree = TODOFoldersMock;
      // this.peMessageNavService.activeFolder = this.peMessageNavService.folderList[0];
      this.isFoldersLoading$.next(false);
      this.cdr.detectChanges();
    }

    this.peMessageConversationService.activeConversation$
      .pipe(
        withLatestFrom(this.activeFolder$),
        filter(([converation,activeFolder]) => {
          if (activeFolder._id === this.rootFolder._id ||
             converation.data?.locations?.some(loc => loc.folderId === activeFolder._id)){
            return false;
          }

          return true;
        }),
        tap(() =>this.onSelectFolder(this.rootFolder)),
        takeUntil(this.destroy$),
      )
      .subscribe();

    this.peGridService.theme  = this.theme;
    this.messageRuleService.initRuleListener().pipe(
      takeUntil(this.destroy$)
    ).subscribe();

    this.cdr.detectChanges();
  }

  ngAfterViewInit(): void {
    (window.innerWidth <= 720 || this.isEmbedChat || this.isLiveChat)
      && this.peGridSidenavService.toggleOpenStatus$.next(false);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes.theme?.currentValue) {
      this.peGridService.theme  = changes.theme?.currentValue;
      this.cdr.detectChanges();
    }
  }

  private initFolders(folderTree, rootFolder) {
    this.setRootTree(folderTree);
    this.folderTree$.next(folderTree);
    this.rootFolder._id = rootFolder._id;
    const selectedFolderId = this.startFolderId ?? rootFolder._id;
    this.selectedFolder = this.peFolderService
      .getFolderFromTreeById(folderTree, selectedFolderId, this.rootFolder);
    this.store.dispatch(new PeFoldersActions.InitFoldersTree(folderTree, selectedFolderId, this.appType));

    return this.store.select(PeGridState.folders(this.appType));
  }

  private addMobileHeader(): void {
    this.pePlatformHeaderService.assignSidenavItem({
      name: PeMessageSidenavsEnum.Folders,
      active: this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate(PeMessageSidenavsEnum.Folders),
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
    });

    this.changeHeaderConfig(window.innerWidth <= 720);
  }

  private changeHeaderConfig(isMobile: boolean): void {
    this.pePlatformHeaderService.assignConfig({
      isShowDataGridToggleComponent: !isMobile,
      isShowMobileSidenavItems: isMobile,
      isShowSubheader: isMobile,
    } as PePlatformHeaderConfig);
  }

  private restructureFoldersTree(folder: FolderItem, action: PeFoldersActionsEnum): void {
    const selectedFolderId = this.selectedFolder._id;

    switch (action) {
      case PeFoldersActionsEnum.Create:
        this.store.dispatch(new PeFoldersActions.Create(folder, selectedFolderId, this.appType));
        break;
      case PeFoldersActionsEnum.Update:
        this.store.dispatch(new PeFoldersActions.Update(folder, selectedFolderId, this.appType));
        break;
      case PeFoldersActionsEnum.Delete:
        this.store.dispatch(new PeFoldersActions.Delete(folder, this.appType));
        this.peFolderService.deleteNode$.next(folder._id);
        break;
    }
  }

  private readonly setRootTree = (folders: FolderItem[]) => {
    this.rootTree = folders
      ? folders.filter(folder => folder
          && folder.parentFolderId === this.rootFolder._id
          && !folder.isProtected)
      : [];

    this.rootTree.forEach((folder, index, item) => {
        if (folder.isHeadline) {
          let childs: FolderItem[] = folder.children;
          item.splice(index, 1);
          this.rootTree = this.rootTree.concat(childs);
        }
    });

    this.peMessageNavService.setFolderTree = this.rootTree;
  }

  public folderAction(event: FolderOutputEvent, action: PeFoldersActionsEnum): void {
    const { data } = event;
    const prepareFolder = (folder: FolderItem<any>) => {
      if (action === PeFoldersActionsEnum.Delete) {
        folder._id === this.selectedFolder._id && this.onSelectFolder$.next(this.rootFolder);
      } else {
        folder.image = this.peMessageNavService.defaultFolderIcon;
        folder.parentFolderId = folder.parentFolderId ?? this.rootFolder._id;
      }
    };

    data && prepareFolder(data);
    this.peFoldersActionsService.folderAction(event, action)
      .pipe(
        take(1),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public menuItemSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case PeMessageSideNavMenuActions.Folder:
        const folder = this.translateService.translate('folders.action.create.new_folder');
        this.peFolderService.createFolder(folder);
        break;
      case PeMessageSideNavMenuActions.Headline:
        const headline = this.translateService.translate('folders.action.create.new_headline');
        this.peFolderService.createHeadline(headline);
        break;
      case PeMessageSideNavMenuActions.Rules:
        this.messageRuleService.openRules(this.theme);
        break;
    }
  }

  public onPositionsChanged(positions: FolderPosition[]): void {
    this.peFoldersActionsService.onUpdatePositions(positions)
      .pipe(
        switchMap(() => this.peMessageApiService.getFolderTree()),
        tap((tree: FolderItem[]) => {
          this.store.dispatch(new PeFoldersActions.InitFoldersTree(tree, this.selectedFolder._id, this.appType));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public onSelectFolder(folder: FolderItem): void {
    this.onSelectFolder$.next(folder);
  }
}
