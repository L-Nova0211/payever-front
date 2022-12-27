import { PeMessageChannelPermissionsEnum } from '../interfaces';

import { PeMessageChatType } from './message-chat-type.enum';

export enum PeMessageChatAction {
    Add = 'add',
    Mute = 'mute',
    Link = 'invite Link',
    Edit = 'edit',
    Search = 'search',
    Delete = 'delete',
    Permissions = 'permissions'
}

export interface PeMessageChatActionItem {
  action: PeMessageChatAction,
  icon: string,
  permissions: PeMessageChannelPermissionsEnum[],
  types: PeMessageChatType[],
}

export enum PeMessageMemberAction {
  Delete = 'delete',
}

export enum PeAdditionalChannelSettingsItems {
  Type = 'type',
  Sign = 'sign',
  Remove = 'remove',
  Permission = 'permission'
}
