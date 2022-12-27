import { PeMessageChat } from '@pe/shared/chat';

import { ChatListDefault } from './chat-list-default';

export class ChatListActiveId extends ChatListDefault {
  constructor(chatList: PeMessageChat[], protected activeChatId: string) {
    super(chatList);
  }

  activeChat(): PeMessageChat | null {
    return this.chatList.length ?
      (this.chatList.find((chat: PeMessageChat) => chat._id === this.activeChatId) ?? this.chatList[0]) : null;
  }
}
