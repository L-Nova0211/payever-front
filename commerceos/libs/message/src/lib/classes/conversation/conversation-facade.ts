import { Injectable } from '@angular/core';
import { EMPTY, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import { TranslateService } from '@pe/i18n-core';
import { PeChatMessage, PeMessageChat, PeMessageChatNormalized } from '@pe/shared/chat';

import { PeMessageChatType } from '../../enums';
import { PeMessageConversationCreateData } from '../../interfaces';
import { PeMessageApiService } from '../../services/message-api.service';
import { MessageStateService } from '../../services/message-state.service';
import { PeMessageService } from '../../services/message.service';

import { ConversationAbstract } from './conversation-abstract';
import { ConversationChannel } from './conversation-channel';
import { ConversationChat } from './conversation-chat';
import { ConversationGroup } from './conversation-group';


@Injectable()
export class ConversationFacade {
  conversationInstance: ConversationAbstract;

  constructor(
    protected peMessageApiService: PeMessageApiService,
    protected messageStateService: MessageStateService,
    protected peMessageService: PeMessageService,
    protected translateService: TranslateService,
  ) {}

  init(conversation: Partial<PeMessageChat>) {
    switch (conversation.type) {
      case PeMessageChatType.Channel:
      case PeMessageChatType.AppChannel:
      case PeMessageChatType.IntegrationChannel:
        this.conversationInstance = new ConversationChannel(
          conversation,
          this.messageStateService,
          this.peMessageApiService,
          this.peMessageService,
          this.translateService,
        );
        break;

      case PeMessageChatType.Group:
        this.conversationInstance = new ConversationGroup(
          conversation,
          this.messageStateService,
          this.peMessageApiService,
          this.peMessageService,
          this.translateService,
        );
        break;

      case PeMessageChatType.Chat:
      case PeMessageChatType.DirectChat:
      default:
        this.conversationInstance = new ConversationChat(
          conversation,
          this.messageStateService,
          this.peMessageApiService,
          this.peMessageService,
          this.translateService,
        );
        break;
    }

    return this.conversationInstance;
  }

  createConversation(data: PeMessageConversationCreateData, groupNumber = 1) {
    if (data.contacts?.length === 1 && data.contacts[0].data) {
      return this.init({
        type: PeMessageChatType.DirectChat,
      }).createConversation(data.contacts[0].data);
    } else if (data.contacts?.length > 1) {
      return this.init({
        type: PeMessageChatType.Group,
      }).createConversation( { ...data, groupNumber: groupNumber });
    }

    return EMPTY;
  }

  normalizeActiveChat(chat, isLiveChat, envCustomStorage, chatRoomListService): Observable<PeMessageChatNormalized> {
    if (!chat) {
      return of({
        messages: [],
        messageTitle: '',
        avatar: '',
        noMessagesPlaceholder: '',
      });
    } else if (isLiveChat || chat.markConversation || chat.type === PeMessageChatType.AppChannel) {
      this.init(chat);

      return of({
        messages: this.refreshMessages(chat),
        messageTitle: '',
        avatar: '',
        noMessagesPlaceholder: '',
      });
    } else {
      return this.init(chat).conversationSwitch(envCustomStorage, chatRoomListService).pipe(
        map((res: any) => {
          return {
            messages: this.refreshMessages(
              Array.isArray(res.chatListItem) ? res.chatListItem[0] : res.chatListItem,
              res.messages
            ),
            messageTitle: res.messageTitle ?? '',
            avatar: res.avatar ?? '',
            noMessagesPlaceholder: res.noMessagesPlaceholder ?? '',
          };
        })
      );
    }
  }

  private refreshMessages(chat: PeMessageChat, appMessages?: PeChatMessage[]): PeChatMessage[] {
    const messages = appMessages || chat?.messages || chat?.messages;
    const userId = this.peMessageService.activeUser?._id || '';

    return this.conversationInstance.refreshMessages(messages)
        ?.filter(message => {
          return !message.deletedForUsers?.includes(userId);
        }) ?? [];
  }
}
