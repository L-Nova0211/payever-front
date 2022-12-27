import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';

import {
  PeMessageChat,
  PeChatMessage,
  PeChatMessageType,
  PeMessageIntegration,
  PeMessageChannelRoles,
} from '@pe/shared/chat';

import { PeMessageChatRoomListService } from '../../services';

import { ConversationAbstract } from './conversation-abstract';

export class ConversationChannel extends ConversationAbstract {
  createConversation(): Observable<any> {
    return of(null);
  }

  conversation(): Observable<any> {
    return this.peMessageApiService.getChannel(this.conversationItem._id, this.conversationItem.type);
  }

  conversationSwitch(envCustomStorage?: string, chatRoomListService?: PeMessageChatRoomListService): Observable<any> {
    return this.messageStateService.getConversationOnce(
      this.conversationItem._id, this.conversationItem.type, true).pipe(
      map((chatListItem: PeMessageChat) => {
        const messages = chatListItem.messages ?? chatListItem.messages;
        const activeUser = this.peMessageService.activeUser;
        const isChannelAdmin = this.conversationItem.members
          ?.find((member: any) => member.user === activeUser?._id)?.role === PeMessageChannelRoles.Admin;

        const messageTitle =
          this.conversationItem.integrationName === PeMessageIntegration.Email
            ? `${activeUser?.userAccount?.firstName} ${activeUser?.userAccount?.lastName}`
            : this.conversationItem.title;

        const photo = chatRoomListService.activeChat?.photo;
        const avatar = photo ? `${envCustomStorage}/message/${photo}` : '';

        return {
          noMessagesPlaceholder: isChannelAdmin ? 'message-app.chat-room.placeholder.no_messages' : '',
          messageTitle,
          avatar,
          chatListItem,
          messages,
        };
      }));
  }

  deleteConversation(businessId?: string): Observable<any> {
    return this.peMessageApiService.deleteChannel(this.conversationItem._id, this.conversationItem.type, businessId);
  }

  refreshMessages(messages): PeChatMessage[] {
    return messages.map(message => {
      const user = this.peMessageService.userList?.find(u => u._id === message.sender)?.userAccount;
      if (
        this.conversationItem.signed &&
        message.type === PeChatMessageType.Text
      ) {
        message.sign = user?.firstName || user?.lastName
          ? `${user?.firstName + ' '}${user?.lastName}` : '';
      }
      message.avatar = message.avatar ?? user?.logo;

      return message;
    });
  }
}
