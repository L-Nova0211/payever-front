import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  Inject,
  Input,
  OnDestroy,
  OnInit, Optional, ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, combineLatest, EMPTY, forkJoin, merge, Observable, of, Subject } from 'rxjs';
import {
  filter,
  map,
  mapTo,
  pairwise,
  skip,
  startWith,
  switchMap,
  take,
  takeUntil,
  tap,
  withLatestFrom,
} from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import {
  AppThemeEnum,
  AppType,
  EnvironmentConfigInterface,
  getAbbreviation,
  PeDestroyService,
  PeGridItem,
  PeGridItemType,
  PE_ENV, APP_TYPE,
} from '@pe/common';
import {
  ConfirmScreenService,
  Headings,
  PeConfirmationScreenIconInterface,
  PeConfirmationScreenIconTypesEnum,
} from '@pe/confirmation-screen';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { FolderItem, MoveIntoFolderEvent, PeMoveToFolderItem } from '@pe/folders';
import { PeGridItemsActions, PeGridMenuItem, PeGridService, PeGridSidenavService, PeGridState } from '@pe/grid';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PePlatformHeaderService } from '@pe/platform-header';
import {
  PeChatMessage,
  PeMessageChat,
  PeMessageChatType,
  PeMessageChatTypingUser,
  PeMessageContact,
  PeChatMessageStatus,
} from '@pe/shared/chat';
import { SnackbarConfig, SnackbarService } from '@pe/snackbar';

import {
  PeMessageConversationActionsEnum,
  PeMessageConversationListActionsEnum,
  PeMessageGuardRoles,
  PeMessageSidenavsEnum,
  PeMessageWebSocketEvents,
  PeMessageWebsocketType,
} from '../../enums';
import {
  PeMessageWebSocketIncludedDTO,
  PeMessageWebSocketExcludedDTO,
  PeMessageWebSocketMemberChanged,
  PeMessageActiveFolderInterface,
  PeMessageConversationLocationInterface,
  PeMessageChatDeleteData,
} from '../../interfaces';
import {
  MessageStateService,
  PeMessageApiService,
  PeMessageChatRoomListService,
  PeMessageConversationService,
  PeMessageGuardService,
  PeMessageIntegrationService,
  PeMessageInvitationApiService,
  PeMessageNavService,
  PeMessageService,
  PeMessageWebSocketService,
  PeMessageManagementService,
  MessageChatDialogService,
} from '../../services';
import { PeCreatingChatFormComponent } from '../chat';
import {
  PeMessageConversationEmptyListInterface,
  PE_MESSAGE_CONVERSATION_LIST_MENU,
  PE_MESSAGE_CONVERSATION_MENU,
} from '../conversation-list';
import { PeMessageFolderTreeComponent } from '../message-folder-tree';

@Component({
  selector: 'pe-message-conversations',
  templateUrl: './conversations.component.html',
  styleUrls: ['./conversations.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, PeGridService],
})
export class PeMessageConversationsComponent implements OnInit, OnDestroy, AfterViewInit {
  @SelectSnapshot(DockerState.dockerItems) private dockerItems: DockerItemInterface[];

  @Input() set activeFolder(folder: PeMessageActiveFolderInterface) {
    this.activeFolder$.next(folder);
  }

  @ViewChild('deleteForEveryOneTemplate', { static: true }) deleteForEveryOneTemplateRef;
  @Input() public theme = AppThemeEnum.default;
  @Input() isEmbedChat = false;
  @Input() isLiveChat = false;

  public mobileView = false;
  public sidenavName = PeMessageSidenavsEnum.ConversationList;

  private readonly filterConversationList$ = new BehaviorSubject<string>('');
  public readonly activeFolder$ = new BehaviorSubject<PeMessageActiveFolderInterface>(null);
  public readonly isLoading$ = this.peMessageConversationService.isLoading$;
  public peChatMessage: PeMessageChat[] = [];
  private isUserLeave = false;
  private isUserDeletedChat = false;
  public readonly conversationListMenu = !this.isEmbedMode
    ? PE_MESSAGE_CONVERSATION_LIST_MENU
    : null;

  public readonly conversationContextMenu = !this.isEmbedMode
    ? PE_MESSAGE_CONVERSATION_MENU
    : null;

  public readonly emptyListStatus$ = new BehaviorSubject<PeMessageConversationEmptyListInterface>({
    hideList: false,
    listEmpty: false,
  });

  private conversationList: PeGridItem<PeMessageChat>[] = [];

  private readonly gridItems$ = this.store.select(PeGridState.gridItems(this.appType))
    .pipe(
      skip(3),
      startWith([]),
      map(gridItems => (gridItems || []).filter(gridItem => gridItem.type === PeGridItemType.Item)),
      map(gridItems => this.peMessageConversationService.sortByLatestMessage(gridItems)),
      tap((gridItems) => {
        this.conversationList = cloneDeep(gridItems);
        const activeChatId = this.peMessageConversationService.rememberedConversation();
        if (gridItems.length > 0 && activeChatId) {
          window.innerWidth <= 720 && this.peGridSidenavService
            .sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
        }
        const conversationId = this.peMessageConversationService.getConversationIdFromLS();
        if (conversationId && this.conversationList.length) {
          const currentConversation = this.conversationList.find(conversation => conversation.id === conversationId);
          if(!currentConversation) {
            return
          };
           this.actionClick(currentConversation);
        }
        this.peMessageConversationService.conversationList$.next(this.conversationList);
      }));

  public readonly conversationList$ = combineLatest([
    this.activeFolder$,
    this.filterConversationList$,
    this.gridItems$,
  ]).pipe(
    map(([folder, filter, gridItems]) => {
      const parentFolderId = folder && !folder.isActiveRootFolder ? folder._id : null;
      const conversationList = gridItems.filter((conversation) => {
        return !parentFolderId || conversation.data.locations?.some(({ folderId }) => folderId === parentFolderId);
      });
      const menuItem = PE_MESSAGE_CONVERSATION_MENU.items
        .find(menuItem => menuItem.value === PeMessageConversationActionsEnum.ExcludeFromFolder);
      menuItem.hidden = folder?.isActiveRootFolder;

      const filteredConversationList = conversationList
        .filter(conversation => conversation.title.toLowerCase().includes(filter.toLowerCase()));

      const emptyListStatus: PeMessageConversationEmptyListInterface = {
        hideList: !!filteredConversationList.length,
        listEmpty: !conversationList.length,
      };

      this.emptyListStatus$.next(emptyListStatus);

      return { conversationList: filteredConversationList };
    }));

  private readonly setConversationAsActive$ = this.peMessageConversationService.setConversationAsActiveById$
    .pipe(
      tap((conversationToActiveId) => {
        this.setConversationAsActiveById(conversationToActiveId);
      }));

  private readonly handleChatCreated$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_CREATED)
    .pipe(
      switchMap((chat: PeMessageChat) => this.disableAddingChat(chat) ? EMPTY : this.addConversationToList(chat)));

  private readonly handleChatDeleted$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_DELETED)
    .pipe(
      startWith({ _id: null }),
      pairwise(),
      filter(([prevDeletedChat, currDeletedChat]) => prevDeletedChat._id !== currDeletedChat._id),
      map(([prevDeletedChat, currDeletedChat]) => currDeletedChat),
      switchMap((deletedChat: PeMessageChat) => {
        return this.store
          .dispatch(new PeGridItemsActions.DeleteItems([deletedChat._id], this.appType))
          .pipe(mapTo(deletedChat._id));
      }),
      tap((deletedChatId) => {
        this.setConversationAsActiveById(deletedChatId);
      }));

  private readonly handleChatUpdated$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_UPDATED)
    .pipe(
      tap((updatedConversation: PeMessageChat) => {
        const { activeChat } = this.peMessageChatRoomListService;
        const isActiveConversationUpdated = activeChat?._id === updatedConversation._id;
        const indexOfUpdatedConversation = this.conversationList
          .findIndex(conversation => conversation.id === updatedConversation._id);
        const conversationToUpdate = isActiveConversationUpdated
          ? activeChat
          : indexOfUpdatedConversation !== -1
            ? this.conversationList[indexOfUpdatedConversation].data
            : null;

        if (conversationToUpdate) {
          conversationToUpdate.avatar = this.peMessageChatRoomListService.getContactAvatar(updatedConversation);
          conversationToUpdate.description = updatedConversation.description;
          conversationToUpdate.initials = this.peMessageChatRoomListService.getContactInitials(updatedConversation);
          conversationToUpdate.permissions = updatedConversation.permissions;
          conversationToUpdate.shown = true;
          conversationToUpdate.subType = updatedConversation.subType;
          conversationToUpdate.title = this.peMessageChatRoomListService.getTitle(updatedConversation);
          conversationToUpdate.usedInWidget = updatedConversation.usedInWidget;

          const gridItem = this.peMessageConversationService.conversationToGridItemMapper([conversationToUpdate])[0];
          this.store.dispatch(new PeGridItemsActions.EditItem(gridItem, this.appType));
        }

        if (isActiveConversationUpdated) {
          this.peMessageChatRoomListService.activeChat = conversationToUpdate;
        }
      }));

  private readonly handleChatMemberChanged$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_CHANGED)
    .pipe(
      switchMap((chatInfo: PeMessageWebSocketMemberChanged) => forkJoin([
        of(chatInfo),
        this.peMessageApiService.getConversation(chatInfo.chatId, chatInfo.chatType),
        this.peMessageApiService.getConversationMembers(chatInfo.chatType as PeMessageChatType, chatInfo.chatId),
      ])),
      map(([chatInfo, chatReponse, membersInfo]) => {
        this.peMessageChatRoomListService.chatList = this.peMessageChatRoomListService.chatList
          .map(_chat => this.changeMemberInfoInChat(_chat, chatInfo, membersInfo));

        const activeChat = this.changeMemberInfoInChat(chatReponse, chatInfo, membersInfo);
        this.setConversationAsActiveById(activeChat._id);
      }));

  private readonly handleChatMemberExcluded$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED)
    .pipe(
      switchMap((dataExcluded: PeMessageWebSocketExcludedDTO) => {
        let gridItem = this.conversationList.find(conversation => conversation.id === dataExcluded.userData.chatId);
        gridItem.data.members = gridItem.data.members
          .filter((member) => member.user !== dataExcluded.userData.member.user);
        this.store.dispatch(new PeGridItemsActions.EditItem(gridItem, this.appType));

        const { activeChat } = this.peMessageChatRoomListService;
        if (activeChat) {
          activeChat.members = gridItem.data.members;
          activeChat.membersInfo = activeChat.membersInfo
            .filter((memberInfo) => memberInfo.user._id !== dataExcluded.userData.member.user);

          this.peMessageChatRoomListService.activeChat = this.isUserLeave ? null : activeChat;
        }

        return EMPTY;
      })
    )

  private readonly handleChatMemberIncluded$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_INCLUDED)
    .pipe(
      switchMap((dataIncluded: PeMessageWebSocketIncludedDTO) => {
        if (dataIncluded.chat?.initials === undefined){
          dataIncluded.chat.initials = this.peMessageChatRoomListService.getContactInitials(dataIncluded.chat);
        }
        this.peMessageChatRoomListService.memberIncluded(dataIncluded);

        const gridItem = this.peMessageConversationService
          .conversationToGridItemMapper([dataIncluded.chat])[0];
        this.store.dispatch(new PeGridItemsActions.EditItem(gridItem, this.appType));

        const { activeChat } = this.peMessageChatRoomListService;
        if (activeChat) {
          const isIncludedToActiveConversation = activeChat._id === dataIncluded.chat._id;
          const isExistingConversation = this.conversationList
            .some(conversation => conversation.id === dataIncluded.chat._id);
          const includeMemberToActiveConversation$ = this.peMessageChatRoomListService
            .addMemberInfoToConversation(dataIncluded.chat)
            .pipe(
              tap((conversationWithIncludedMember) => {
                this.peMessageChatRoomListService.activeChat = conversationWithIncludedMember;
              }));

          return !isExistingConversation
            ? this.addConversationToList(dataIncluded.chat)
            : isIncludedToActiveConversation
              ? includeMemberToActiveConversation$
              : EMPTY;
        } else {
          const isExistingConversation = this.conversationList
            .some(conversation => conversation.id === dataIncluded.chat._id);

          return !isExistingConversation
            ? this.addConversationToList(dataIncluded.chat)
            : EMPTY;
        }
      }));

  private readonly handleContactCreated$ = this.peMessageWebSocketService
    .handleSubjectObservable(PeMessageWebSocketEvents.CONTACT_CREATED)
    .pipe(
      tap((contact: PeMessageContact) => {
        this.peMessageService.contactList.push(contact);
      }));

  private readonly handleMessage$ = merge(
    this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_DELETED),
    this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_POSTED),
    this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_UPDATED),
  ).pipe(
    tap((messageToHandle: PeChatMessage) => {
      const gridItem = this.conversationList.find(conversation => conversation.id === messageToHandle.chat);
      const conversation = gridItem.data;
      const messageHandler = (messages) => {
        switch (messageToHandle.status) {
          case PeChatMessageStatus.DELETED:
            this.messageStateService.messageDeleted(messageToHandle);
            messages = messages.filter(message => message._id !== messageToHandle._id);
            gridItem.data.messages = messages;
            gridItem.data.messages = messages;
            break;
          default:
            const messageIndex = messages.findIndex(message => message._id === messageToHandle._id);
            if (messageIndex !== -1) {
              messages[messageIndex] = messageToHandle;
              this.messageStateService.messageUpdated(messageToHandle);
            } else {
              messages.push(messageToHandle);
              this.messageStateService.messagePosted(messageToHandle);
              conversation.updatedAt = messageToHandle.updatedAt;
            }
            if (conversation.draft && conversation.draft.sender === messageToHandle.sender) {
              conversation.draft = null;
            }
            break;
        }
      };

      if (gridItem) {
        const { messages } = conversation;
        messages && messageHandler(conversation.messages);
      }

      this.store.dispatch(new PeGridItemsActions.EditItem(gridItem, this.appType));

      if (this.isUserLeave){
        this.store
          .dispatch(new PeGridItemsActions.DeleteItems([gridItem.id], this.appType))
          .pipe(mapTo(gridItem.id));
        this.setConversationAsActiveById(null);
        this.peMessageConversationService.activeConversation$.next(null);
        this.peMessageChatRoomListService.activeChat = null;
        this.isUserLeave = false;
      }

    }));

  private readonly initWebSocketObservers$ = merge(
    this.handleChatCreated$,
    this.handleChatDeleted$,
    this.handleChatUpdated$,
    this.handleChatMemberChanged$,
    this.handleChatMemberIncluded$,
    this.handleChatMemberExcluded$,
    this.handleContactCreated$,
    this.handleMessage$,
  );

  private readonly toggleSidenavStatus$ = this.peGridSidenavService
    .getSidenavOpenStatus(PeMessageSidenavsEnum.ConversationList)
    .pipe(
      tap((active: boolean) => {
        const { isEmbedChat, isLiveChat } = this.peMessageService;
        !isLiveChat && this.pePlatformHeaderService.toggleSidenavActive(PeMessageSidenavsEnum.ConversationList, active);
        active && !isLiveChat
          && this.pePlatformHeaderService.toggleSidenavActive(PeMessageSidenavsEnum.Folders, false);
        active && !isEmbedChat && !isLiveChat && this.addMobileHeader();
        !active && !isLiveChat
          && this.pePlatformHeaderService.removeSidenav(PeMessageSidenavsEnum.Folders);
        this.cdr.detectChanges();
      }));

  constructor(
    private activatedRoute: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private store: Store,

    @Inject(APP_TYPE) private appType: AppType,
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private confirmScreenService: ConfirmScreenService,
    private cosEnvService: CosEnvService,
    private peGridSidenavService: PeGridSidenavService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    @Optional() private pePlatformHeaderService: PePlatformHeaderService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private messageStateService: MessageStateService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageGuardService: PeMessageGuardService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageInvitationApiService: PeMessageInvitationApiService,
    private peMessageNavService: PeMessageNavService,
    private peMessageService: PeMessageService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageManagementService: PeMessageManagementService,
    private messageChatDialogService: MessageChatDialogService,
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
  }

  public get closeOnResize(): boolean {
    return !!this.peMessageConversationService.activeConversation$.value;
  }

  private get isEmbedMode(): boolean {
    return this.peMessageService.isLiveChat || this.peMessageService.isEmbedChat;
  }

  ngOnDestroy(): void {
    if (this.peMessageChatRoomListService.activeChat) {
      this.peMessageWebSocketService.leaveChat(
        this.peMessageChatRoomListService.activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
        this.peMessageChatRoomListService.activeChat._id,
      );
    }
    this.peMessageChatRoomListService.destroy();
    this.peMessageConversationService.destroy();
    this.pePlatformHeaderService.removeSidenav(PeMessageSidenavsEnum.ConversationList);
    this.peMessageConversationService.removeConversationIdFromLs();
  }

  ngOnInit(): void {
    const { isEmbedChat, isLiveChat } = this.peMessageService;
    this.mobileView = isEmbedChat || isLiveChat;
    !isEmbedChat && !isLiveChat && this.addMobileHeader(PeMessageSidenavsEnum.ConversationList);
    const menuItem = PE_MESSAGE_CONVERSATION_LIST_MENU.items
      .find(menuItem => menuItem.value === PeMessageConversationListActionsEnum.CreateMailMessage);
    menuItem.hidden = this.cosEnvService.isPersonalMode;

    const checkForInvitation$ = !isLiveChat ? this.checkForInvitation() : of(null);

    merge(
      this.setConversationAsActive$,
      this.initWebSocketObservers$,
      checkForInvitation$,
      this.toggleSidenavStatus$,
      this.handleTypingMessage(),
    ).pipe(takeUntil(this.destroy$)).subscribe();

    this.peMessageChatRoomListService.activeChat$
      .pipe(
        withLatestFrom(this.peMessageConversationService.activeConversation$),
        filter(([chat, conversation]) => { return chat?._id !== conversation?.id; }),
        tap(([chat, conversation]) => {
          this.setConversationAsActiveById(chat?._id);
        }),
        takeUntil(this.destroy$),
      ).subscribe();

    this.peMessageChatRoomListService.actionDeleteChatFromSettings$.pipe(
      tap ((result: PeMessageChatDeleteData) => {
        this.deleteChannelOptions(result);
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  ngAfterViewInit(): void {
    (window.innerWidth <= 720 || this.isEmbedChat || this.isLiveChat)
      && this.peMessageConversationService.activeConversation$.value
      && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
  }

  private deleteChannelOptions(data: PeMessageChatDeleteData){
    if (data.leave) {
      this.peMessageApiService.deleteAppConversation(
        data.conversation.id,
        data.conversation.type)
      .subscribe();
      this.isUserDeletedChat = true;
    } else {
      this.leaveChat(data);
    }
  }

  public actionClick(conversation: PeGridItem<PeMessageChat>) {
    this.peMessageManagementService.clearSelectedMessages();
    const activeConversation = this.peMessageConversationService.activeConversation$.value;
    activeConversation?.id !== conversation.id && this.setConversationAsActiveById(conversation.id);
    (window.innerWidth <= 720 || this.isEmbedChat || this.isLiveChat) && this.peGridSidenavService
      .sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);
    this.peMessageConversationService.setConversationIdToLs(conversation.id);
  }

  public addConversationToList(conversationToAdd: PeMessageChat): Observable<any> {
    const { _id, websocketType } = conversationToAdd;
    const isExistingConversation = this.conversationList
      .some(existingConversation => existingConversation.id === _id);
    !isExistingConversation && this.peMessageWebSocketService
      .chatRoomJoin(websocketType ?? PeMessageWebsocketType.Regular, _id);
    conversationToAdd.avatar = this.peMessageChatRoomListService.getContactAvatar(conversationToAdd);
    conversationToAdd.initials = this.peMessageChatRoomListService.getContactInitials(conversationToAdd);
    conversationToAdd.title = this.peMessageChatRoomListService.getTitle(conversationToAdd);
    const gridItem = this.peMessageConversationService.conversationToGridItemMapper([conversationToAdd])[0];
    const gridAction = isExistingConversation
      ? new PeGridItemsActions.EditItem(gridItem, this.appType)
      : new PeGridItemsActions.AddItem(gridItem, this.appType);

    this.peMessageChatRoomListService.chatList.push(cloneDeep(conversationToAdd));

    return this.store.dispatch(gridAction)
      .pipe(
        tap(() => {
          this.setConversationAsActiveById(conversationToAdd._id);
          this.peMessageChatRoomListService.detectChangeStream$.next();
        }));
  }

  private addMobileHeader(sidenavName?: string): void {
    this.pePlatformHeaderService.assignSidenavItem({
      name: sidenavName ?? PeMessageSidenavsEnum.Folders,
      active: sidenavName
        ? this.peGridSidenavService.getSidenavOpenStatus(sidenavName).value
        : this.peGridSidenavService.toggleOpenStatus$.value,
      item: {
        title: this.translateService.translate(sidenavName ?? PeMessageSidenavsEnum.Folders),
        iconType: 'vector',
        icon: '#icon-arrow-left-48',
        iconDimensions: {
          width: '12px',
          height: '20px',
        },
        onClick: () => {
          this.peGridSidenavService.toggleViewSidebar(sidenavName);
          this.peMessageConversationService.forgetCurrentConversation();
        },
      },
    });
  }

  private checkForInvitation(): Observable<any> {
    const { invitationKey, invitationPublicKey } = this.activatedRoute.snapshot.queryParams;
    const notificationConfig: SnackbarConfig = {
      content: '',
      duration: 5000,
      iconColor: '#00B640',
      iconId: 'icon-commerceos-success',
      iconSize: 24,
    };

    const translate = (translationKey: string, conversationTitle?: string) => this.translateService
      .translate(translationKey)
      .replace('{channelTitle}', conversationTitle);

    const checkForInvitationParams$ = () => this.peMessageConversationService.checkForInvitation$
      .pipe(filter(Boolean), take(1), filter(() => invitationKey || invitationPublicKey));

    const checkForMessageFisrtStart$ = () => this.store.select(DockerState.dockerItems)
      .pipe(
        map(dockerItems => dockerItems.find(dockerItem => dockerItem.code === AppType.Message)),
        filter(message => message.setupStatus === 'completed'));

    const getInvitationConversationInfo$ = () => invitationPublicKey
      ? this.peMessageInvitationApiService.getPublicConversationInfoBySlug(invitationPublicKey)
      : this.peMessageInvitationApiService.getConversationInfoByInviteCode(invitationKey)
        .pipe(map(({ messaging: { _id, photo, title } }) => ({ _id, photo, title })));

    const joinToInvitationConversation$ = () => invitationPublicKey
      ? this.peMessageInvitationApiService.joinToPublicConversationByInviteCode(invitationPublicKey)
      : this.peMessageInvitationApiService.joinToConversationByInviteCode(invitationKey);

    const showCancelledNotification$ = (conversationId: string, conversationTitle: string) => {
      notificationConfig
        .content = translate('message-app.invitation.notification.already_a_member', conversationTitle);
      this.snackbarService.toggle(true, notificationConfig);
      this.setConversationAsActiveById(conversationId);

      return of(false);
    };

    const showConfirmationDialog$ = (conversationPhoto: string, conversationTitle: string) => {
      const icon: PeConfirmationScreenIconInterface = conversationPhoto
        ? {
          iconType: PeConfirmationScreenIconTypesEnum.Image,
          path: `${this.env.custom.storage}/message/${conversationPhoto}`,
        }
        : {
          iconType: PeConfirmationScreenIconTypesEnum.Abbreviation,
          path: getAbbreviation(conversationTitle),
        };
      const confirmationConfig: Headings = {
        icon,
        title: translate('message-app.invitation.confirmation.title', conversationTitle),
        subtitle: translate('message-app.invitation.confirmation.subtitle', conversationTitle),
        declineBtnText: translate('message-app.invitation.actions.cancel'),
        confirmBtnText: translate('message-app.invitation.actions.join'),
        confirmBtnType: 'confirm',
      };

      return this.confirmScreenService.show(confirmationConfig, true);
    };

    return checkForMessageFisrtStart$()
      .pipe(
        switchMap(checkForInvitationParams$),
        switchMap(getInvitationConversationInfo$),
        switchMap(({ _id, photo, title }) => this.conversationList.some(conversation => conversation.id === _id)
          ? showCancelledNotification$(_id, title)
          : showConfirmationDialog$(photo, title)),
        tap(() => {
          this.router.navigate([], { relativeTo: this.activatedRoute, queryParams: {} });
        }),
        take(1),
        filter(Boolean),
        switchMap(joinToInvitationConversation$),
        tap(() => {
          if (this.peMessageConversationService.activeConversation$.value) {
            const { title } = this.peMessageConversationService.activeConversation$.value;
            notificationConfig.content = translate('message-app.invitation.notification.succesfully_joined', title);
            this.snackbarService.toggle(true, notificationConfig);
          }
        }));
  }

  public filterConversationList(filter: string): void {
    this.filterConversationList$.next(filter);
  }

  public activatedChatListener(event) { }

  public dropIntoFolder(gridItem: PeGridItem): PeMoveToFolderItem[] {
    return [gridItem];
  }

  public conversationContextSelect({ gridItem, menuItem }): void {
    switch (menuItem.value) {
      case PeMessageConversationActionsEnum.AddToFolder:
        this.addToFolderViaDialog(gridItem);
        break;
      case PeMessageConversationActionsEnum.ExcludeFromFolder:
        this.excludeConversationFromFolder(gridItem);
        break;
      case PeMessageConversationActionsEnum.LeaveChat:
        this.chatLeaveDeleteOption(gridItem);
        break;
      case PeMessageConversationActionsEnum.Delete:
        this.showConfirmationDialog(gridItem);
        break;
    }
  }

  public conversationListMenuSelected(menuItem: PeGridMenuItem): void {
    switch (menuItem.value) {
      case PeMessageConversationListActionsEnum.CreateChannel:
        this.openChannelEditor();
        break;
      case PeMessageConversationListActionsEnum.CreateDirectChat:
        this.openContactsApp();
        break;
      //TODO: for ability to create email when it will be done
      case PeMessageConversationListActionsEnum.CreateMailMessage:
        break;
    }
  }

  public addConversationToFolder({ folder, moveItems }: MoveIntoFolderEvent) {
    const gridItemsToAdd = moveItems
      .filter(({ data: { locations }, type }) => type === PeGridItemType.Item && !locations
        .some(({ folderId }) => folderId === folder._id));
    const gridItemsToAdd$ = gridItemsToAdd
      .map(({ data, id }) => this.peMessageApiService.addLocation(id, data, folder._id));

    gridItemsToAdd$.length && forkJoin(gridItemsToAdd$)
      .pipe(
        tap((locationsOfAddedConversations: PeMessageConversationLocationInterface[]) => {
          locationsOfAddedConversations.forEach((location) => {
            const gridItem = gridItemsToAdd.find(gridItem => gridItem.id === location.itemId);
            const gridItemToUpdate = cloneDeep(gridItem);
            gridItemToUpdate.data.locations.push(location);
            this.store.dispatch(new PeGridItemsActions.EditItem(gridItemToUpdate, this.appType));
          });
        }))
      .subscribe();
  }

  private deleteConversation(conversation: PeGridItem<PeMessageChat>): void {
    this.peMessageApiService.deleteAppConversation(conversation.id, conversation.data.type).subscribe();
  }

  private excludeConversationFromFolder(conversation: PeGridItem<PeMessageChat>): void {
    const { id, data: { locations } } = conversation;
    const { _id, isActiveRootFolder } = this.activeFolder$.value;
    if (!isActiveRootFolder) {
      const currentLocation = locations.find(({ folderId }) => folderId === _id);
      currentLocation && this.peMessageApiService.removeLocation(id, currentLocation._id)
        .pipe(
          tap(() => {
            const gridItemToUpdate = cloneDeep(conversation);
            const updatedLocations = locations.filter(location => location._id !== currentLocation._id);
            gridItemToUpdate.data.locations = updatedLocations;
            this.store.dispatch(new PeGridItemsActions.EditItem(gridItemToUpdate, this.appType));
          }))
        .subscribe();
    }
  }

  private isUserAdminOfChannel(conversation: PeGridItem<PeMessageChat>): boolean {
    const currentUserid = conversation.data?.activeUser?._id;

    return conversation.data.members.some(member => member.role === 'admin' && member.user === currentUserid);
  }

  private leaveChat(data: PeMessageChatDeleteData): void {
    this.peMessageWebSocketService.leaveMember(
      this.peMessageChatRoomListService.activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
      data.conversation.id
     );
    this.isUserLeave = true;
  }

  private chatLeaveDeleteOption(conversation: PeGridItem<PeMessageChat>): void {
    this.messageChatDialogService.deleteLeaveChatDialog(
      conversation,
      this.isUserAdminOfChannel(conversation) ? this.deleteForEveryOneTemplateRef : null,
    );
  }

  private addToFolderViaDialog(conversation: PeGridItem<PeMessageChat>): void {
    const onSaveSubject$ = new BehaviorSubject<string>('');
    this.peMessageApiService.getFolderTree()
      .pipe(map(tree => tree.filter((folder: any) => folder.scope !== 'default')))
      .subscribe(
        (data) => {
          const peOverlayConfig: PeOverlayConfig = {
            data: {
              folderTree: data,
              theme: this.theme,
            },
            hasBackdrop: true,
            headerConfig: {
              title: this.translateService.translate('add-to-folder-overlay.title'),
              backBtnTitle: this.translateService.translate('add-to-folder-overlay.close'),
              backBtnCallback: () => {
                this.peOverlayWidgetService.close();
              },
              doneBtnTitle: this.translateService.translate('add-to-folder-overlay.save'),
              doneBtnCallback: () => {
                const addConversationToFolder = {
                  folder: { _id: onSaveSubject$.value } as FolderItem,
                  moveItems: [conversation],
                };
                this.addConversationToFolder(addConversationToFolder);
                this.peOverlayWidgetService.close();
              },
              removeContentPadding: false,
              onSave$: onSaveSubject$.asObservable(),
              onSaveSubject$,
              theme: this.theme,
            },
            component: PeMessageFolderTreeComponent,
          };
          this.peOverlayWidgetService.open(peOverlayConfig);
        },
      );
  }

  private disableAddingChat(chat: PeMessageChat): boolean {
    const isExistingConversation = this.conversationList.some(conversation => conversation.id === chat._id);

    return isExistingConversation || chat.type === PeMessageChatType.AppChannel;
  }

  private setConversationAsActiveById(conversationId: string = null): void {
    const getConversationToActive = (): PeGridItem<PeMessageChat> => {
      if (!this.conversationList.length) {
        return null;
      }

      const conversationIndex = this.conversationList.findIndex(conversation => conversation.id === conversationId);

      return conversationIndex !== -1
        ? this.conversationList[conversationIndex]
        : this.isUserDeletedChat || this.isUserLeave
          ? null
          : this.conversationList[0];
    };
    const conversationToActive = getConversationToActive();
    this.peMessageConversationService.activeConversation$.next(conversationToActive);
    this.peMessageChatRoomListService.activeChat = conversationToActive?.data;
    this.isUserDeletedChat = false;
  }

  private changeMemberInfoInChat(chat, data, membersInfo) {
    if (chat._id === data.chatId) {
      const currentMemberInfo = membersInfo.find(mInfo => mInfo.user._id === data.memberId);
      chat.avatar = this.peMessageChatRoomListService.getContactAvatar(chat);
      chat.initials = this.peMessageChatRoomListService.getContactInitials(chat);
      chat.title = this.peMessageChatRoomListService.getTitle(chat);
      chat.membersInfo = membersInfo;
      chat.members = chat.members.map(member => member.user === data.memberId ? data.member : member);
      chat.currentMember = {
        ...currentMemberInfo,
        ...data.member,
      };
    }

    return chat;
  }

  private openContactsApp(): void {
    const app = this.dockerItems?.find(item => item.code === AppType.Contacts);
    if (app?.installed) {
      this.router.navigateByUrl(`${this.router.url}/contacts/${PeMessageChatType.Chat}`);
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate('message-app.sidebar.contact_isnt_installed'),
        iconColor: '#E2BB0B',
        duration: 2500,
      });
    }
  }

  private openChannelEditor(): void {
    if (
      this.peMessageService.isEmbedChat
      && this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
    ) {
      const onCloseSubject$ = new Subject<any>();
      const peOverlayConfig: PeOverlayConfig = {
        data: {
          onCloseSubject$,
          theme: this.theme,
        },
        hasBackdrop: true,
        headerConfig: {
          hideHeader: true,
          removeContentPadding: true,
          title: this.translateService.translate('message-app.channel.overlay.title'),
          theme: this.theme,
        },
        panelClass: 'pe-message-channel-form-overlay',
        component: PeCreatingChatFormComponent,
      };

      this.peOverlayWidgetService.open(peOverlayConfig);

      onCloseSubject$
        .pipe(
          filter(Boolean),
          take(1),
          switchMap(() => {
            this.peOverlayWidgetService.close();
            window.innerWidth <= 720
              && this.peGridSidenavService.sidenavOpenStatus[PeMessageSidenavsEnum.ConversationList].next(false);

            return this.peMessageChatRoomListService.getConversationList();
          }))
        .subscribe();
    } else {
      this.router.navigateByUrl(`${this.router.url}/channel`);
    }
  }

  private showConfirmationDialog(gridItem: PeGridItem<PeMessageChat>) {
    const translate = (value: string) => this.translateService.translate(value);
    const headings: Headings = {
      title: translate('message-app.channel.settings.are-you-sure'),
      subtitle: translate('message-app.channel.settings.delete-text'),
      declineBtnText: translate('message-app.channel.settings.go-back'),
      confirmBtnText: translate('message-app.channel.settings.delete'),
    };

    this.confirmScreenService.show(headings, true)
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.deleteConversation(gridItem);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  getTypingMembers(item: PeMessageChat): PeMessageChatTypingUser[] {
    const chat: PeMessageChat = this.peChatMessage.find((chat) => chat._id === item.id);
    if (!chat) {
      return null;
    }

    return chat.typingMembers.filter(a => a.user !== this.peMessageService.getUserData().uuid);
  }

  handleTypingMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_TYPING)
      .pipe(
        filter(chat => !!chat),
        tap((chat: PeMessageChat) => {
          const index: number = this.peChatMessage.findIndex(x => x._id === chat._id);

          if (index === -1) {
            this.peChatMessage.push(chat);
          } else {
            this.peChatMessage[index] = chat;
          }
          this.cdr.detectChanges();
        }),
      );
  }

}
