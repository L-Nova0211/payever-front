import { BehaviorSubject, Subject } from 'rxjs';

import { PeGridItem } from '@pe/grid';
import { PeMessageChat } from '@pe/shared/chat';
import { Contact } from '@pe/shared/contacts';

import { ChatAbstractClass } from '../classes';
import {
  PeMessageChatType,
} from '../enums';

export interface PeMessageChatInvitation {
  expiresAt: string;
}

export interface PeMessageDirectChat {
  peer: string;
  title?: string;
  parentFolderId?: string;
}

export interface PeMessageWS {
  type: string,
  content?: string,
  components?: Object[],
  interactive?: Object,
  attachments?: PeMessageWSAttachment[],
  replyTo?: string,
}

export interface PeMessageWSAttachment<T = any> {
  mimeType: string,
  size: number,
  title: string,
  url: string,
  data: T
}

export interface PeMessageConversationCreateData {
  contacts: PeGridItem<Contact>[],
  groupNumber?: number,
}

export interface PeMessageCreatingChatData {
  onCloseSubject$: Subject<boolean>,
  isLoading$: BehaviorSubject<boolean>,
  theme: string,
  contacts: Object[],
  type: PeMessageChatType,
  chatClass: ChatAbstractClass,
}

export interface PeMessageChooseRecipientOverlayData {
  activatedChat$: Subject<PeMessageChat>;
  theme: string,
  loading: boolean,
  chatList: PeMessageChat[],
  draggable: boolean,
}
export interface PeMessageForwardChatData {
  onChatSelectSubject$: Subject<PeMessageChat>,
  isLiveChat: boolean,
}

export interface PeMessageChatDeleteConversationData{
  id: string,
  type: PeMessageChatType,
}

export interface PeMessageChatDeleteData {
  conversation: PeMessageChatDeleteConversationData;
  leave: boolean,
}