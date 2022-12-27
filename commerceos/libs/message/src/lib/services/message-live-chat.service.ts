import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { delay, map, take, tap } from 'rxjs/operators';

import { PE_ENV } from '@pe/common';
import { PeMessageChat, PeMessageUser } from '@pe/shared/chat';

import { ChatListFacade } from '../classes';
import { PeMessageWebsocketType } from '../enums';
import { PeMessageLiveChatInterface } from '../interfaces';

import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageWebSocketService } from './message-web-socket.service';
import { PeMessageService } from './message.service';

@Injectable()
export class PeMessageLiveChatService {
  liveChatsActivated = [];

  get liveConversations(): PeMessageLiveChatInterface[] {
    const liveChatConversations = localStorage.getItem('pe_live-chat_conversations');

    return liveChatConversations ? JSON.parse(liveChatConversations) : [];
  }

  constructor(
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private chatListInstance: ChatListFacade,
    @Inject(PE_ENV) public environmentConfigInterface: any,
  ) {
  }

  liveConversationAddToStorage(data): void {
    const lcc = this.liveConversations;
    if (!lcc.find(c => c.code === data.code)) {
      lcc.push(data);
      localStorage.setItem('pe_live-chat_conversations', JSON.stringify(lcc));
    }
  }

  addLiveConversationToStorage(token): void {
    localStorage.setItem('pe_live-chat_conversation', token);
  }

  getLiveConversationStorage(): string {
    return localStorage.getItem('pe_live-chat_conversation');
  }

  liveConversationByCode(code): string {
    return this.liveConversations.find(c => c.code === code)?.token || '';
  }

  initLiveChat(data): void {
    const existingLiveChat = this.liveChatsActivated[0]?.chat;
    if (existingLiveChat) {
      this.peMessageChatRoomListService.activeChat = existingLiveChat;

      return;
    }

    let token = this.liveConversationByCode(data.code);
    const dataConnect = { code: data.code, token };
    this.connectLiveChatAndJoin(dataConnect).pipe(
      tap(result => {
        const { chat } = result;
        this.peMessageChatRoomListService.activeChat = chat;
      }),
    ).subscribe();
  }

  initLiveChatFromStorage(): Observable<any>[] {
    const liveChatConversations = this.liveConversations;
    let liveChatConversations$ = [];
    if (liveChatConversations.length > 0) {
      liveChatConversations$ = liveChatConversations.map(c => {
        return this.connectLiveChatAndJoin(c);
      });
    }

    return liveChatConversations$;
  }

  initIntegrationChannel(businessId: string, token: string): Observable<any> {
    const uri = `${this.environmentConfigInterface.backend?.message}/widget`;

    return this.peMessageWebSocketService.init(
      uri,
      {
        businessId,
        token,
      },
      PeMessageWebsocketType.Widget,
    ).pipe(
      take(1),
      delay(1000),
      map(result => {
        const { integrationChannels, socket } = result;
        const chatList: PeMessageChat[] = [];

        integrationChannels.forEach((channel, index, arr) => {
          channel.websocketType = PeMessageWebsocketType.Widget;
          channel.initials = this.peMessageChatRoomListService.getContactInitials(channel);
          channel.avatar = this.peMessageChatRoomListService.getContactAvatar(channel);
          chatList.push(channel);

          socket.emit('messages.ws-client.chat-room.join', channel._id);
        });
        this.peMessageChatRoomListService.chatList = chatList;

        if (!this.peMessageService.activeUser) {
          this.peMessageService.activeUser = { _id: '' } as PeMessageUser;
        }

        return result;
      }),
    );
  }

  connectLiveChatAndJoin(data): Observable<any> {
    const uri = `${this.environmentConfigInterface.backend?.livechat}/live-chat`;

    return this.peMessageWebSocketService.init(
      uri,
      { authId: data.code, token: data.token },
      PeMessageWebsocketType.LiveChat,
    ).pipe(
      take(1),
      map(result => {
        const { chat, socket } = result;
        if (chat) {
          chat.websocketType = PeMessageWebsocketType.LiveChat;
          chat.title = this.peMessageChatRoomListService.getTitle(chat);
          chat.markConversation = true;

          this.afterConnect(data, result);

          socket.emit('messages.ws-client.chat-room.join', chat._id);
        }

        return result;
      }),
    );
  }

  afterConnect(data, result) {
    const { contact, chat, accessToken } = result;

    this.peMessageService.activeUser = contact;
    this.peMessageChatRoomListService.pushChat(chat);
    this.peMessageService.unreadMessages = this.chatListInstance.get().countUnreadMessages();
    this.liveChatsActivated.push({ code: data.code, chat });
    this.liveConversationAddToStorage({ code: data.code, token: accessToken });
  }
}
