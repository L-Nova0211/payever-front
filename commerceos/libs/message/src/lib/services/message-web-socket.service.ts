import { Injectable } from '@angular/core';
import { plainToClass } from 'class-transformer';
import { Observable, Subject } from 'rxjs';

import {
  PeChatMessage,
  PeChatPinnedMessageResponse,
  PeChatService,
  PeMessageChat,
  PeMessageChatMember,
  PeMessageContact,
} from '@pe/shared/chat';

import { PeMessageWebSocketEvents, PeMessageWebsocketType } from '../enums';
import {
  PeMessageWebSocketHandleSubject,
  PeMessageWebSocketIncludedDTO,
  PeMessageWebSocketMemberChanged,
  PeMessageWebSocketMember,
  PeMessageWebSocketUserDTO,
  PeMessageWebSocketUserExcludedDTO,
} from '../interfaces';

import { PeMessageService } from './message.service';

import Socket = SocketIOClient.Socket;

interface PeMessageWebsocketInterface {
  type: PeMessageWebsocketType;
  socket: Socket;
}

@Injectable()
export class PeMessageWebSocketService {

  private socketStack: PeMessageWebsocketInterface[] = [];
  private _wetSocketSubjects: PeMessageWebSocketHandleSubject[] = [];
  private set handleSubject(handleSubject: PeMessageWebSocketHandleSubject) {
    this._wetSocketSubjects.push(handleSubject);
  }

  constructor(
    public peMessageService: PeMessageService,
    private peChatService: PeChatService,
  ) {
    //need to clear stack before init websocket
    this.socketStack = [];
  }

  public init(uri: string, query: any, webSocketType = PeMessageWebsocketType.Regular): Observable<any> {
    const webSocketSubject$ = new Subject<any>();
    const opts = {
      path: '/ws',
      timeout: 10000,
      transports: ['websocket'],
      query,
    };

    const socket = this.peChatService.connect(uri, opts);

    this.socketStack.push({
      type: webSocketType,
      socket,
    });

    socket.on(PeMessageWebSocketEvents.UNAUTHORIZED, (msg: any) => {
      throw new Error(msg.data.message);
    });

    socket.on(PeMessageWebSocketEvents.AUTHENTICATED, (result: any) => {
      const socketData = {
        ...result,
        liveChat: webSocketType === PeMessageWebsocketType.LiveChat,
        socket,
      };

      webSocketSubject$.next(socketData);

      this.handleInitialAppChannel(webSocketSubject$, socketData, socket);
    });

    this.handleMessagePosted(webSocketType);
    this.handleMessagePined(webSocketType);
    this.handleMessageUnpinned(webSocketType);
    this.handleMessageUpdated(webSocketType);
    this.handleMessageDeleted(webSocketType);
    this.handleChatCreated(webSocketType);
    this.handleChatUpdated(webSocketType);
    this.handleChatDeleted(webSocketType);
    this.handleContactCreated(webSocketType);
    this.handleMemberIncluded(webSocketType);
    this.handleMemberExcluded(webSocketType);
    this.handleClientJoined(webSocketType);
    this.handleMemberChanged(webSocketType);
    this.handleMessageTyping(webSocketType);
    this.handleMessageOnline(webSocketType);
    this.handleMessagesReceived(webSocketType);

    return webSocketSubject$;
  }

  public clearWetSocketSubjects() {
    this._wetSocketSubjects = [];
  }

  public handleSubjectObservable(name: string): Observable<any> {
    let handleSubject = this._wetSocketSubjects.find(wsS => wsS.name === name);
    if (!handleSubject) {
      handleSubject = {
        name: name,
        subject: new Subject<PeChatMessage>(),
      };

      this.handleSubject = handleSubject;
    }

    return handleSubject.subject.asObservable();
  }

  private handleInitialAppChannel(webSocketSubject$, result, socket) {
    if (this.peMessageService.app) {
      socket.on(PeMessageWebSocketEvents.INITIAL_APP_CHANNELS_CREATED, (res: any) => {
        webSocketSubject$.next(result);
      });
    }
  }

  private handleMessagePosted(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_POSTED,
      subject: new Subject<PeChatMessage>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_POSTED, (message: PeChatMessage) => {
      hSubject.subject.next(message);
    });
  }

  handleMessagesReceived(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_SCROLL_RESPONSE,
      subject: new Subject<PeChatMessage>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_SCROLL_RESPONSE, (message: PeChatMessage) => {
      hSubject.subject.next(message);
    });
  }

  getOldMessages(webSocketType: PeMessageWebsocketType, data:{ _id, chat, limit, skip? }) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_SCROLL_REQUEST, data);
  }

  private handleMessagePined(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_PINNED,
      subject: new Subject<PeChatPinnedMessageResponse>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_PINNED, (message: PeChatPinnedMessageResponse) => {
      hSubject.subject.next(message);
    });
  }

  private handleMessageUnpinned(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_UNPINNED,
      subject: new Subject<PeChatPinnedMessageResponse>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_UNPINNED, (message: PeChatPinnedMessageResponse) => {
      hSubject.subject.next(message);
    });
  }

  handleMessageTyping(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_TYPING,
      subject: new Subject<PeChatMessage>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_TYPING, (message: PeChatMessage) => {
      hSubject.subject.next(message);
    });
  }


  handleMessageOnline(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_ONLINE,
      subject: new Subject<PeChatMessage>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_ONLINE, (message: PeChatMessage) => {
      hSubject.subject.next(message);
    });
  }


  private handleMessageUpdated(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_UPDATED,
      subject: new Subject<PeChatMessage>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_UPDATED, (message: PeChatMessage) => {
      this.peMessageService.changeUnreadMessages(1);
      hSubject.subject.next(message);
    });
  }

  private handleMessageDeleted(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.MESSAGE_DELETED,
      subject: new Subject<PeChatMessage>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.MESSAGE_DELETED, (message: PeChatMessage) => {
      hSubject.subject.next(message);
    });
  }

  private handleChatCreated(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CHAT_CREATED,
      subject: new Subject<PeMessageChat>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CHAT_CREATED, (chat: PeMessageChat) => {
      hSubject.subject.next(chat);
    });
  }

  private handleChatUpdated(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CHAT_UPDATED,
      subject: new Subject<PeMessageChat>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CHAT_UPDATED, (chat: PeMessageChat) => {
      hSubject.subject.next(chat);
    });
  }

  private handleChatDeleted(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CHAT_DELETED,
      subject: new Subject<PeMessageChat>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CHAT_DELETED, (chat: PeMessageChat) => {
      hSubject.subject.next(chat);
    });
  }

  private handleContactCreated(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CONTACT_CREATED,
      subject: new Subject<PeMessageContact>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CONTACT_CREATED, (contact: PeMessageContact) => {
      hSubject.subject.next(contact);
    });
  }

  private handleMemberChanged(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CHAT_MEMBER_CHANGED,
      subject: new Subject<PeMessageWebSocketMemberChanged>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CHAT_MEMBER_CHANGED, (
      userData: PeMessageWebSocketUserDTO,
      member: PeMessageChatMember,
      chat: PeMessageChat
    ) => {
      hSubject.subject.next({
        chatId: chat._id,
        chatType: chat.type,
        memberId: member.user,
        member: member,
      });
    });
  }

  private handleMemberIncluded(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CHAT_MEMBER_INCLUDED,
      subject: new Subject<PeMessageWebSocketIncludedDTO>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CHAT_MEMBER_INCLUDED, (
      userData: PeMessageWebSocketUserDTO,
      member: PeMessageWebSocketMember,
      chat: PeMessageChat
    ) => {
      hSubject.subject.next(plainToClass(PeMessageWebSocketIncludedDTO, {
        userData,
        member,
        chat,
      }));
    });
  }

  public handleMemberExcluded(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED,
      subject: new Subject<PeMessageWebSocketIncludedDTO>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.CHAT_MEMBER_EXCLUDED, (
      userData: PeMessageWebSocketUserExcludedDTO,
    ) => {
      hSubject.subject.next(plainToClass(PeMessageWebSocketIncludedDTO, {
        userData,
      }));
    });
  }

  private handleClientJoined(webSocketType: PeMessageWebsocketType) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    const hSubject = {
      name: PeMessageWebSocketEvents.ROOM_JOINED,
      subject: new Subject<PeMessageContact>(),
    };
    this.handleSubject = hSubject;
    socket.on(PeMessageWebSocketEvents.ROOM_JOINED, (contact: PeMessageContact) => {
      hSubject.subject.next(contact);
    });
  }

  public deleteMessage(webSocketType: PeMessageWebsocketType, data) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_DELETE, data);
  }

  public updateMessage(webSocketType: PeMessageWebsocketType, data) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_UPDATE, data);
  }

  public sendMessage(webSocketType: PeMessageWebsocketType, data) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_SEND, data);
  }

  public pinMessage(webSocketType: PeMessageWebsocketType, messageId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_PIN, messageId);
  }

  public unpinMessage(webSocketType: PeMessageWebsocketType, data:{pinId,chatId}) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_UNPIN, data);
  }

  typingMessage(webSocketType: PeMessageWebsocketType, chatId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_TYPING, chatId);
  }

  typingStoppedMessage(webSocketType: PeMessageWebsocketType, chatId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_TYPING_STOPPED, chatId);
  }

  leaveChat(webSocketType: PeMessageWebsocketType, chatId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.MESSAGE_LEAVE, chatId);
  }

  leaveMember(webSocketType: PeMessageWebsocketType, chatId: string){
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.CHAT_MEMBER_LEAVE, chatId);
  }

  forwardMessage(webSocketType: PeMessageWebsocketType, data) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_FORWARD, data);
  }

  public markReadMessage(webSocketType: PeMessageWebsocketType, messageId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_MESSAGE_MARK_READ, messageId);
  }

  public chatRoomJoin(webSocketType: PeMessageWebsocketType, chatId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_CHAT_ROOM_JOIN, chatId);
  }

  public businessRoomJoin(webSocketType: PeMessageWebsocketType, businessId: string) {
    const socket = this.socketStack.find(item => item.type === webSocketType).socket;
    socket.emit(PeMessageWebSocketEvents.EMIT_BUSINESS_ROOM_JOIN, businessId);
  }

  public destroy(): void {
    this.socketStack.forEach((webSocket) => {
      webSocket.socket.disconnect();
    });
    this.socketStack = [];
  }
}
