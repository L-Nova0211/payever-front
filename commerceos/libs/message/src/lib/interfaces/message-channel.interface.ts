import { Observable, Subject } from 'rxjs';

import { PeMessageChannelMode, PeMessageChat, PeMessageChatInfo, PeMessageChatInvites } from '@pe/shared/chat';
import { PePickerDataInterface } from '@pe/ui';

export interface PeMessageChannel extends Omit<PeMessageChat, 'type'> {
  contacts?: string[];
  inviteCode?: string;
  subType?: string;
  description?: string;
}

export enum PeMessageChannelPermissionsEnum {
  Public = 'publicView',
  Change = 'change',
  SeeSender = 'seeSender',
  Live = 'live',
  SendMessages = 'sendMessages',
  SendMedia = 'sendMedia',
  AddMembers = 'addMembers',
  PinMessages = 'pinMessages',
}

export type PeMessageChannelPermissions = {
  [key in PeMessageChannelPermissionsEnum]?: boolean;
}

export interface PeMessageChannelAddAdminsData {
  onCloseSubject$: Subject<boolean>,
  channel: PeMessageChat,
  theme: string,
  data: PePickerDataInterface[],
  lazyLoadData: Observable<PePickerDataInterface[]>,
  onKeyUp: Function,
  mode: PeMessageChannelMode,
}

export interface PeMessageChannelInfo extends PeMessageChatInfo {
  subType?: string;
}

export interface PeMessageTypeChannel {
  chatInvites?: PeMessageChatInvites,
}
