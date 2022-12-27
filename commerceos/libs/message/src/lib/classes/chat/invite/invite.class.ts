import { EMPTY, forkJoin, Observable } from 'rxjs';


import { Contact } from '@pe/shared/contacts';

import { PeMessageApiService, PeMessageChatRoomListService } from '../../../services';
import { ChatAbstractClass } from '../chat-abstract.class';


export class InviteClass extends ChatAbstractClass {
  set direct(ch: any) {
    this.chat = ch;
  }

  get direct(): any {
    return this.chat;
  }

  constructor(protected peMessageApiService: PeMessageApiService) { super(peMessageApiService); }

  create = () => this.postIntegrationChannel$ = EMPTY;

  inviteMembers(
    members: Contact[],
    peMessageChatRoomListService: PeMessageChatRoomListService,
    chatInviteId?: string,
  ): Observable<any> {
    const invitations$ = [];
    const chat = peMessageChatRoomListService.activeChat;
    members.forEach((member: any) => {
      invitations$.push(member.metaUserId
        ? this.peMessageApiService.postConversationMemberInvite(
          chat._id,
          member.serviceEntityId,
          chatInviteId,
        )
        : this.peMessageApiService.postChannelEmailInvite(
          chat._id,
          member.email,
          chatInviteId,
        )
      );
    });

    return forkJoin([...invitations$]);
  }
}
