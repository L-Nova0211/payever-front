import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

import { PeGridItem } from '@pe/grid';
import { PeMessageChat, PeMessageChatInvites } from '@pe/shared/chat';
import { Contact } from '@pe/shared/contacts';

import { PeMessageChatType } from '../../enums';
import { PeMessageConversationCreateData } from '../../interfaces';

import { ConversationAbstract } from './conversation-abstract';

export class ConversationGroup extends ConversationAbstract {
  createConversation(data: PeMessageConversationCreateData): Observable<any> {
    return this.peMessageApiService.postGroup({
      title: `${this.translateService.translate('message-app.sidebar.group')}_${data.groupNumber}`,
    }).pipe(
      switchMap( group => {
        return this.peMessageApiService.getChatInvites(group._id).pipe(
          switchMap((invites: PeMessageChatInvites) => {
            const invitations$ = [];
            data.contacts.forEach((contact: PeGridItem<Contact>) => {
              invitations$.push(contact.data.metaUserId
                ? this.peMessageApiService.postConversationMemberInclude(
                  group._id,
                  contact.data.metaUserId,
                  PeMessageChatType.Group,
                )
                : this.peMessageApiService.postConversationMemberInvite(
                  group._id,
                  contact.id,
                  invites[0]._id,
                )
              );
            });

            return forkJoin([...invitations$]);
          }),
        );
      }),
    );
  }

  conversation(): Observable<any> {
    return this.messageStateService.getConversationOnce(this.conversationItem._id, PeMessageChatType.Group);
  }

  conversationSwitch(): Observable<any> {
    return this.messageStateService.getConversationOnce(this.conversationItem._id, PeMessageChatType.Group).pipe(
      map((chatListItem: PeMessageChat) => ({ chatListItem })),
    );
  }

  deleteConversation(): Observable<any> {
    return this.peMessageApiService.deleteGroup(this.conversationItem._id);
  }
}
