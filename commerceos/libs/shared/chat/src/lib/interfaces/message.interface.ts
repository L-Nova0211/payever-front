import { SafeStyle } from '@angular/platform-browser';

import { PebStylesheet } from '@pe/builder-core';

import { PeChatMessageStatus, PeChatMessageType, MessageChatEvents } from '../enums';

import { PeChatMessageAttachment } from './message-attachment.interface';

export interface PeChatMessage {
  _id?: string;
  attachments?: PeChatMessageAttachment[];
  avatar?: SafeStyle;
  chat?: string;
  components?: any;
  content?: string;
  deletedForUsers?: string[];
  draftUpdatedAt?: Date;
  data?: PeChatModifiedMemberListData;
  editedAt?: Date;
  eventName?: MessageChatEvents;
  forwardFrom?: ForwardMessage;
  grouped?: any;
  interactive?: any;
  intersectedViewport?: () => void;
  loadingHash?: any;
  name?: string;
  pinId?: string;
  readBy?: string[];
  reply?: boolean;
  replyData?: PeChatMessage;
  replyTo?: string;
  selected?: boolean;
  sender?: string;
  senderTitle?: string;
  sentAt?: Date;
  shown?: boolean;
  sign?: string;
  status?: PeChatMessageStatus;
  stylesheets?: {
    [screen: string]: PebStylesheet;
  };
  template?: string;
  theme?: string;
  type?: PeChatMessageType;
  chatMemberUsernames?: string[];

  createdAt?: Date;
  updatedAt?: Date;
}

export interface ForwardMessage {
  _id: string;
  sender: string;
  senderTitle: string;
}

export interface PeChatMessageReplyTo {
  _id: string;
  originalContent?: string;
}

export interface PeChatPinnedMessage {
  _id: string;
  forAllUsers?: boolean;
  messageId: string;
  pinner: string;
  pinId: string;
}

export interface PeChatPinnedMessageResponse {
  chat: {
    _id: string;
  };
  message: PeChatMessage;
  pinned: PeChatPinnedMessage;
}

export interface PeChatModifiedMemberInfo {
  contact: string,
  contactId: string,
  user: string,
  userAccount: {
    email: string,
    firstName: string
    lastName: string
  }
}

export interface PeChatModifiedMemberListData {
  includedById?: string,
  includedUserId?: string,
  excludedById?: string,
  excludedUserId?: string,
  excludedBy?: PeChatModifiedMemberInfo
  excludedUser?: PeChatModifiedMemberInfo
  withInvitationLink?: boolean,
  includedBy?: PeChatModifiedMemberInfo
  includedUser?: PeChatModifiedMemberInfo
  leftUser?: PeChatModifiedMemberInfo
}
