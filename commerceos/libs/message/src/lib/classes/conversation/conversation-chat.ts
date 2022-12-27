import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeMessageChat, PeMessageIntegration } from '@pe/shared/chat';
import { Contact } from '@pe/shared/contacts';

import { PeMessageChatType } from '../../enums';

import { ConversationAbstract } from './conversation-abstract';

export class ConversationChat extends ConversationAbstract {
  createConversation(data: Contact): Observable<any> {
    return data.metaUserId
      ? this.peMessageApiService.postDirectChat({
        peer: data.metaUserId,
        title: `${data.firstName ?? ''} ${data.lastName ?? ''}`,
      })
      : this.peMessageApiService.postDirectChatInviteByEmail(data.email);
  }

  conversation(): Observable<any> {
    return this.messageStateService.getConversationOnce(this.conversationItem._id, PeMessageChatType.Chat);
  }

  conversationSwitch(): Observable<any> {
    return this.messageStateService.getConversationOnce(this.conversationItem._id, PeMessageChatType.Chat).pipe(
      map((chatListItem: PeMessageChat) => ({ chatListItem })),
    );
  }

  deleteConversation(): Observable<any> {
    if (this.conversationItem.integrationName === PeMessageIntegration.LiveChat) {
      return this.peMessageApiService.deleteAppConversation(this.conversationItem._id, this.conversationItem.type);
    } else {
      return this.peMessageApiService.deleteChat(this.conversationItem._id, this.conversationItem.type);
    }
  }
}
