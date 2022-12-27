import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageChatType } from '../../enums';
import { PeMessageChatRoomListService } from '../../services';

import { ChatListAbstract } from './chat-list-abstract';

export class ChatListDefault extends ChatListAbstract {
  countUnreadMessages(): number {
    let unread = 0;
    this.chatList.forEach(chat => {
      if (chat.type !== PeMessageChatType.AppChannel) {
        unread += chat.messages?.length ? chat.messages.filter((m: any) => m.status !== 'read').length : 0;
      }
    });

    return unread;
  }

  normalizeChatList(chatRoomListService: PeMessageChatRoomListService, isAdmin = false): PeMessageChat[] {
    this.chatList = this.chatList.filter(chat => isAdmin || !chat.app).map(chat => {
      return this.normalizeChat(chatRoomListService, chat);
    }).sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

    return this.chatList;
  }

  normalizeChat(chatRoomListService: PeMessageChatRoomListService, chat: PeMessageChat): PeMessageChat {
    chat.avatar = chatRoomListService.getContactAvatar(chat);
    chat.initials = chatRoomListService.getContactInitials(chat);
    chat.updatedAt = chat.messages?.length && chat.messages[chat.messages.length - 1]?.sentAt;
    chat.messages?.forEach((msg: any) => {
      msg.type = msg.type ?? (msg.attachments?.length > 0 ? 'file' : 'default');
    });

    return chat;
  }

  activeChat(): PeMessageChat | null {
    return this.chatList.length ? this.chatList[0] : null;
  }

}
