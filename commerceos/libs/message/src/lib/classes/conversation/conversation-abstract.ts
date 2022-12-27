import { Observable } from 'rxjs';

import { TranslateService } from '@pe/i18n-core';
import { PeChatMessage, PeMessageChat } from '@pe/shared/chat';
import { Contact } from '@pe/shared/contacts';

import { PeMessageChatType } from '../../enums';
import { PeMessageConversationCreateData } from '../../interfaces';
import { PeMessageApiService, PeMessageChatRoomListService, PeMessageService } from '../../services';
import { MessageStateService } from '../../services/message-state.service';

export abstract class ConversationAbstract {
  constructor(
    protected conversationItem: Partial<PeMessageChat>,
    protected messageStateService: MessageStateService,
    protected peMessageApiService: PeMessageApiService,
    protected peMessageService: PeMessageService,
    protected translateService: TranslateService,
  ) {}

  abstract conversation(): Observable<any>;
  abstract createConversation(data: Contact | PeMessageConversationCreateData): Observable<any>;
  abstract conversationSwitch(
    envCustomStorage?: string,
    chatRoomListService?: PeMessageChatRoomListService,
  ): Observable<any>;

  abstract deleteConversation(businessId?: string): Observable<any>;
  excludeCurrentMemberFromConversation(
    businessId: string,
    conversationId: string,
    userId: string,
    conversationType: PeMessageChatType,
  ): Observable<any> {
    return this.peMessageApiService.postConversationMemberExclude(
      conversationId,
      userId,
      conversationType,
      businessId,
    );
  }

  refreshMessages(messages): PeChatMessage[] {
    return messages.map(message => {
      const user = this.peMessageService.userList?.find(u => u._id === message.sender)?.userAccount;

      return { ...message, avatar: message.avatar ?? user?.logo };
    });
  }
}
