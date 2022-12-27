import { EventEmitter } from '@angular/core';
import {  forkJoin, Observable } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';

import { PeMessageChatInfo, PeMessageChatInvites } from '@pe/shared/chat';

import {
  PeMessageCreatingChatData,
  PeMessageTypeChannel,
} from '../../interfaces';
import { PeMessageChatRoomListService, PeMessageApiService } from '../../services';

export abstract class ChatAbstractClass {
  chat: PeMessageChatInfo;
  postIntegrationChannel$: Observable<boolean | null>;

  constructor(protected peMessageApiService: PeMessageApiService) {}

  abstract create(data): Observable<null | any>;

  next(data: PeMessageCreatingChatData, typeChannel?: EventEmitter<PeMessageTypeChannel>): Observable<any> {
    data.isLoading$.next(true);

    return this.postIntegrationChannel$.pipe(
      switchMap(() => {
        return this.peMessageApiService.getChatInvites(this.chat._id).pipe(
          tap((invites: PeMessageChatInvites) => {
            data.isLoading$.next(false);
            typeChannel?.emit({
              chatInvites: invites[0],
            });
          }),
        );
      }),
    );
  }

  inviteMembers(
    members: any[],
    peMessageChatRoomListService: PeMessageChatRoomListService,
    chatInviteId?: string,
  ): Observable<any> {
    const invitations$ = [];
    members.forEach((member: any) => {
      invitations$.push(member.metaUserId
        ? this.peMessageApiService.postConversationMemberInvite(
          this.chat._id,
          member.serviceEntityId,
          chatInviteId,
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
