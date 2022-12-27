import { Injectable } from '@angular/core';

import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageService } from '../../services/message.service';

import { ChatListActiveId } from './chat-list-active-id';
import { ChatListApp } from './chat-list-app';
import { ChatListDefault } from './chat-list-default';

@Injectable()
export class ChatListFacade {
  chatListInstance!: ChatListDefault;

  constructor(protected peMessageService: PeMessageService) {}

  init(chatList: PeMessageChat[]): ChatListApp | ChatListActiveId | ChatListDefault {
    if (this.peMessageService.app) {
      this.chatListInstance = new ChatListApp(chatList, this.peMessageService.app);
    } else if (this.peMessageService.activationChatId) {
      this.chatListInstance = new ChatListActiveId(chatList, this.peMessageService.activationChatId);
    } else if (chatList) {
      this.chatListInstance = new ChatListDefault(chatList);
    }

    return this.chatListInstance;
  }

  get(): ChatListApp | ChatListActiveId | ChatListDefault {
    return this.chatListInstance;
  }
}
