import { Inject, Injectable } from '@angular/core';
import { ApmService } from '@elastic/apm-rum-angular';
import cloneDeep from 'lodash/cloneDeep';
import { BehaviorSubject, EMPTY, merge, Observable, of, Subject } from 'rxjs';
import { catchError, filter, map, pairwise, startWith, switchMap, take, tap } from 'rxjs/operators';

import { EnvironmentConfigInterface, MessageBus, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import {
  PeMessageChannelMemberByCategory,
  PeMessageChannelRoles,
  PeMessageChat,
  PeMessageConversationMember,
  PeMessageChatCurrentMemberInfo,
} from '@pe/shared/chat';
import { Contact } from '@pe/shared/contacts';
import { SnackbarService } from '@pe/snackbar';

import { ChatListFacade, ConversationFacade } from '../classes';
import {
  PeLiveChatEnum,
  PeMessageAddMethod,
  PeMessageChatType,
  PeMessageGuardRoles,
  PeMessageWebSocketEvents,
  PeMessageWebsocketType,
} from '../enums';
import {
  PeMessageChannelPermissionsEnum,
  PeMessageConversationListConfig,
  PeMessageWebSocketIncludedDTO,
  PeMessageChatDeleteData,
} from '../interfaces';

import { PeMessageApiService } from './message-api.service';
import { PeMessageGuardService } from './message-guard.service';
import { MessageStateService } from './message-state.service';
import { PeMessageWebSocketService } from './message-web-socket.service';
import { PeMessageService } from './message.service';

@Injectable()
export class PeMessageChatRoomListService {

  conversationListConfig: PeMessageConversationListConfig = {
    todo: null,
    initialization: true,
    clearCache: true,
  };

  readonly detectChangeStream$ = new Subject();
  readonly draftChange$ = new Subject<string>();
  readonly openPermissionPopUp$ = new Subject();

  deleteChatFromSettings$ = new Subject<PeMessageChatDeleteData>();
  actionDeleteChatFromSettings$ = this.deleteChatFromSettings$.asObservable();

  private readonly unreadInFolderStream$ = new BehaviorSubject<any>(0);
  readonly unreadInFolder$ = this.unreadInFolderStream$.asObservable();

  get unreadInFolder(): number {
    return this.unreadInFolderStream$.value;
  }

  set unreadInFolder(count: number) {
    this.unreadInFolderStream$.next(count);
  }

  private readonly overlayFormReopenStream$ = new Subject<boolean>();
  readonly formReopen$ = this.overlayFormReopenStream$.asObservable();

  set overlayFormReopen(value: boolean) {
    this.overlayFormReopenStream$.next(value);
  }

  private readonly activeChatStream$ = new BehaviorSubject<PeMessageChat | null>(null);
  private readonly actionActiveChat$ = new Subject<PeMessageChat>();
  readonly activeChat$ = this.activeChatStream$.asObservable();

  public get activeChat(): PeMessageChat | null {
    return this.activeChatStream$.value;
  }

  public set activeChat(chat: PeMessageChat | null) {
    const currentUserId = this.peMessageService.getUserData().uuid;
    if (chat) {
      const currentMemberInfo = chat.membersInfo?.find(member => member.user._id === currentUserId);
      const currentMember = chat.members?.find(member => member.user === currentUserId);

      chat.currentMember = {
        ...currentMemberInfo,
        ...currentMember,
      };
    }
    const activeChat = cloneDeep(chat);
    this.actionActiveChat$.next(activeChat);
  }

  mobileView = false;

  _countLiveChat = [];
  chatOnlineCounts:PeMessageChat[] = []
  onlineMembers = [];
  private readonly chatListStream$ = new BehaviorSubject<PeMessageChat[]>([]);
  readonly chatList$ = this.chatListStream$.asObservable();

  get chatList(): PeMessageChat[] {
    return this.chatListStream$.value;
  }

  set chatList(chats: PeMessageChat[]) {
    chats.forEach(chat => {
      chat.avatar = this.getContactAvatar(chat);
      chat.title = this.getTitle(chat);
    });
    const chatList = cloneDeep(chats);
    this.chatListStream$.next(chatList);
  }

  public readonly initAddingMembersInfoToConversation$ = this.actionActiveChat$
    .pipe(
      map((chat: PeMessageChat | null) => {
        if (!chat) {
          this.activeChatStream$.next(chat);
        }

        return chat;
      }),
      filter(chat => !!chat),
      startWith({ _id: null, membersInfo: [] }),
      pairwise(),
      switchMap(([prevActiveChat, currActiveChat]) => prevActiveChat && prevActiveChat._id === currActiveChat._id
        ? of({
          ...currActiveChat,
          membersInfo: currActiveChat?.membersInfo || this.activeChat?.membersInfo,
        })
        : this.addMemberInfoToConversation(currActiveChat)),
      tap((chat: PeMessageChat) => {
        this.activeChatStream$.next(chat);
      }));

  constructor(
    @Inject(PE_ENV) public environmentConfigInterface: EnvironmentConfigInterface,
    private apmService: ApmService,
    private messageBus: MessageBus,
    private snackbarService: SnackbarService,
    private translateService: TranslateService,
    private chatListInstance: ChatListFacade,
    private conversationFacade: ConversationFacade,
    private peMessageApiService: PeMessageApiService,
    private peMessageGuardService: PeMessageGuardService,
    private peMessageService: PeMessageService,
    private peMessageStateService: MessageStateService,
    private peMessageWebSocketService: PeMessageWebSocketService,
  ) {
    merge(
      this.chatList$,
      this.detectChangeStream$,
    ).pipe(
      tap(() => {
        this.messageBus.emit('message.chat-list.changed', this.chatList);
      }))
      .subscribe();
  }

  public get isCurrentUserAdmin(): boolean {
    return this.activeChat?.currentMember?.role === PeMessageChannelRoles.Admin;
  }

  public destroy(): void {
    this.activeChatStream$.next(null);
    this.chatListStream$.next([]);
    this.unreadInFolderStream$.next(0);
    this.mobileView = false;
    this._countLiveChat = [];
  }

  public deleteChat(id?: string): Observable<any> {
    const currentUserId = this.peMessageService.getUserData().uuid;
    const chatId = id ?? this.activeChat?._id;
    const chat = this.chatList.find(chat => chat._id === chatId);
    const currentMember = chat?.members?.find(member => member.user === currentUserId);

    let delete$ = this.conversationFacade.init(chat as PeMessageChat).deleteConversation(chat.business);

    if (this.isExclude(currentMember, chat)) {
      delete$ = this.peMessageApiService
        .postConversationMemberExclude(chat._id, currentMember.user, chat.type, chat.business);
    }

    if (
      this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
      && chat?.template as string
    ) {
      delete$ = this.peMessageApiService.deleteChatTemplate(chat?.template as string);
    }

    return delete$.pipe(
      tap(() => {
        if (!this.isExclude(currentMember, chat)) {
          this.removeItemFromChatList(chatId);
        }
      }),
      catchError((err) => {
        this.snackbarService.toggle(true, {
          content: this.translateService.translate(err.error?.message ?? err.message),
          iconColor: '#E2BB0B',
          duration: 2500,
        });

        return of(err);
      }));
  }

  public hasPermission(permission = PeMessageChannelPermissionsEnum.SendMessages): boolean {
    if (this.isCurrentUserAdmin) {
      return true;
    } else if (this.activeChat?.currentMember?.permissions?.[permission] !== undefined) {
      return this.activeChat.currentMember.permissions[permission];
    } else {
      return this.activeChat?.permissions?.[permission];
    }
  }

  isExclude(currentMember, chat) {
    return currentMember
      && currentMember?.addMethod !== PeMessageAddMethod.Owner
      && chat.type !== PeMessageChatType.DirectChat;
  }

  private removeItemFromChatList(chatId: string): void {
    const index = this.chatList.findIndex(c => c._id === chatId);
    this.chatList.splice(index, 1);
    this.detectChangeStream$.next();
  }

  public getConversationListByFolder(folderId: string, rootFolderId: string): Observable<PeMessageChat[]> {
    const config = { ...this.conversationListConfig };

    return this.peMessageStateService.getConversationListOnce('message', config.clearCache, folderId)
      .pipe(
        take(1),
        switchMap((chats: PeMessageChat[]) => this.prepareChatList(chats)));
  }

  public getConversationList(customConfig?: PeMessageConversationListConfig): Observable<PeMessageChat[]> {
    const config = { ...this.conversationListConfig, ...customConfig };
    const endpoint = config.todo
      ? this.peMessageApiService.getAppChannelByName(config.todo)
      : this.peMessageStateService.getConversationListOnce('message', config.clearCache);

    return endpoint
      .pipe(
        map((data: PeMessageChat[] | PeMessageChat) => Array.isArray(data) ? data : [data]),
        switchMap((chats: PeMessageChat[]) => {
          //this marker need to check if socket reconnect then need only join to them without update chats
          return config.initialization
            ? this.prepareChatList(chats)
            : of(chats);
        }),
        catchError((error) => {
          error.status !== 404 && this.apmService.apm
            .captureError(`Message app, get channel by name ERROR ms:\n ${JSON.stringify(error)}`);

          return of([]);
        }));
  }

  private prepareChatList(chats: PeMessageChat[], parentFolder?: string): Observable<PeMessageChat[]> {
    this.unreadInFolder = this.chatListInstance.init(chats).countUnreadMessages();
    const isAdmin = this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin]);
    this.chatList = this.chatListInstance.get().normalizeChatList(this, isAdmin);

    return of(chats);
  }

  addMemberInfoToConversation(chat): Observable<PeMessageChat> {
    const currentUserId = this.peMessageService.getUserData().uuid;

    return chat.type === PeMessageChatType.AppChannel
      || chat.websocketType === PeMessageWebsocketType.LiveChat
      || chat.websocketType === PeMessageWebsocketType.Widget
        ? of(chat)
        : this.peMessageApiService
            .getConversationMembers(chat.type, chat._id)
            .pipe(
              map((members) => ({
                ...chat,
                currentMember: members.find(member => member.user._id === currentUserId),
                membersInfo: members,
              })),
              tap(() => {
                this.overlayFormReopen = true;
              }));
  }

  getContactAvatar(chat: PeMessageChat): string {
    const contact = this.peMessageService.contactList?.find(c => c._id === chat.contact);
    let url = '';

    if (contact?.avatar && chat.type === PeMessageChatType.Chat) {
      url = contact.avatar;
    } else if (chat.photo) {
      url = `${this.environmentConfigInterface.custom.storage}/message/${chat.photo}`;
    }

    return url;
  }

  getContactInitials(chat: PeMessageChat): string {
    return chat.title?.split(' ').map(n => n.charAt(0)).splice(0, 2).join('').toUpperCase() ?? '';
  }

  getMember(member: PeMessageConversationMember): PeMessageChannelMemberByCategory {
    let user = member.user.userAccount ?? null;
    const userId = member.user._id || member.user;
    if (!user && this.peMessageService.userList) {
      user = this.peMessageService
        .userList.find((u) => u._id === userId)?.userAccount;
    }

    if (!user) {
      return null;
    }

    const contact = this.peMessageService.contactList ? this.peMessageService.contactList
      .find((c) => c._id === member.user._id) : null;

    const name = [];

    if (user?.firstName) { name.push(user.firstName); }
    if (user?.lastName) { name.push(user.lastName); }

    const title = name.length ? name.join(' ') : contact?.name;
    const avatar = user?.logo ? `${this.environmentConfigInterface.custom.storage}/images/${user.logo}` : null;

    return {
      _id: member.user._id,
      title,
      label: title,
      role: member.role,
      avatar: avatar ?? contact?.avatar,
      initials: title?.split(' ').map(n => n.charAt(0)).splice(0, 2).join('').toUpperCase() ?? '',
      permissions: member?.permissions,
    };
  }

  externalUnreadMessages(): Observable<number> {
    this.peMessageApiService.getAppChannelByName(this.peMessageService.app).pipe(
      tap((chat: PeMessageChat) => {
        this.peMessageService.unreadMessages = this.chatListInstance.init([chat]).countUnreadMessages();
      }),
      catchError((error) => {
        if (error.status !== 404) {
          this.apmService.apm.captureError(
            `Message app, get channel by name ERROR ms:\n ${JSON.stringify(error)}`,
          );
        }

        return EMPTY;
      }),
    ).subscribe();

    return this.peMessageService.unreadMessages$;
  }

  getNotificationStatus(chat: PeMessageChat): boolean {
    if (chat.members) {
      return !!chat.members
        .find(member => member.user === this.peMessageService.activeUser?._id)?.notificationDisabledUntil;
    }

    return false;
  }

  getTitle(chat: PeMessageChat) {
    if (/^\/live-chat/.test(chat.title)) {
      this._countLiveChat.push(chat.id);

      return `${PeLiveChatEnum.LiveChat} ${this._countLiveChat.length}`;
    }

    return chat.title ?? PeLiveChatEnum.LiveChat;
  }

  pushChat(chat) {
    let updatedChatList = this.chatListStream$.value;
    updatedChatList.push(chat);
    updatedChatList = this.chatListInstance.init(updatedChatList).normalizeChatList(this);
    this.chatListStream$.next(updatedChatList);
  }

  memberIncluded(dataIncluded: PeMessageWebSocketIncludedDTO) {
    const conversation: PeMessageChat = this.chatList.find(chat => chat._id === dataIncluded.chat._id);
    if (conversation?.membersInfo) {
      conversation.membersInfo.push({ user: dataIncluded.userData });
    } else if (conversation) {
      conversation.membersInfo = [{ user: dataIncluded.userData }];
    }

    this.peMessageStateService.memberIncluded(dataIncluded.userData);
  }

  deleteDraftMessage(activeChat, draft) {
    const { chat, _id } = draft;

    return this.peMessageApiService.deleteChatDraftMessage(chat, _id, activeChat.business)
      .pipe(
        tap(() => {
          this.draftChange$.next(chat);
        }));
  }

  postDraftMessage(activeChat, message) {
    return this.peMessageApiService.postChatDraftMessage(
      activeChat._id,
      activeChat.business,
      {
        content: message,
      },
    );
  }

  updatePermissionsData(chatResponse) {
    const { permissions, subType, usedInWidget } = chatResponse;
    const settings = { permissions, subType, usedInWidget };
    const chatIndex = this.chatList.findIndex(chat => chat._id === chatResponse._id);
    this.chatList[chatIndex] = { ...this.chatList[chatIndex], ...settings };
    this.activeChat = { ...this.activeChat, ...settings };
  }

  handleOnlineMessage() {
    return this.peMessageWebSocketService
      .handleSubjectObservable(PeMessageWebSocketEvents.MESSAGE_ONLINE)
      .pipe(
        map((chatInfo: PeMessageChat) => {
          let chat = this.chatList.find(x => x._id === chatInfo._id);
          const found = this.chatOnlineCounts?.findIndex(item => item._id === chatInfo._id);
          if (chat) {
            chat.onlineMembersCount = chatInfo.onlineMembersCount;
            this.onlineMembers = chatInfo.onlineMembers;
            found !== -1 ? this.chatOnlineCounts.splice(found,1,chatInfo) : this.chatOnlineCounts.push(chatInfo);

            return chat;
          }
        }),
      );
  }

  getWhoIsOnline(members: PeMessageChannelMemberByCategory[]): PeMessageChannelMemberByCategory[] {
    return members.map(member => {
      return { ...member, isOnline: this.onlineMembers.some(x => x.user === member._id) };
    });
  }

  getMembersByCategory(
    searchForAdmins: boolean,
    membersInfo: PeMessageChatCurrentMemberInfo[],
  ): PeMessageChannelMemberByCategory[] {
    const roles = searchForAdmins
      ? [PeMessageChannelRoles.Admin]
      : [PeMessageChannelRoles.Member, PeMessageChannelRoles.Subscriber];

    return (
      membersInfo
        .map((member: PeMessageConversationMember) =>
          roles.includes(<PeMessageChannelRoles>member?.role) ? this.getMember(member) : null,
        )
        .filter(member => member) ?? []
    );
  }

  isUserInChatAlready(filterValue: string): boolean {
    return this.activeChat.membersInfo.some(
      userInfo => userInfo.user.userAccount.email === filterValue
    );
  }
}
