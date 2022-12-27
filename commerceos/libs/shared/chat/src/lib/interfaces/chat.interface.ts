import { SafeStyle } from '@angular/platform-browser';

import { PeMessageChatType } from '../enums';

import { PeMessageChatCurrentMemberInfo, PeMessageChatTypingUser, PeMessageUser } from './message-user.interface';
import { PeChatMessage, PeChatPinnedMessage } from './message.interface';

export interface PeMessageChat {
  _id?: string;
  avatar?: SafeStyle;
  business?: string;
  contact?: string;
  currentlyAnswering?: string;
  currentMember?: PeMessageChatCurrentMemberInfo;
  deleted?: boolean;
  draft?: PeChatMessage;
  forwardMessageData?: PeChatMessage[];
  initials?: string;
  integrationName?: any;
  messages?: PeChatMessage[];
  lastSeen?: string;
  locations?: {
    _id: string;
    folderId: string;
  }[];
  members?: any[];
  membersInfo?: any;
  onlineMembers?: PeMessageUser[];
  onlineMembersCount?: number;
  parentFolder?: string;
  pinned?: PeChatPinnedMessage[];
  replyToMessage?: PeChatMessage;
  salt?: string;
  shown?: boolean;
  signed?: boolean;
  subType?: string;
  title: string;
  type?: PeMessageChatType;
  typingMembers?: PeMessageChatTypingUser[];
  websocketType?: any;
  [propName: string]: any;
  updatedAt?: Date;
}

export interface PeMessageChatDraft {
  chatId?: string;
  draftMessage: string;
}

export interface PeMessageChatInfo {
  _id?: string;
  photo?: string;
  removedMembers?: any;
  sign?: boolean;
  title?: string;
  type?: PeMessageChatType;
  usedInWidget?: boolean;
}

export interface PeMessageChatNormalized {
  avatar: string;
  messages: any[];
  messageTitle: string;
  noMessagesPlaceholder: string;
}

export class PeMessageChatResponse{
  chat: string;
  hasNext: boolean;
  messages: PeChatMessage[];
  _id: string;
}
