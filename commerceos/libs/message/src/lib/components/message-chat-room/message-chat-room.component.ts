import { animate, style, transition, trigger } from '@angular/animations';
import { Clipboard } from '@angular/cdk/clipboard';
import { HttpEventType } from '@angular/common/http';
import {
  AfterViewInit,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  ElementRef,
  EventEmitter,
  Inject,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  Output,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import cloneDeep from 'lodash/cloneDeep';
import moment from 'moment';
import { BehaviorSubject, merge, Observable, of, Subject, EMPTY, Subscription, from } from 'rxjs';
import { filter, map, share, switchMap, take, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { ApiService } from '@pe/api';
import { PebEnvService } from '@pe/builder-core';
import { ChatScrollService } from '@pe/chat';
import {
  APP_TYPE,
  AppThemeEnum,
  AppType,
  EnvironmentConfigInterface,
  PE_ENV,
  PeDestroyService,
  PreloaderState,
} from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { PeGridItemsActions } from '@pe/grid';
import { LocaleConstantsService } from '@pe/i18n';
import { TranslateService } from '@pe/i18n-core';
import { MediaService } from '@pe/media';
import { PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import {
  ChatHeaderSelectedActionEnum,
  FileUploadTypes,
  PeChatAttachFileUpload,
  PeChatAttachMenu,
  PeChatAttachMenuItem,
  PeChatChannelMenuItem,
  PeChatMessage,
  PeChatMessageStatus,
  PeChatMessageType,
  PeChatPinnedMessage,
  PeChatPinnedMessageResponse,
  PeMessageChannelMember,
  PeMessageChannelMemberByCategory,
  PeMessageChat,
  PeMessageChatDraft,
  PeMessageColors,
  PeMessageConversationMemberAddMethod,
  PeMessageIntegration,
  PeMessageChatResponse,
} from '@pe/shared/chat';
import { UserAccountInterface } from '@pe/shared/user';

import { ConversationFacade, ScrollFetchData } from '../../classes';
import { messageContextMenu } from '../../constants';
import {
  PeMessageChatRoomContextMenu,
  PeMessageChatType,
  PeMessageGuardRoles,
  PeMessageWebSocketEvents,
  PeMessageWebsocketType,
} from '../../enums';
import { PeMessageChannelPermissionsEnum, PeMessageIntegrationThemeItem, PeMessageContext } from '../../interfaces';
import {
  PeMessageApiService,
  PeMessageAppsService,
  PeMessageChatBoxService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageGuardService,
  PeMessageIntegrationService,
  PeMessageLiveChatService,
  PeMessageService,
  PeMessageWebSocketService,
  PeMessageChatContextMenuService,
  PeMessageConversationService,
  PeMessageManagementService,
  PeMessageFileUploadService,
  PeMessagePinService,
  PeMessageThemeService,
  PeMessageVirtualService,
  MessageChatDialogService,
} from '../../services';
import { PeMessageChatRoomSettingsComponent, PeMessagePermissionsComponent } from '../message-chat-room-settings';
import { PeMessageForwardFormComponent } from '../message-forward';
import { PePinOverlayComponent } from '../pin-overlay';

@Component({
  selector: 'pe-message-chat-room',
  templateUrl: './message-chat-room.component.html',
  styleUrls: ['./message-chat-room.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService, ChatScrollService],
  animations: [
    trigger('inOutPaneAnimation', [
      transition('false => true', [
        style({ opacity: 0 }),
        animate(
          '750ms ease-in-out',
          style({ opacity: 1 }),
        ),
      ]),
      transition('true => false', [
        style({ opacity: 1 }),
        animate(
          '600ms ease-in-out',
          style({ opacity: 0 }),
        ),
      ]),
    ]),
  ],
})
export class PeMessageChatRoomComponent implements OnInit, AfterViewInit, OnDestroy {
  @SelectSnapshot(PreloaderState.loading) loading: {};

  @Input() theme = AppThemeEnum.default;
  @Input() mobileView = false;
  @Input() isLiveChat = false;
  @Input() isEmbedChat = false;

  @ViewChild('deleteForEveryOneTemplate', { static: true }) deleteMessageEveryoneRef;

  @Output() activatedChat = new EventEmitter<boolean>();

  chatMode = true;
  pinCount: number;
  clipboardContent$: Observable<any>;
  shownBs: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  shown$: Observable<boolean> = this.shownBs.asObservable();
  readStatus = PeChatMessageStatus.READ;
  observerOptions = {
    rootMargin: '0px',
    threshold: 0.5,
  };

  replyMessage: PeChatMessage;
  messageToHighlight: any;
  peChatMessageType = PeChatMessageType;
  selectedMessages: PeChatMessage[] = [];
  selectedText = '';
  scrollFetchData = new ScrollFetchData();
  dragDimensions: DOMRect;

  smallBoxUrlItems = this.peMessageChatBoxService.smallBoxUrls();

  timeInfo: any = {};
  messageIntegration = PeMessageIntegration;
  messagePosted = false;
  liveChatActivated?: PeMessageChat;
  draftMessage: PeChatMessage;
  editMessageData: PeChatMessage;
  private forwardMessageFromChat: PeMessageChat;
  forwardMessageData: PeChatMessage[];

  public dropFiles;
  userName: string;
  public onlineCount$ = new BehaviorSubject<number>(0);
  public currentChat: PeMessageChat;
  onlineCountSub$: Subscription

  appsImages = this.peMessageAppsService.images;
  public readonly activeChat$ = this.peMessageChatRoomListService.activeChat$.pipe(
    tap(chat => {
      if (chat) {
        this.clearSelectedMessages();
        this.envService.channelId = chat._id;
        this.scrollFetchData = new ScrollFetchData();
        const activeChatOnlineCount = this.peMessageChatRoomListService.chatOnlineCounts?.find(x => x._id === chat._id);
        this.currentChat = chat;
        this.onlineCount$.next(activeChatOnlineCount?.onlineMembersCount);
        this.currentChat.onlineMembersCount = activeChatOnlineCount?.onlineMembersCount;
      }
    }),
    share(),
  );

  public readonly channelMenuItems$ = this.peMessageChatRoomService.channelMenuItems$;
  public readonly setCursorFocus$ = new Subject<any>();
  public currentLanguage = this.localeConstantsService.getLang();
  public typingMembers: PeMessageChannelMemberByCategory[] = [];

  activeChatIntegrationType$ = this.activeChat$.pipe(map(chat => chat?.integrationName));

  activeChannel!: PeChatChannelMenuItem | PeMessageIntegration;
  scrollBottom = true;
  lastMessageSent: string;

  get attachMenuItems() {
    return [
      PeChatAttachMenuItem.App,
      ...(
        this.peMessageChatRoomListService.hasPermission(PeMessageChannelPermissionsEnum.SendMedia)
          ? [PeChatAttachMenuItem.PhotoOrVideo, PeChatAttachMenuItem.File]
          : []
      ),
      PeChatAttachMenuItem.Product,
      PeChatAttachMenuItem.Box,
    ];
  }

  get messageTitle() { return this.messageManagementService.messageTitle; }
  set messageTitle(value: string) { this.messageManagementService.messageTitle = value; }

  get pinnedMessages() { return this.peMessagePinService.pinnedMessages; }
  set pinnedMessages(value: PeChatMessage[]) { this.peMessagePinService.pinnedMessages = value; }

  get messageList() { return this.messageManagementService.messageList; }
  set messageList(value: PeChatMessage[]) { this.messageManagementService.messageList = value; }

  get colors() { return this.peMessageThemeService.colors; }
  set colors(value: PeMessageColors) { this.peMessageThemeService.colors = value; }

  messageFullTrigger = false;

  get unreadMessages(): Observable<any> {
    return this.peMessageChatRoomListService.unreadInFolder$.pipe(
      map((value: number) => {
        return value > 99 ? '99+' : value.toString();
      }),
    );
  }

  get currentSender(): string {
    const userAccount = this.peMessageService.activeUser?.userAccount;

    return `${userAccount?.firstName ?? ''} ${userAccount?.firstName ?? ''}`;
  }

  deleteMessageEveryone: { canDisplay: boolean; value: boolean } = { canDisplay: false, value: false };

  constructor(
    @Inject(PE_ENV) private env: EnvironmentConfigInterface,
    private apiService: ApiService,
    private clipboard: Clipboard,
    private localeConstantsService: LocaleConstantsService,
    private activatedRoute: ActivatedRoute,
    private changeDetectorRef: ChangeDetectorRef,
    private ref: ElementRef,
    private router: Router,
    private store: Store,

    @Optional() @Inject(APP_TYPE) private appType: AppType,
    @Inject(PE_ENV) public environmentConfigInterface: any,
    private confirmScreenService: ConfirmScreenService,
    private mediaService: MediaService,
    private envService: PebEnvService,
    private peMessagePinService: PeMessagePinService,
    private peOverlayWidgetService: PeOverlayWidgetService,
    private translateService: TranslateService,
    private messageManagementService: PeMessageManagementService,
    private readonly destroy$: PeDestroyService,
    private conversationFacade: ConversationFacade,
    private peContextMenuService: PeMessageChatContextMenuService,
    private peMessageApiService: PeMessageApiService,
    private peMessageAppsService: PeMessageAppsService,
    private peMessageChatBoxService: PeMessageChatBoxService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageManagementService: PeMessageManagementService,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private peMessageConversationService: PeMessageConversationService,
    private peMessageGuardService: PeMessageGuardService,
    private peMessageIntegrationService: PeMessageIntegrationService,
    private peMessageLiveChatService: PeMessageLiveChatService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private chatScrollService: ChatScrollService,
    private peMessageService: PeMessageService,
    private peMessageFileUploadService: PeMessageFileUploadService,
    private peMessageThemeService: PeMessageThemeService,
    private peMessageVirtualService: PeMessageVirtualService,
    private messageChatDialogService: MessageChatDialogService,
  ) {
  }

  public get channelMenuItems(): any {
    return this.peMessageChatRoomService?.channelMenuItems$;
  }

  public get isGlobalLoading(): boolean {
    return !this.appType ? false : this.loading[this.appType];
  }

  public get membersInfo(): any {
    return this.peMessageChatRoomListService.activeChat?.membersInfo;
  }

  public get noMessagesPlaceholder(): any {
    return this.peMessageChatRoomService.noMessagesPlaceholder;
  }

  ngOnInit(): void {
    this.onlineCountSub$ = this.peMessageChatRoomListService.handleOnlineMessage()
      .subscribe(chat => {
        if (chat._id === this.currentChat?._id) {
          this.currentChat.onlineMembersCount = chat.onlineMembersCount;
          this.onlineCount$.next(chat.onlineMembersCount);
        }
      });

    this.chatScrollService.scrollChange$
      .pipe(
        filter(() => this.scrollFetchData.hasNext
          && !this.scrollFetchData.onLoading
          && this.messageList?.length >= 30),
        tap(() => this.onScrollPositionChange()),
        takeUntil(this.destroy$),
      )
      .subscribe();

    merge(
      ...this.initFlow(),
      this.peMessageChatRoomListService.initAddingMembersInfoToConversation$,
      this.handlePostedMessage(),
      this.handlePinnedMessage(),
      this.handleUnpinnedMessage(),
      this.handleUpdatedMessage(),
      this.handleReceiveMessage(),
      this.handleDeletedMessage(),
      this.handleActiveChat(),
      this.handleTypingMessage(),
    ).pipe(
      takeUntil(this.destroy$),
    ).subscribe();
  }

  initFlow() {
    const initFlow$ = [];
    if (this.peMessageService.isLiveChat) {
      initFlow$.push(this.peMessageIntegrationService.currSettings$
        .pipe(
          filter((themeItem: PeMessageIntegrationThemeItem) => themeItem._id !== undefined),
          tap((themeItem: PeMessageIntegrationThemeItem) => {
            this.peMessageThemeService.setColors(themeItem.settings);
            this.messageList.forEach(message => this.peMessageThemeService.setMessageTheme(message, this.theme));
            this.changeDetectorRef.detectChanges();
          }),
        ),
      );
      this.currentLanguage = this.localeConstantsService.getLang();
    } else {
      initFlow$.push(this.apiService.getUserAccount()
        .pipe(
          tap((user: UserAccountInterface) => {
            this.currentLanguage = user?.language ?? this.localeConstantsService.getLang();
          }),
        ));

      initFlow$.push(this.handlePinnedMessage());
    }

    if (this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])) {
      initFlow$.push(this.peMessageChatRoomService.newMessage$
        .pipe(
          tap((message: PeChatMessage) => {
            this.messageManagementService.pushMessage(message);
            this.changeDetectorRef.detectChanges();
          }),
        ),
      );
    }

    initFlow$.push(this.peMessageConversationService.isLoading$
      .pipe(
        tap(() => {
          this.changeDetectorRef.markForCheck();
        }),
      ),
    );

    return initFlow$;
  }

  getClipboardPromise(): Promise<any> {
    return navigator.clipboard.readText().then(text => text);
  }

  backArrowClick(): void {
    this.peMessageConversationService.forgetCurrentConversation();
  }

  chatModeToggle(): void {
    this.chatMode = !this.chatMode;
    const chat = this.peMessageChatRoomListService.activeChat;
    if (!this.chatMode && chat && chat.messages) {
      this.peMessageApiService.allPinnedMessages(chat?.business, chat?._id).pipe(
        tap((pinnedMessages: PeChatPinnedMessage[]) => {
          this.pinCount = pinnedMessages.length;
          let pinnMessages =
            chat.messages.filter(a => pinnedMessages.some(b => a._id === b._id));
          pinnMessages = pinnMessages.map(m => this.messageManagementService.messageTransform(m));
          this.messageList = this.peMessageVirtualService
            .reloadVirtualMessages(pinnMessages, pinnMessages, false, true);
          this.changeDetectorRef.detectChanges();
        })
      ).subscribe();
    } else if (chat) {
      const chatMessages = chat.messages.map(m => this.messageManagementService.messageTransform(m));
      this.messageList = this.peMessageVirtualService
        .reloadVirtualMessages(chatMessages, chatMessages, false, true);
      this.changeDetectorRef.detectChanges();
    }
  }

  unpinAllMessages() {
    const headings: Headings = {
      title: this.translateService.translate('message-app.unpin_all_overlay.title'),
      subtitle: this.translateService.translate('message-app.unpin_all_overlay.subtitle'),
      declineBtnText: this.translateService.translate('message-app.unpin_all_overlay.cancel'),
      confirmBtnText: this.translateService.translate('message-app.unpin_all_overlay.unpin_all'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          this.pinnedMessages.forEach(value => {
            this.peMessagePinService.unpinMessage(value);
          });
          this.chatModeToggle();
          this.changeDetectorRef.detectChanges();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  ngAfterViewInit(): void {
    this.dragDimensions = this.ref.nativeElement.getBoundingClientRect();
    this.peMessageChatRoomListService.activeChat$
      .pipe(
        filter(chat => !!chat),
        tap((activeChat) => {
          this.shownBs.next(!!activeChat);
          this.activatedChat.emit(!!activeChat);
          this.messageFullTrigger = !!activeChat.draft;

          this.replyMessage = null;
          const activeChatMessage = this.peMessageConversationService.conversationList$.value
            .find(conversation => conversation.id === activeChat._id)?.data;

          if (activeChatMessage && activeChatMessage.replyToMessage) {
            this.replyMessage = activeChatMessage.replyToMessage;
          }

          this.forwardMessageData = null;
          if (activeChatMessage && activeChatMessage.forwardMessageData) {
            this.forwardMessageData = activeChatMessage.forwardMessageData;
          }

          this.changeDetectorRef.detectChanges();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  messageAccentColor(message: PeChatMessage): string {
    return this.isLiveChat ? this.peMessageThemeService.messageAccentColor(message) : null;
  }

  handleReceiveMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_SCROLL_RESPONSE)
      .pipe(
        tap((res: PeMessageChatResponse) => {

          this.scrollFetchData.hasNext = res.hasNext;
          this.scrollFetchData.counter++;

          let receivedMessages = res.messages.map((message: PeChatMessage) => {
            return this.messageManagementService.messageTransform(message);
          });
          receivedMessages.forEach(receiveMessage => {
            if (!this.messageList.some(existsMessage => existsMessage._id === receiveMessage._id)) {
              this.messageList.unshift(receiveMessage);
            }
          });

          this.messageList =
            this.peMessageVirtualService.reloadVirtualMessages(this.messageList, this.messageList, false);
          this.changeDetectorRef.detectChanges();
          this.scrollFetchData.onLoading = false;
        }),
      );
  }

  onDragOver($event) {
    $event?.preventDefault();
    this.dragDimensions = this.ref.nativeElement.getBoundingClientRect();
    this.isForm() && (this.dropFiles = $event);
  };

  unpinMessage(message: PeChatMessage) {
    const headings: Headings = {
      title: this.translateService.translate('unpin-overlay.title'),
      subtitle: this.translateService.translate('unpin-overlay.subtitle'),
      declineBtnText: this.translateService.translate('unpin-overlay.cancel'),
      confirmBtnText: this.translateService.translate('unpin-overlay.unpin'),
    };
    this.confirmScreenService.show(headings, true).pipe(
      filter(res => res),
      take(1),
      tap((val) => {
        this.peMessagePinService.unpinMessage(message);
        !this.chatMode && this.pinCount === 1 ?
          this.chatModeToggle() :
          (this.chatMode = !this.chatMode, this.chatModeToggle());
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  onDragLeave($event) {
    $event?.preventDefault();
    const { pageX, pageY } = $event;
    const { left, top, right, bottom } = this.ref.nativeElement.getBoundingClientRect();
    if (left > pageX || pageX > right || top > pageY || pageY > bottom) { this.dropFiles = null; }
  }

  public setCursorFocus(): void {
    // ({}) using for @Input set. Dont remove it!
    this.setCursorFocus$.next({});
  }

  private onScrollPositionChange() {
    this.scrollFetchData.onLoading = true;
    this.peMessageChatRoomService.getOldMessages(this.scrollFetchData.uuid,
      this.peMessageChatRoomListService.activeChat,
      this.scrollFetchData.counter * 50);
  }

  public deleteChat(): void {
    this.peMessageChatRoomListService.deleteChat()
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  handlePostedMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_POSTED)
      .pipe(
        filter(message => !!message),
        tap((postedMessage: PeChatMessage) => {
          const message = cloneDeep(postedMessage);
          const chat = cloneDeep(this.peMessageChatRoomListService.activeChat);
          if (chat?._id === message.chat) {
            this.messageManagementService.getNonLoadingMessage(message);
            chat.messages = chat.messages ?? [];
            chat.messages.push(message);
            chat.messages = chat.messages ?? [];
            chat.messages.push(message);
            this.messageManagementService.pushMessage({ ...message });
            if (this.peMessageService.activeUser?._id !== message.sender) {
              this.peMessageChatRoomListService.detectChangeStream$.next();
              message.status = this.readStatus;
            }
            if (chat.draft && chat.draft.sender === postedMessage.sender) {
              chat.draft = null;
              chat.replyToMessage = null;
              chat.forwardMessageData = null;
            }
            this.peMessageChatRoomListService.activeChat = chat;
            this.messagePosted = true;
          }

          const foundChat = this.peMessageChatRoomListService.chatList.find(chat => chat._id === message.chat);
          if (foundChat) {
            foundChat.messages = cloneDeep(foundChat.messages ?? []);
            foundChat.messages.push(message);
            foundChat.messages = cloneDeep(foundChat.messages ?? []);
            foundChat.messages.push(message);
            foundChat.updatedAt = message.sentAt;
          }
          this.changeDetectorRef.detectChanges();
        }),
      );
  }

  handleTypingMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_TYPING)
      .pipe(
        filter(chat => !!chat),
        tap((chat: PeMessageChat) => {
          if (this.peMessageChatRoomListService.activeChat?._id === chat._id) {
            this.typingMembers = chat.typingMembers
              .filter(a => !!a.userAccount?.firstName && a.user !== this.peMessageService.getUserData().uuid);
            this.changeDetectorRef.detectChanges();
          }
        }),
      );
  }

  handleUpdatedMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_UPDATED)
      .pipe(
        filter(message => !!message),
        tap((updatedMessage: PeChatMessage) => {
          const message = cloneDeep(updatedMessage);
          if (this.peMessageChatRoomListService.activeChat?._id === message.chat) {
            this.messageManagementService.getNonLoadingMessage(message);
            this.messageManagementService.updateMessage(message);

            if (this.peMessageService.activeUser?._id !== message.sender) {
              this.peMessageChatRoomListService.detectChangeStream$.next();

              message.status = this.readStatus;
            }
          }

          const foundChat = this.peMessageChatRoomListService.chatList.find(chat => chat._id === message.chat);
          if (foundChat) {
            foundChat.messages = foundChat.messages ?? [];
            foundChat.messages.splice(
              foundChat.messages?.findIndex(m => m._id === message._id),
              1,
              message,
            );
            foundChat.updatedAt = message.sentAt;
          }

          if (this.pinnedMessages) {
            const index = this.pinnedMessages.findIndex(p => p._id === message._id);
            if (index >= 0) {
              this.pinnedMessages.splice(index, 1, message);
              this.pinnedMessages = [...this.pinnedMessages];
            }
          }

          this.changeDetectorRef.detectChanges();
        }),
      );
  }

  handleDeletedMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_DELETED)
      .pipe(
        filter(message => !!message),
        tap((message: PeChatMessage) => {
          this.messageManagementService.handleDeleteMessage(message);
          this.changeDetectorRef.markForCheck();
        }),
      );
  }

  public handleTyping({ chat, isTyping }): void {
    if (!chat || !this.peMessageChatRoomListService.activeChat){
      return;
    }

    const { _id, websocketType } = chat ?? this.peMessageChatRoomListService.activeChat;
    if (isTyping) {
      this.peMessageWebSocketService.typingMessage(websocketType ?? PeMessageWebsocketType.Regular, _id);
    } else {
      this.peMessageWebSocketService.typingStoppedMessage(websocketType ?? PeMessageWebsocketType.Regular, _id);
    }
  }

  private updatePinnedMessages(message) {
    if (!this.peMessagePinService.pinnedMessages.find(pm => pm._id === message._id)) {
      const pinnedMessage = cloneDeep(message);
      this.peMessagePinService.pinnedMessages = ([...this.pinnedMessages, pinnedMessage])
        .sort((a, b) => a.createdAt > b.createdAt ? 1 : -1);
    }
  }

  handlePinnedMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_PINNED)
      .pipe(
        tap((response: PeChatPinnedMessageResponse) => {
          const chat = this.peMessageChatRoomListService.chatList.find(c => c._id === response.chat._id);
          if (chat) {
            chat.pinned.push(response.pinned);
            this.updatePinnedMessages(response.message);
          }

          this.changeDetectorRef.detectChanges();
        }),
      );
  }

  handleUnpinnedMessage() {
    return this.peMessageWebSocketService.handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_UNPINNED)
      .pipe(
        tap((response: PeChatPinnedMessageResponse) => {
          const chat = this.peMessageChatRoomListService.chatList.find(c => c._id === response.chat._id);
          if (chat) {
            chat.pinned = chat.pinned.filter(m => response.pinned._id !== m._id);
            this.peMessagePinService.updatePinnedMessages(response);
          }

          this.changeDetectorRef.detectChanges();
        }),
      );
  }

  getAllPinnedMessages(chat = this.peMessageChatRoomListService.activeChat) {
    if (!chat?.business) {
      return of(null);
    }

    return this.peMessageApiService.allPinnedMessages(chat.business, chat._id).pipe(
      tap((pinnedMessages: PeChatPinnedMessage[]) => {

        pinnedMessages.forEach(pinnedMessage => {

          const message = chat.messages.find(m => pinnedMessage.messageId === m._id);
          if (message) {
            message.pinId = pinnedMessage._id;
          }
        });

        chat.pinned = pinnedMessages;
        this.pinnedMessages = pinnedMessages;
        this.changeDetectorRef.markForCheck();
      }),
    );
  }

  appsMenuItem(item: { app: string; image: string }): void {
    this.peMessageAppsService.appsMenuItem(item);
  }

  smallBoxItem(item: { text: string; url: string; icon: string }): void {
    const event = {
      interactive: {
        action: item.url,
        defaultLanguage: 'en',
        icon: item.icon === null ? undefined : item.icon,
        marked: false,
        translations: {
          en: item.text,
        },
      },
      message: item.text,
      type: 'box',
    };

    this.peMessageChatRoomService.sendMessage(event);
  }

  largeBoxItem(item: { image: File; text: string }): void {
    this.peMessageApiService.postMedia(item.image, FileUploadTypes.Image).subscribe(event => {
      if (event.type === HttpEventType.Response) {
        const message = {
          interactive: {
            image: this.mediaService.getMediaUrl(event.body.blobName, 'message'),
            defaultLanguage: 'en',
            translations: {
              en: item.text,
            },
          },
          message: item.text,
          type: 'box',
        };
        this.peMessageChatRoomService.sendMessage(message);
      }
    });
  }

  draft({ chatId, draftMessage }: PeMessageChatDraft): void {
    const activeChat = Object.assign(
      {},
      chatId
        ? this.peMessageConversationService.conversationList$.value.find(
            (conversation) => conversation.id === chatId
          )?.data
        : this.peMessageChatRoomListService.activeChat
    );

    if (this.editMessageData) {
      return;
    }
    const isNewMessageToDraft = draftMessage && draftMessage !== '';
    const draftAction$ = isNewMessageToDraft
      ? this.peMessageChatRoomListService.postDraftMessage(activeChat, draftMessage)
      : activeChat.draft
        ? this.peMessageChatRoomListService.deleteDraftMessage(activeChat, activeChat.draft)
        : EMPTY;
    (isNewMessageToDraft || !!activeChat.draft) && draftAction$
      .pipe(
        take(1),
        tap((message) => {
          activeChat.draft = message ?? null;
          const conversation = this.peMessageConversationService.conversationToGridItemMapper([activeChat])[0];
          this.store.dispatch(new PeGridItemsActions.EditItem(conversation, 'message'));
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  selectedActions(action) {
    switch (action) {
      case ChatHeaderSelectedActionEnum.Forward:
        this.forwardMessage(this.peMessageChatRoomListService.activeChat, this.selectedMessages);
        break;
      case ChatHeaderSelectedActionEnum.Delete:
        const chat = this.peMessageChatRoomListService.activeChat;
        this.showConfirmationDialog(chat, this.selectedMessages);
        break;
      default:
        this.clearSelectedMessages();
        break;
    }
  }

  clearSelectedMessages() {
    this.selectedMessages = [];
    this.messageManagementService.clearSelectedMessages();
    this.changeDetectorRef.detectChanges();
  }

  attachMenuItem(item: PeChatAttachMenu): void {
    switch (item.type) {
      case PeChatAttachMenuItem.Product:
        this.router.navigate(['products'], { relativeTo: this.activatedRoute });
        break;
      case PeChatAttachMenuItem.PhotoOrVideo:
      case PeChatAttachMenuItem.File:
        if (item.data) { this.peMessageFileUploadService.attachFileUpload(item.data as PeChatAttachFileUpload); }
        break;
    }
  }

  channelMenuItem(item: PeChatChannelMenuItem): void {
    this.activeChannel = item;

    const chat = this.peMessageChatRoomListService.chatList.find(
      c => c.contact === this.peMessageChatRoomListService.activeChat?.contact,
    );

    if (chat?.integrationName === (item as string)) {
      this.peMessageChatRoomListService.activeChat = chat;
    }
  }

  openMessageContextMenu(event: MouseEvent, message: PeChatMessage): void {
    event.preventDefault();
    event.stopPropagation();

    if (message.type === PeChatMessageType.Box) {
      return;
    }

    const selectedText = window.getSelection().toString();
    const isSelectedZone = window.getSelection().anchorNode?.parentNode === event.target;
    const isMessagePinned = !!this.pinnedMessages.find(pM => pM._id === message._id);
    const seenList = message.readBy || [];

    if ([PeChatMessageType.DateSeparator, PeChatMessageType.WelcomeMessage].includes(message.type)) {
      return;
    }

    let contextMenu: PeMessageContext;

    if (this.selectedMessages.length > 0 && !message.selected) {
      contextMenu = {
        title: 'message-app.chat-room.context-menu.title',
        list: [{
          label: 'message-app.chat-room.context-menu.items.select',
          value: PeMessageChatRoomContextMenu.Select,
        }],
      };
    } else {
      contextMenu = messageContextMenu(
        message.selected,
        message.sender === this.peMessageService.getUserData().uuid && !message.forwardFrom,
        selectedText && isSelectedZone,
        isMessagePinned,
        seenList,
        this.chatMode,
      );
    }

    if (message.type === PeChatMessageType.Event){
      contextMenu.list.splice(0,2);
    }

    const config = {
      data: contextMenu,
      panelClass: 'pe-message-chat-room-context-menu',
      theme: this.theme,
    };

    const dialogRef = this.peContextMenuService.open(event, config);

    dialogRef.afterClosed
      .pipe(
        take(1),
        tap((res) => {
          const chat = this.peMessageChatRoomListService.activeChat;

          switch (res) {
            case PeMessageChatRoomContextMenu.Edit:
              this.editMessage(chat, message);
              break;
            case PeMessageChatRoomContextMenu.GoToMessage:
              this.goToMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Forward:
              this.forwardMessage(chat, [message]);
              break;
            case PeMessageChatRoomContextMenu.ForwardSelected:
              this.forwardMessage(chat, [...this.selectedMessages]);
              break;
            case PeMessageChatRoomContextMenu.Select:
              this.selectMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Copy:
              this.selectedText = selectedText && isSelectedZone ? selectedText : this.getCopyText(message);
              this.clipboard.copy(this.selectedText);
              break;
            case PeMessageChatRoomContextMenu.CopySelected:
              this.selectedText = this.selectedMessages?.map(message => this.getCopyText(message)).join('\r\n\r\n');
              this.clipboard.copy(this.selectedText);
              break;
            case PeMessageChatRoomContextMenu.ClearSelection:
              this.clearSelectedMessages();
              break;
            case PeMessageChatRoomContextMenu.Reply:
              this.replyingMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Pin:
              this.openPinDialog(message);
              break;
            case PeMessageChatRoomContextMenu.Unpin:
              this.unpinMessage(message);
              break;
            case PeMessageChatRoomContextMenu.Delete:
              const messagesToDelete = this.selectedMessages.length ? this.selectedMessages : [message];
              this.showConfirmationDialog(chat, messagesToDelete);
              break;
          }
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private getCopyText(message: PeChatMessage): string {
    let textParts = [];

    if (message.replyData) {
      textParts.push(`[${this.translateService.translate('message-app.chat-room.in_reply_to')} ${message.replyData.name}]`);
    }

    if (message.content) {
      textParts.push(message.content);
    }

    if (!message.content && message.attachments?.length) {
      textParts.push('[File]');
    }

    textParts = textParts.filter( x => x !== '' );

    return textParts.join('\r\n').trim();
  }

  openPinDialog(message) {
    let name = null;
    const activeChatType = this.peMessageChatRoomListService.activeChat.type;
    if (
      activeChatType === PeMessageChatType.Chat
      || activeChatType === PeMessageChatType.DirectChat
    ) {
      name = message.name;
    }
    const onCloseSubject$ = new Subject<boolean>();
    const peOverlayConfig: PeOverlayConfig = {
      data: {
        onCloseSubject$,
        theme: this.theme,
        name,
      },
      backdropClick: () => {
        this.peOverlayWidgetService.close();
      },
      hasBackdrop: true,
      headerConfig: {
        title: '',
        hideHeader: true,
      },
      panelClass: 'pe-message-pin-overlay',
      component: PePinOverlayComponent,
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onCloseSubject$.pipe(
      take(1),
      switchMap(result => {
        if (result === null) {
          this.peOverlayWidgetService.close();

          return of(null);
        }

        return this.peMessagePinService.pinMessage(message).pipe(
          tap(() => {
            this.changeDetectorRef.markForCheck();
            this.peOverlayWidgetService.close();
          }),
        );
      },
      ),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  openChatFormContextMenu(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();
    
    const data = {
      title: this.translateService.translate('message-app.chat-room.context-menu.title'),
      list: [
        {
          label: this.translateService.translate('message-app.chat-room.context-menu.items.paste'),
          value: PeMessageChatRoomContextMenu.Paste,
        },
      ],
    };

    const config = {
      data,
      panelClass: 'pe-message-chat-form-context-menu',
      theme: this.theme,
    };

    const dialogRef = this.peContextMenuService.open(event, config);

    this.clipboardContent$ = from(this.getClipboardPromise());

    dialogRef.afterClosed
      .pipe(
        take(1),
        withLatestFrom(this.clipboardContent$),
        tap(([type, clipBoardText]) => {
          this.selectedText = clipBoardText;
          if (type === PeMessageChatRoomContextMenu.Paste) {
            const textarea = event.target as HTMLTextAreaElement;
            this.messageFullTrigger = !!textarea.value;
            this.changeDetectorRef.detectChanges();
            if (textarea.setRangeText) {
              textarea.setRangeText(this.selectedText);
            } else {
              textarea.focus();
              document.execCommand('insertText', false, this.selectedText);
            }
            this.draft({ draftMessage: textarea.value });
            this.messageFullTrigger = !!this.selectedText;
            this.setCursorFocus();
            this.changeDetectorRef.markForCheck();
          }
        }),
      )
      .subscribe();
  }

  selectMessage(message) {
    if (!message.selected) {
      this.selectedMessages.push(message);
    } else {
      this.selectedMessages = this.selectedMessages.filter(sM => sM._id !== message._id);
    }

    message.selected = !message.selected;
    this.changeDetectorRef.markForCheck();
  }

  showConfirmationDialog(chat: PeMessageChat, messages: PeChatMessage[]) {
    const currentUserId = this.peMessageService.getUserData().uuid;
    this.deleteMessageEveryone = { canDisplay: !messages.some(m => m.sender !== currentUserId), value: false };

    const headings: Headings = {
      title: messages.length > 1
        ? this.translateService.translate('message-app.message-overlay.delete_multiple.title')
        : this.translateService.translate('message-app.message-overlay.delete.title'),
      subtitle: messages.length > 1
        ? this.translateService.translate('message-app.message-overlay.delete_multiple.label')
        : this.translateService.translate('message-app.message-overlay.delete.label'),
      declineBtnText: this.translateService.translate('message-app.message-overlay.delete.decline'),
      confirmBtnText: this.translateService.translate('message-app.message-overlay.delete.confirm'),
      customMiddleTemplate: this.deleteMessageEveryone.canDisplay ? this.deleteMessageEveryoneRef : null,
    };

    this.confirmScreenService.show(headings, true).pipe(
      tap((val) => {
        if (val) {
          messages.forEach(message => {
            this.messageManagementService.deleteMessage(chat, message, this.deleteMessageEveryone.value);
            this.changeDetectorRef.detectChanges();
          });
          this.messageChatDialogService.setDeleteEveryone(false);
          this.clearSelectedMessages();
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private editMessage(chat: PeMessageChat, message: PeChatMessage): void {
    this.editMessageData = { ...message };
    this.changeDetectorRef.detectChanges();
  }

  goToMessage(message) {
    this.chatModeToggle();
    this.messageToHighlight = message;
    this.changeDetectorRef.detectChanges();
  }

  editMessageCancelled(): void {
    this.editMessageData = null;
    this.changeDetectorRef.detectChanges();
  }

  forwardMessageCancelled(): void {
    if (this.forwardMessageData && this.forwardMessageData.length) {
      this.forwardMessageData = [];
      const replyChat = this.peMessageConversationService.conversationList$.value
        .find(conversation => conversation.id === this.peMessageChatRoomListService.activeChat._id).data;
      replyChat.forwardMessageData = null;
      this.changeDetectorRef.detectChanges();
      this.clearSelectedMessages();
    }
  }

  private forwardMessage(chat: PeMessageChat, message: PeChatMessage[]): void {
    this.openForwardFormOverlay(chat, message);
    this.changeDetectorRef.detectChanges();
  }

  public openChangeRecipientOverlay(): void {
    this.openForwardFormOverlay(this.forwardMessageFromChat, this.forwardMessageData, true);
  }

  private openForwardFormOverlay(chat: PeMessageChat, messages: PeChatMessage[], messagesAlreadyInit?: boolean): void {
    this.forwardMessageFromChat = chat;
    const onChatSelectSubject$ = new Subject<PeMessageChat>();
    const closeForm = () => {
      this.peOverlayWidgetService.close();
      onChatSelectSubject$.unsubscribe();
    };
    const peOverlayConfig: PeOverlayConfig = {
      component: PeMessageForwardFormComponent,
      backdropClick: closeForm,
      data: {
        onChatSelectSubject$,
        isLiveChat: this.isLiveChat,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.chat.forward.cancel'),
        removeContentPadding: true,
        theme: this.theme,
        title: this.translateService.translate('message-app.chat.forward.title'),
      },
      panelClass: 'pe-message-forward-form-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onChatSelectSubject$
      .pipe(
        tap(({ _id }: PeMessageChat) => {
          this.peMessageConversationService.setConversationAsActiveById$.next(_id);
          const { membersInfo } = chat;
          const forwardingMessages = messages.map((message) => {
            if (membersInfo) {
              const memberInfo = membersInfo.find(member => member.user._id === message.sender);
              const firstName = memberInfo?.user?.userAccount?.firstName;
              const lastName = memberInfo?.user?.userAccount?.lastName;
              message.senderTitle = firstName || lastName
                ? `${firstName || ''} ${lastName || ''}`
                : this.translateService.translate('message-app.chat.anonymous-user');
            }

            return message;
          });
          this.forwardMessageData = messagesAlreadyInit
            ? forwardingMessages
            : forwardingMessages.map(i => ({ ...i, name: this.messageTitle || i.name }));
          const forwardChat = this.peMessageConversationService.conversationList$.value
            .find(conversation => conversation.id === _id).data;
          forwardChat.forwardMessageData = this.forwardMessageData;
          this.changeDetectorRef.detectChanges();
          closeForm();
        }),
        takeUntil(this.destroy$))
      .subscribe();
  }

  onAvatarInHeader(): void {
    if (this.isLiveChat || this.isEmbedChat) {
      return;
    }

    const closeForm = () => {
      this.peOverlayWidgetService.close();
    };

    const peOverlayConfig: PeOverlayConfig = {
      component: PeMessageChatRoomSettingsComponent,
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnCallback: closeForm,
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        theme: this.theme,
        title: this.peMessageChatRoomListService.activeChat?.title,
      },
      panelClass: 'pe-message-chat-room-settings-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);
  }

  isForm(): boolean {
    const activeChat = this.peMessageChatRoomListService.activeChat;

    if (
      activeChat?.integrationName === PeMessageIntegration.Email
      || activeChat?.template
      || activeChat?.type === PeMessageChatType.AppChannel
      || activeChat?.app
    ) {
      return false;
    }

    if (this.isLiveChat) {
      return !(activeChat?.type === PeMessageChatType.Channel && activeChat?.usedInWidget);
    }

    if (this.isGroup(activeChat) || this.isChannel(activeChat)) {
      return this.peMessageChatRoomListService.hasPermission();
    }

    return true;
  }

  isGroup(activeChat) {
    return activeChat?.type === PeMessageChatType.Group;
  }

  isChannel(activeChat) {
    return activeChat?.type === PeMessageChatType.Channel;
  }

  isOwner(activeChat) {
    const currentUserId = this.peMessageService.getUserData().uuid;

    return !!activeChat?.members?.find(member =>
      member.owner === PeMessageConversationMemberAddMethod.Owner && member.user === currentUserId
    );
  }

  isEmail() {
    return this.peMessageChatRoomListService.activeChat?.integrationName === PeMessageIntegration.Email;
  }

  markedBox(event: any, message: PeChatMessage): void {
    const linkNormalised = this.peMessageChatBoxService.linkNormalise(event.url);
    if (event.blank || this.peMessageService.isLiveChat) {
      this.router.navigate([linkNormalised]).then();
    } else {
      this.router.navigate([linkNormalised], { queryParams: { fromTODO: true } }).then();
    }

    if (message.type === 'box') {
      message.interactive.marked = true;
      this.peMessageApiService.postChatMessageMarked(message.chat, message._id, true).pipe(take(1)).subscribe();
    }
  }

  private handleActiveChat() {
    return this.peMessageChatRoomListService.activeChat$
      .pipe(
        switchMap((chat: PeMessageChat | null) => {
          this.chatMode = true;
          this.activeChannel = chat?.integrationName;
          this.timeInfo.lastSeen = chat?.lastSeen ?? '';
          this.timeInfo.currentlyAnswering = chat?.updatedAt ?? '';

          return merge(
            this.conversationFacade.normalizeActiveChat(
              chat,
              this.peMessageService.isLiveChat,
              this.env.custom.storage,
              this.peMessageChatRoomListService,
            ).pipe(
              tap((res) => {
                this.messageManagementService.handleActiveMessage(res);
                this.changeDetectorRef.detectChanges();
              }),
            ),
            this.getAllPinnedMessages(chat),
          );
        }),
      );
  }

  public getAvatarForCurrentUser(chat: PeMessageChat) {
    const currentUserId = this.peMessageService.getUserData().uuid;
    const avatar = chat?.membersInfo?.find(member => member.user._id === currentUserId)?.user?.userAccount?.logo;

    return avatar && this.mediaService.getMediaUrl(avatar, 'images');
  }

  public getAvatarFromDirect(chat: PeMessageChat): string {
    if (PeMessageChatType.DirectChat === chat.type) {
      const currentUserId = this.peMessageService.getUserData().uuid;
      const avatar = chat.membersInfo?.find(member => member.user._id !== currentUserId)?.user?.userAccount?.logo;

      return avatar && this.mediaService.getMediaUrl(avatar, 'images');
    }

    return '';
  }

  templateAction(data): void {
    if (data.provider === PeChatChannelMenuItem.LiveChat) {
      this.peMessageLiveChatService.initLiveChat(data);
    }
  }

  openLastMessageInEditMenu() {
    if (this.messageList && this.messageList.length) {
      const lastMessage = this.getLastMessage();
      
      if (!lastMessage || lastMessage.type === PeChatMessageType.Event){
        return;
      }
      this.editMessage(this.peMessageChatRoomListService.activeChat, this.getLastMessage());
    }
  }

  getLastMessage() {
    const currentUserId = this.peMessageService.getUserData().uuid;

    return this.messageList
      .filter((message: PeChatMessage) => message.sender === currentUserId && !message.forwardFrom)
      .pop();
  }

  sendMessage(message) {
    const activeChat = this.peMessageChatRoomListService.activeChat;
    if (this.editMessageData) {
      if (this.editMessageData && this.editMessageData.content === message.message) {
        this.editMessageCancelled();

        return;
      }
      if (this.editMessageData && message.message === '') {
        this.showConfirmationDialog(activeChat, [this.editMessageData]);
        this.editMessageCancelled();

        return;
      }
      this.peMessageWebSocketService.updateMessage(
        activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
        {
          content: message.message,
          _id: this.editMessageData._id,
        },
      );

      this.editMessageData.content = message.message;

      this.editMessageCancelled();

      return;
    }

    if (this.replyMessage) {
      message.replyTo = this.replyMessage._id;
      this.replyMessage = null;
    }

    this.peMessageChatRoomService.sendMessage(message);
    if (this.forwardMessageData) {
      this.peMessageConversationService.rememberCurrentConversation(activeChat._id);
      this.peMessageWebSocketService.forwardMessage(
        activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
        {
          chat: activeChat._id,
          ids: this.forwardMessageData.map((a) => a._id),
          withSender: message.withSender,
        },
      );

      this.forwardMessageCancelled();
    }

    this.changeDetectorRef.detectChanges();
    this.lastMessageSent = message.message;
  }

  replyingMessage(message: PeChatMessage) {
    this.replyMessage = { ...message };
    const activeChatMessage = this.peMessageConversationService.conversationList$.value
      .find(conversation => conversation.id === this.peMessageChatRoomListService.activeChat._id).data;
    activeChatMessage.replyToMessage = this.replyMessage;
    this.setCursorFocus$.next({});
    this.changeDetectorRef.markForCheck();
  }

  cancelReplyMessage(event) {
    this.replyMessage = null;
    const replyChat = this.peMessageConversationService.conversationList$.value
      .find(conversation => conversation.id === this.peMessageChatRoomListService.activeChat._id).data;
    replyChat.replyToMessage = null;
    this.changeDetectorRef.detectChanges();
  }

  private memberPermissions(member: PeMessageChannelMember): void {
    const { activeChat } = this.peMessageChatRoomListService;
    const isCurrentMemberOwner = activeChat.members.some((activeChatMember) => {
      return activeChatMember.user === member._id
        && activeChatMember.addMethod === PeMessageConversationMemberAddMethod.Owner;
    });
    const currentUserId = this.peMessageService.getUserData().uuid;
    const onSaveSubject$ = new BehaviorSubject<boolean>(false);
    const closeForm = () => {
      onSaveSubject$.next(true);
    };
    const peOverlayConfig: PeOverlayConfig = {
      backdropClick: closeForm,
      component: PeMessagePermissionsComponent,
      data: {
        member,
        isNotEditable: member._id === currentUserId || isCurrentMemberOwner,
        channel: activeChat,
      },
      hasBackdrop: true,
      headerConfig: {
        backBtnCallback: closeForm,
        backBtnTitle: this.translateService.translate('message-app.sidebar.cancel'),
        doneBtnTitle: this.translateService.translate('message-app.sidebar.done'),
        onSaveSubject$,
        theme: this.theme,
        title: member.title,
      },
      panelClass: 'pe-message-permission-overlay',
    };

    this.peOverlayWidgetService.open(peOverlayConfig);

    onSaveSubject$
      .pipe(
        filter(Boolean),
        take(1),
        tap(this.closeForm),
        takeUntil(this.destroy$))
      .subscribe();
  }

  private closeForm = (): void => {
    this.peOverlayWidgetService.close();
  };

  public getMember(senderId: string): void {
    const memberInfo = this.peMessageChatRoomListService.activeChat.membersInfo.find(a => a.user._id === senderId);
    const member = this.peMessageChatRoomListService.getMember(memberInfo);
    this.memberPermissions(member);
  }

  ngOnDestroy() {
    if (this.peMessageChatRoomListService.activeChat) {
      this.peMessageWebSocketService.leaveChat(
        this.peMessageChatRoomListService.activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
        this.peMessageChatRoomListService.activeChat._id,
      );
    }
    if (this.onlineCountSub$) {
      this.onlineCountSub$.unsubscribe();
    }
  }

  showRepliedMessage(res) {
    this.chatScrollService.scrollToMessage$.next(res);
  }

  public toggleButtonChanged($event){
    this.deleteMessageEveryone.value = $event;
  }
}
