import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeMessageApiService, PeMessageChatRoomListService } from '../../../services';
import { ChatAbstractClass } from '../chat-abstract.class';

export class GroupClass extends ChatAbstractClass {
  set group(ch: any) {
    this.chat = ch;
  }

  get group(): any {
    return this.chat;
  }

  constructor(protected peMessageApiService: PeMessageApiService) { super(peMessageApiService); }

  create(data): Observable<null | boolean> {
    this.postIntegrationChannel$ = this.peMessageApiService.postGroup({ ...data }).pipe(
      map(newGroup => {
        this.group = newGroup;

        return true;
      }),
    );

    return this.postIntegrationChannel$;
  }

  inviteMembers(
    members: any[],
    peMessageChatRoomListService: PeMessageChatRoomListService,
    chatInviteId?: string,
  ): Observable<any> {
    const invitations$ = [];
    members.forEach((member: any) => {
      invitations$.push(member.metaUserId
        ? this.peMessageApiService.postConversationMemberInclude(
          this.chat._id,
          member.metaUserId,
          this.chat.type,
        )
        : this.peMessageApiService.postChannelEmailInvite(
          this.chat._id,
          member.email,
          chatInviteId,
        )
      );
    });

    return forkJoin([...invitations$]);
  }
}
