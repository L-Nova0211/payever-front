import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  HostBinding,
  Inject,
  Input,
  OnInit,
  Optional,
  ViewEncapsulation,
} from '@angular/core';
import { FormControl } from '@angular/forms';
import { Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, Subject, merge, EMPTY, forkJoin, of } from 'rxjs';
import { filter, take, takeUntil, tap, switchMap, map } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { PebEnvService } from '@pe/builder-core';
import {
  APP_TYPE,
  AppType,
  MenuSidebarFooterData,
  PeDestroyService,
  PeDragDropService,
  PreloaderState,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { DockerItemInterface, DockerState } from '@pe/docker';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  PeChatMessage,
  PeMessageChat,
  PeMessageContact,
  PeMessageIntegration,
  PeMessageChannelType,
} from '@pe/shared/chat';
import { SnackbarService } from '@pe/snackbar';
import { PeContextMenuService } from '@pe/ui';

import { ConversationFacade } from '../../classes/conversation/conversation-facade';
import {
  PeMessageContextMenu,
  PeMessageGuardRoles,
  PeMessageWebsocketType,
  PeMessageChatType,
  PeMessageWebSocketEvents,
} from '../../enums';
import {
  PeMessageChannel,
  PeMessageIntegrationThemeItem,
  PeMessageWebSocketIncludedDTO,
  PeMessageWebSocketMemberChanged,
} from '../../interfaces';
import { PeMailBuilderService } from '../../modules/editor/message-builder/mail-builder.service';
import { PeMessageIntegrationService } from '../../services';
import { PeMessageApiService } from '../../services/message-api.service';
import { PeMessageChatRoomListService } from '../../services/message-chat-room-list.service';
import { PeMessageChatRoomService } from '../../services/message-chat-room.service';
import { PeMessageGuardService } from '../../services/message-guard.service';
import { PeMessageNavService } from '../../services/message-nav.service';
import { MessageStateService } from '../../services/message-state.service';
import { PeMessageWebSocketService } from '../../services/message-web-socket.service';
import { PeMessageService } from '../../services/message.service';
import { PeCreatingChatFormComponent } from '../chat/creating-chat-form/creating-chat-form.component';
import { PeMessageChatRoomFormComponent } from '../message-chat-room-form';
import { PeMessageFolderTreeComponent } from '../message-folder-tree';

@Component({
  selector: 'pe-message-chat-room-list',
  templateUrl: './message-chat-room-list.component.html',
  styleUrls: ['./message-chat-room-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  providers: [PeDestroyService],
})
export class PeMessageChatRoomListComponent implements OnInit {
  @SelectSnapshot(PreloaderState.loading) loading: {};
  @SelectSnapshot(DockerState.dockerItems) dockerItems: DockerItemInterface[];

  @Input() theme = 'dark';
  @Input() isLiveChat = false;
  chatList: [];

  @HostBinding('class.pe-message-chat-room-list') peMessageChatRoomList = true;

  sidebarMenuItems = [
    ...(this.cosEnvService.isPersonalMode ? [] : [{
      title: this.translateService.translate('message-app.sidebar.mail'),
      onClick: () => {
        this.peMailBuilderService.replyConfig$.next(null);
        this.router.navigateByUrl(`/business/${this.envService.businessId}/message/editor`);
      },
    }]),
  ];

  messageAppColor = '';
  accentColor = '';
  public activeChat: PeMessageChat;
  searchControl = new FormControl();
  menuData: MenuSidebarFooterData = {
    headItem: { title: this.translateService.translate('message-app.sidebar.add_new') },
    menuItems: this.sidebarMenuItems,
  };

  chatListStorage = [];

  private readonly filterChatList$ =  this.searchControl.valueChanges
      .pipe(
        tap((searchRequest) => {
          const { chatList } = this.peMessageChatRoomListService;
          this.chatListStorage = chatList
            .filter(chat => new RegExp(searchRequest.replace(/[^\d\w]/g, ''), 'i').test(chat.title));
        }));

  private readonly getChatList$ = merge(
    this.peMessageChatRoomListService.chatList$,
    this.peMessageIntegrationService.integrationChannelList$,
  ).pipe(
      tap((chatList) => {
        this.chatListStorage = cloneDeep(chatList);
        this.changeDetectorRef.detectChanges();
      }));

  constructor(
    private changeDetectorRef: ChangeDetectorRef,
    private router: Router,

    @Optional() @Inject(APP_TYPE) private appType: AppType,
    private confirmScreenService: ConfirmScreenService,
    private envService: PebEnvService,
    private cosEnvService: CosEnvService,
    private peContextMenuService: PeContextMenuService,
    private peDragDropService: PeDragDropService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private readonly destroy$: PeDestroyService,

    private conversationFacade: ConversationFacade,
    private messageStateService: MessageStateService,
    private peMailBuilderService: PeMailBuilderService,
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageGuardService: PeMessageGuardService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageNavService: PeMessageNavService,
    private peMessageService: PeMessageService,
    private peMessageWebSocketService: PeMessageWebSocketService,
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

  public get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  private get getChatList(): any[] {
    return this.peMessageService.isLiveChat
      ? this.peMessageIntegrationService.integrationChannelList
      : this.peMessageChatRoomListService.chatList;
  }

  public get isNotChat(): boolean {
    return !(this.peMessageService.isLiveChat || this.peMessageService.isEmbedChat);
  }

  ngOnInit(): void {
    const { isEmbedChat, isLiveChat } = this.peMessageService;
    const isNotChat = !isEmbedChat && !isLiveChat && this.peMessageGuardService
      .isAllowByRoles([PeMessageGuardRoles.Merchant, PeMessageGuardRoles.Admin]);
    const isEmbedAdminChat = isEmbedChat && this.peMessageGuardService
      .isAllowByRoles([PeMessageGuardRoles.Admin]);

    if (isNotChat || isEmbedAdminChat) {
      this.sidebarMenuItems.push({
        title: this.translateService.translate('message-app.sidebar.channel'),
        onClick: () => {
          this.openChannelFormOverlay();
        },
      });
    }

    if (isLiveChat || isEmbedChat) {
      this.menuData = null;
    }

    const refreshView$ = merge(
      this.peMessageChatRoomListService.activeChat$.pipe(
        filter(activeChat => !!activeChat),
        tap(activeChat => this.activeChat = activeChat),
      ),
    ).pipe(
        tap(() => {
          this.changeDetectorRef.markForCheck();
        }));

    const mainStreamArray$ = [
      refreshView$,
      this.filterChatList$,
      this.getChatList$,
      this.handleChatCreated(),
      this.handleMessagePosted(),
      this.handleMessageUpdated(),
      this.handleMessageDeleted(),
      this.handleContactCreated(),
      this.handleChatChanged(),
      this.handleChatDeleted(),
      this.handleMemberIncluded(),
      this.handleMemberExcluded(),
      this.handleChatMemberChanged(),
    ];

    isLiveChat && mainStreamArray$.push(
      this.peMessageIntegrationService.currSettings$.pipe(
        filter((themeItem: PeMessageIntegrationThemeItem) => themeItem._id !== undefined),
        tap((themeItem: PeMessageIntegrationThemeItem) => {
          this.accentColor = themeItem.settings?.accentColor || '';
          this.messageAppColor = themeItem.settings?.messageAppColor || '';
          this.changeDetectorRef.detectChanges();
        }),
      )
    );

    merge(
      ...mainStreamArray$,
      this.peMessageChatRoomListService.activeChat$,
    ).pipe(
      tap((chat: PeMessageChat) => {
        this.changeDetectorRef.detectChanges();
      }),
      takeUntil(this.destroy$)
    ).subscribe();
  }

  public setChatAsActive(chat: PeMessageChat): void {
    this.activeChat = chat;
    this.peMessageChatRoomListService.activeChat = chat;
  }

  private disableAddingChat(chat): boolean {
    const existingChat = this.peMessageChatRoomListService.chatList.find(chatListItem => chatListItem._id === chat._id);

    return !!existingChat || chat.type === PeMessageChatType.AppChannel;
  }

  private chatCreated(chat: PeMessageChat) {
    return this.peMessageChatRoomListService.addMemberInfoToConversation(chat).pipe(
      switchMap( (chat: PeMessageChat) => {
        chat.avatar = this.peMessageChatRoomListService.getContactAvatar(chat);
        chat.initials = this.peMessageChatRoomListService.getContactInitials(chat);
        chat.title = this.peMessageChatRoomListService.getTitle(chat);

        this.peMessageChatRoomListService.chatList.unshift(chat);
        this.peMessageWebSocketService.chatRoomJoin(
          chat.websocketType ?? PeMessageWebsocketType.Regular,
          chat._id,
        );

        this.setChatAsActive(chat);

        this.peMessageChatRoomListService.detectChangeStream$.next();
        this.changeDetectorRef.markForCheck();

        return this.conversationFacade.init(chat).conversation().pipe(
          tap((data: PeMessageChat) => {
            const foundChat = this.peMessageChatRoomListService.chatList.find(c => c._id === data._id);

            if (foundChat) {
              foundChat.messages = data.messages;
            }
            if (this.messageStateService.conversationList) {
              this.messageStateService.conversationList = [foundChat, ...this.messageStateService.conversationList];
            } else {
              this.messageStateService.conversationList = [foundChat];
            }
            this.peMessageChatRoomListService.detectChangeStream$.next();
            this.changeDetectorRef.markForCheck();
          }),
        );
      }),
    );
  }

  public dragStart(chat: PeMessageChat): void {
    this.peDragDropService.setDragItem(chat);
  }

  private getLastMessageIcon(chat: PeMessageChat): boolean {
    if (chat.messages?.length) {
      const length = chat.messages.length;
      const lastMessage = chat.messages[length - 1];

      return !!lastMessage?.attachments?.length;
    }

    return false;
  }

  private getLastMessageContent(chat: PeMessageChat): string | null {
    if (chat.messages?.length) {
      const userId = this.peMessageService.activeUser._id;
      const filteredMessages = chat.messages.filter(message => {
        return !message.deletedForUsers?.includes(userId);
      });
      const length = filteredMessages.length;
      const lastMessage = filteredMessages[length - 1];

      if (lastMessage
        && lastMessage.content
        && lastMessage.type !== 'template'
        && lastMessage.content !== '{#empty#}') {
        return lastMessage.content.length > 22 ? lastMessage.content.slice(0, 22) + '…' : lastMessage.content;
      }
    }

    return null;
  }

  private getNumberUnreadMessages(chat: PeMessageChat): number | null {
    return chat.messages?.length
      ? chat.messages.filter(m => m.sender !== this.peMessageService.activeUser?._id && m.status !== 'read').length
      : null;
  }

  public openContextMenu(event: MouseEvent, chat: PeMessageChat): void {
    event?.preventDefault();
    event?.stopPropagation();

    const contextMenu = {
      title: this.translateService.translate('message-app.sidebar.options'),
      list: [
        {
          label: this.translateService.translate('message-app.sidebar.move_to') + '...',
          value: PeMessageContextMenu.Move,
        },
        {
          label: this.translateService.translate('message-app.sidebar.delete'),
          value: PeMessageContextMenu.Delete,
          red: true,
        },
      ],
    };

    const config = {
      theme: this.theme,
      panelClass: 'pe-message-room-list-context-menu',
      data: contextMenu,
    };

    this.peContextMenuService.open(event, config).afterClosed.pipe(
      tap((e: PeMessageContextMenu) => {
        switch (e) {
          case PeMessageContextMenu.Move:
            this.openFolderTreeOverlay(chat);
            break;
          case PeMessageContextMenu.Delete:
            this.showConfirmationDialog(chat);
            break;
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private createChat(creatingChat: PeMessageChat, message: string): void {
    const sameChat = this.peMessageChatRoomListService.chatList
      .find(chat => chat.contact === creatingChat.contact && chat.integrationName === creatingChat.integrationName);

    if (sameChat) {
      this.setChatAsActive(sameChat);
      this.peMessageWebSocketService.chatRoomJoin(
        creatingChat.websocketType ?? PeMessageWebsocketType.Regular,
        sameChat._id,
      );
      this.peMessageChatRoomService.sendMessage({ message });
    } else {
      this.peMessageApiService.postChat(creatingChat)
        .pipe(
          tap((createdChat: PeMessageChat) => {
            this.setChatAsActive(createdChat);
            this.peMessageWebSocketService.chatRoomJoin(
              creatingChat.websocketType ?? PeMessageWebsocketType.Regular,
              createdChat._id,
            );
            this.peMessageChatRoomService.sendMessage({ message: message });
          }),
          switchMap(({ _id }: PeMessageChat) => {
            return this.peMessageApiService.moveToFolder(_id, this.peMessageNavService.selectedFolderId);
          }),
          takeUntil(this.destroy$))
        .subscribe();
    }
  }

  private showConfirmationDialog(chat: PeMessageChat) {
    const headings: Headings = {
      confirmBtnText: this.translateService.translate('message-app.channel.settings.delete'),
      declineBtnText: this.translateService.translate('message-app.channel.settings.go-back'),
      subtitle: this.translateService.translate('message-app.channel.settings.delete-text'),
      title: this.translateService.translate('message-app.channel.settings.are-you-sure'),
    };

    this.confirmScreenService.show(headings, true)
      .pipe(
        take(1),
        filter(Boolean),
        switchMap(() => this.peMessageChatRoomListService.deleteChat(chat._id)),
        tap(() => {
          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public openContactsApp(): void {
    const app = this.dockerItems?.find(item => item.code === AppType.Contacts);
    if (app?.installed) {
      this.router.navigateByUrl(`/business/${this.envService.businessId}/message/contacts/${PeMessageChatType.Chat}`);
    } else {
      this.snackbarService.toggle(true, {
        content: this.translateService.translate( 'message-app.sidebar.contact_isnt_installed' ),
        iconColor: '#E2BB0B',
        duration: 2500,
      });
    }
  }

  private handleChatCreated() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_CREATED)
      .pipe(
        switchMap((chat: PeMessageChat) => this.disableAddingChat(chat) ? EMPTY : this.chatCreated(chat)));
  }

  private handleMessagePosted() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_POSTED)
      .pipe(
        tap((message: PeChatMessage) => {
          this.messageStateService.messagePosted(message);
          this.changeDetectorRef.markForCheck();
        }));
  }

  private handleMessageUpdated() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_UPDATED)
      .pipe(
        tap((message: PeChatMessage) => {
          this.messageStateService.messageUpdated(message);
          this.changeDetectorRef.markForCheck();
        }));
  }

  private handleMessageDeleted() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_DELETED)
      .pipe(
        tap((message: PeChatMessage) => {
          this.messageStateService.messageDeleted(message);
          this.changeDetectorRef.markForCheck();
        }));
  }

  private handleContactCreated() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CONTACT_CREATED)
      .pipe(
        tap((contact: PeMessageContact) => {
          this.peMessageService.contactList.push(contact);
          this.changeDetectorRef.markForCheck();
        }));
  }

  private handleChatMemberChanged() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_CHANGED)
      .pipe(
        switchMap((chatInfo: PeMessageWebSocketMemberChanged) => forkJoin([
          of(chatInfo),
          this.peMessageApiService.getConversation(chatInfo.chatId, chatInfo.chatType),
          this.peMessageApiService.getConversationMembers(chatInfo.chatType, chatInfo.chatId),
        ])),
        map(([chatInfo, chatReponse, membersInfo]) => {
          this.peMessageChatRoomListService.chatList = this.peMessageChatRoomListService.chatList
            .map(_chat => this.changeMemberInfoInChat(
              _chat,
              chatInfo,
              membersInfo,
            ));

            const activeChat = this.changeMemberInfoInChat(chatReponse, chatInfo, membersInfo);
            this.setChatAsActive(activeChat);
        }));
  }

  private handleChatChanged() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_UPDATED)
      .pipe(
        tap(chatInfo => {
          this.peMessageChatRoomListService.chatList = this.peMessageChatRoomListService.chatList
            .map(_chat => this.changeChatInfo(
              _chat,
              chatInfo,
            ));
            this.peMessageChatRoomListService.activeChat = this.changeChatInfo(
              this.peMessageChatRoomListService.activeChat,
              chatInfo,
            );
            this.changeDetectorRef.markForCheck();
        }));
  }

  private handleChatDeleted() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_DELETED)
      .pipe(
        filter(userAccount => !!userAccount),
        tap((dChat: PeMessageChat) => {
          let { activeChat, chatList } = this.peMessageChatRoomListService;
          chatList = chatList.filter(chat => chat._id !== dChat._id);
          activeChat._id === dChat._id && this.setChatAsActive(chatList[0]);
          this.changeDetectorRef.markForCheck();
        }),
      );
  }

  private handleMemberIncluded() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_INCLUDED)
      .pipe(
        switchMap((dataIncluded: PeMessageWebSocketIncludedDTO) => {
          this.peMessageChatRoomListService.memberIncluded(dataIncluded);
          this.changeDetectorRef.markForCheck();
          const chat = this.peMessageChatRoomListService.chatList
            .find(chatItem => chatItem._id === dataIncluded.chat._id);

          return !chat ? this.chatCreated(dataIncluded.chat) : EMPTY;
        }));
  }

  private handleMemberExcluded() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED)
      .pipe(
        switchMap((dataIncluded: PeMessageWebSocketIncludedDTO) => {
          const chat = this.peMessageChatRoomListService.chatList
            .find(chatItem => chatItem._id === dataIncluded.chat._id);

          return !chat ? this.chatCreated(dataIncluded.chat) : EMPTY;
        }));
  }

  public isPrivateChannel(channel: PeMessageChannel): boolean {
    return channel.subType === PeMessageChannelType.Private;
  }

  private changeChatInfo(chat: PeMessageChat, data: PeMessageChat) {
    if (chat._id === data._id) {
      chat.avatar = this.peMessageChatRoomListService.getContactAvatar(data);
      chat.initials = this.peMessageChatRoomListService.getContactInitials(data);
      chat.title = this.peMessageChatRoomListService.getTitle(data);
      chat.description = data.description;
    }

    return chat;
  }

  private changeMemberInfoInChat(chat, data, membersInfo) {
    if (chat._id === data.chatId) {
      const currentMemberInfo = membersInfo.find(mInfo => mInfo.user._id === data.memberId);
      this.changeChatInfo(chat, chat);
      chat.membersInfo = membersInfo;
      chat.members = chat.members.map(member => member.user === data.memberId ? data.member : member);
      chat.currentMember = {
        ...currentMemberInfo,
        ...data.member,
      };
    }

    return chat;
  }

  private includeMemberInfoInChat(chat, data, userData) {
    if (chat._id === data._id) {
      chat.members = data.members;
      const memberInfo = chat.members.find((member)=> member.user === userData._id);

      chat.membersInfo.push({ ...memberInfo, user: userData });
    }

    return chat;
  }

  public openChatRoomFormOverlay(mailConfig?: string[]): void {
    const onCloseSubject$ = new BehaviorSubject<any>(null);
    const { firstName, lastName } = this.peMessageService.activeUser.userAccount;
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        mailConfig,
        onCloseSubject$,
        sender: `${firstName} ${lastName}`,
        contactList: this.peMessageService.contactList
          .map(contact => contact.communications
            .map(communication => communication.integrationName !== PeMessageIntegration.Email)),
      },
      hasBackdrop: true,
      headerConfig: {
        hideHeader: true,
        removeContentPadding: true,
        title: this.translateService.translate('message-app.sidebar.new_chat_message'),
        theme: this.theme,
      },
      panelClass: 'pe-message-chat-overlay',
      component: PeMessageChatRoomFormComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$
      .pipe(
        filter(close => !!close),
        take(1),
        tap(({ contact, content, integrationName }) => {
          if (contact && content && integrationName) {
            const title = this.peMessageService.contactList
              .find(contactFromList => contactFromList._id === contact)?.name ?? '';
            const chat = { contact, integrationName, title };
            this.createChat(chat, content);
          }

          this.peOverlayWidgetService.close();
        }))
      .subscribe();
  }

  private openChannelFormOverlay(): void {
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

            return this.peMessageChatRoomListService.getConversationList();
          }))
        .subscribe();
    } else {
      this.router.navigateByUrl(this.peMessageApiService.getClientMessageUrl() + '/channel');
    }
  }

  private openFolderTreeOverlay(chat: PeMessageChat): void {
    const onSaveSubject$ = new BehaviorSubject<string>('');
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        folderTree: this.peMessageNavService.folderTree,
        theme: this.theme,
      },
      hasBackdrop: true,
      headerConfig: {
        title: this.translateService.translate('message-app.sidebar.move_to'),
        backBtnTitle: this.translateService.translate('message-app.sidebar.close'),
        backBtnCallback: () => {
          this.peOverlayWidgetService.close();
        },
        doneBtnTitle: this.translateService.translate('message-app.sidebar.save'),
        doneBtnCallback: () => {
          this.moveChatToFolder(chat._id, onSaveSubject$.value);
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
  }

  private moveChatToFolder(chatId: string, folderId: string): void {
    this.peMessageApiService.moveToFolder(chatId, folderId)
      .pipe(
        tap(() => {
          const { chatList } = this.peMessageChatRoomListService;
          const index = chatList.findIndex(chat => chat._id === chatId);
          chatList.splice(index, 1);
          const activeChat = chatList.length ? chatList[0] : null;
          this.setChatAsActive(activeChat);
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  public trackOption(index: number, option: PeMessageChat): PeMessageChat {
    return option;
  }
}
