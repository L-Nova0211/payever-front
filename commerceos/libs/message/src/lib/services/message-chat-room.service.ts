import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { take, tap } from 'rxjs/operators';

import { PebEnvService } from '@pe/builder-core';
import { TranslateService } from '@pe/i18n-core';
import { PeChatMessage, PeChatChannelMenuItem, PeMessageTrackerService } from '@pe/shared/chat';

import { PeMessageChatType, PeMessageGuardRoles, PeMessageWebsocketType } from '../enums';
import { PeMessageChatInvitation, PeMessageWS } from '../interfaces';

import { PeMessageConversationService } from './conversation.service';
import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageGuardService } from './message-guard.service';
import { PeMessageWebSocketService } from './message-web-socket.service';

@Injectable()
export class PeMessageChatRoomService {

  newMessage$ = new Subject<PeChatMessage>();
  channelMenuItems$ = new BehaviorSubject<PeChatChannelMenuItem[]>([]);
  noMessagesPlaceholder = this.translateService.translate('message-app.chat-room.placeholder.no_chat_rooms');
  groupNumber = 1;

  constructor(
    private peMessageApiService: PeMessageApiService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageGuardService: PeMessageGuardService,
    private translateService: TranslateService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageConversationService: PeMessageConversationService,
    private messageTrackerService: PeMessageTrackerService,
    private envService: PebEnvService,
  ) { }

  sendMessage(event: any, activeChat = this.peMessageChatRoomListService.activeChat): void {
    if (!event) { return; }

    const message: PeMessageWS = {
      type: event.type ?? 'text',
      content: event.message,
      components: event?.components,
      interactive: event?.interactive,
      replyTo: event.replyTo,
    };

    if (event.attachments) {
      message.attachments = event.attachments;
    }

    if (
      this.peMessageGuardService.isAllowByRoles([PeMessageGuardRoles.Admin])
      && (activeChat?.template || activeChat?.type === PeMessageChatType.AppChannel)
    ) {
      this.peMessageApiService.postMessageTemplate(activeChat?._id, message).pipe(
        take(1),
        tap((data: PeChatMessage) => {
          this.newMessage$.next(data);
        }),
      ).subscribe();
    } else {
      this.peMessageWebSocketService.sendMessage(
        activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
        {
          ...message,
          ...{ sentAt: new Date(), chat: activeChat?._id },
        },
      );
      this.peMessageWebSocketService.typingStoppedMessage(
        activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
        activeChat?._id
      );
    }

    const activeChatMessage = this.peMessageConversationService.conversationList$.value
      .find(conversation => conversation.id === this.peMessageChatRoomListService.activeChat._id).data;

    if (activeChatMessage) {
      activeChatMessage.replyToMessage = null;
      activeChatMessage.forwardMessageData = null;
    }
    this.newMessage$.next({});
    this.messageTrackerService.newMessageTracker();
  }

  getOldMessages(uniqId, activeChat, skip? ){
    this.peMessageWebSocketService.getOldMessages(
      activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
      { _id: uniqId, chat: activeChat._id, limit: 50, skip: skip }
    );
  }

  public isDefaultChat(chat = this.peMessageChatRoomListService.activeChat): boolean {
    return chat.title === `${this.envService.businessData.name} / Support Channel`;
  }

  getInvitationCode(chatId: string, invitation?: PeMessageChatInvitation): Observable<any> {
    const invitationBody = invitation
      ?? { expiresAt: (new Date(new Date().setDate(new Date().getDate() + 1))).toString() };

    return this.peMessageApiService.postChatInvites(chatId, invitationBody as PeMessageChatInvitation);
  }
}
