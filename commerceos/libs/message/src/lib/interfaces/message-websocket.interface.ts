import { Exclude, Expose, Type } from 'class-transformer';
import { Subject } from 'rxjs';
import 'reflect-metadata';

import { PeMessageChannelRoles, PeMessageChat, PeMessageChatMember } from '@pe/shared/chat';

import { PeMessageChatType } from '../enums';

export interface PeMessageWebSocketHandleSubject<T = any> {
  name: string;
  subject: Subject<T>;
}

export interface PeMessageWebSocketMember {
  addMethod: string;
  addedBy: string;
  role: PeMessageChannelRoles;
  user: string;
}

export class PeMessageWebSocketUserAccountDTO {
  email: string;
  firstName: string;
  lastName: string;

  @Expose()
  get fullName() {
    return this.firstName + ' ' + this.lastName;
  }

  @Exclude()
  _id: string;
}

export class PeMessageWebSocketUserDTO {
  @Type(() => PeMessageWebSocketUserAccountDTO)
  userAccount: PeMessageWebSocketUserAccountDTO;

  _id: string;
}

export class PeMessageWebSocketIncludedDTO {
  chat: PeMessageChat;
  member: PeMessageWebSocketMember;
  @Type(() => PeMessageWebSocketUserDTO)
  userData: PeMessageWebSocketUserDTO;
}

export class PeMessageWebSocketUserExcludedDTO {
  @Type(() => PeMessageWebSocketUserAccountDTO)
  userAccount: PeMessageWebSocketUserAccountDTO;

  chatId: string;
  member: PeMessageWebSocketMember;
}

export class PeMessageWebSocketExcludedDTO {
  @Type(() => PeMessageWebSocketUserDTO)
  userData: PeMessageWebSocketUserExcludedDTO;
}

export interface PeForwardMessage {
  ids: string[];
  chat: string;
}

export class PeMessageWebSocketMemberChanged {
  chatId: string;
  chatType: PeMessageChatType;
  memberId: string;
  member: PeMessageChatMember;
}

export interface PeMessageMember {
  _id: string;
  avatar: string;
  initials: string;
  label: string;
  permissions: Permissions;
  role: string;
  title: string;
}

export interface Permissions {
  sendMedia: boolean;
  sendMessages: boolean;
  updatedAt: Date;
}
