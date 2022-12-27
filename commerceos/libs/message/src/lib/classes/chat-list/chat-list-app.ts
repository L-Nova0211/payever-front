import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageChatType } from '../../enums';
import { PeMessageChatRoomListService } from '../../services';

import { ChatListDefault } from './chat-list-default';

export class ChatListApp extends ChatListDefault {
  constructor(chatList: PeMessageChat[], protected app: string) {
    super(chatList);
  }

  countUnreadMessages(): number {
    let unread = 0;
    this.chatList.filter(chat => (this.app === chat.app) || !chat.app).forEach(chat => {
      if (chat.type !== PeMessageChatType.AppChannel) {
        unread += chat.messages?.length ? chat.messages.filter((m: any) => m.status !== 'read').length : 0;
      }
    });

    return unread;
  }

  normalizeChatList(chatRoomListService: PeMessageChatRoomListService): PeMessageChat[] {
    this.chatList = this.chatList.filter(chat => (chat.app && this.app === chat.app) || !chat.app).map(chat => {
      return this.normalizeChat(chatRoomListService, chat);
    }).sort((a: any, b: any) => +new Date(b.updatedAt) - +new Date(a.updatedAt));

    return this.chatList;
  }

  activeChat(): PeMessageChat | null {
    const foundChat = this.chatList.find((chat: PeMessageChat) => chat.app === this.app);
    if (foundChat) {
      return foundChat;
    } else {
      const chatsWithoutChannelApp = this.chatList
        .filter((chat: PeMessageChat) => chat.type !== PeMessageChatType.AppChannel);

      return chatsWithoutChannelApp.length ? chatsWithoutChannelApp[0] : null;
    }
  }
}
