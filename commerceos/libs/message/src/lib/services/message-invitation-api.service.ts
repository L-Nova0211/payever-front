import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageDirectChat } from '../interfaces';

import { PE_MESSAGE_API_PATH } from './message-api.service';

interface PeMessageConversationInvitationInfo {
  code: string;
  messaging: {
    _id: string;
    photo: string;
    title: string;
    type: string;
  };
}

interface PeMessagePublicConversationInvitationInfo {
  _id: string;
  photo: string;
  slug: string;
  title: string;
}

@Injectable()
export class PeMessageInvitationApiService {
  constructor(
    private httpClient: HttpClient,
    @Inject(PE_MESSAGE_API_PATH) private peMessageApiPath: string,
  ) { }

  public getConversationInfoByInviteCode(inviteCode: string): Observable<PeMessageConversationInvitationInfo> {
    return this.httpClient
      .get<PeMessageConversationInvitationInfo>(`${this.peMessageApiPath}/api/invitations/${inviteCode}`);
  }

  public getPublicConversationInfoBySlug(slug: string): Observable<PeMessagePublicConversationInvitationInfo> {
    return this.httpClient
      .get<PeMessagePublicConversationInvitationInfo>(`${this.peMessageApiPath}/api/public-channels/by-slug/${slug}`);
  }

  public joinToConversationByInviteCode(inviteCode: string): Observable<PeMessageChat> {
    return this.httpClient
      .post<PeMessageChat>(`${this.peMessageApiPath}/api/invitations/${inviteCode}/join`, { });
  }

  public joinToPublicConversationByInviteCode(slug: string): Observable<PeMessageChat> {
    return this.httpClient
      .post<PeMessageChat>(`${this.peMessageApiPath}/api/public-channels/by-slug/${slug}/join`, { });
  }

  public postDirectChat(chat: PeMessageDirectChat): Observable<any> {
    return this.httpClient.post(`${this.peMessageApiPath}/api/messaging/direct-chat`, chat);
  }
}
