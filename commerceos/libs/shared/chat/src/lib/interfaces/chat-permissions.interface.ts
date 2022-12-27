import { PeMessageChannelRoles } from '../enums';

export interface PeMessageConversationPermissions {
  addMembers: boolean;
  changeGroupInfo: boolean;
  pinMessages: boolean;
  sendMedia: boolean;
  sendMessages: boolean;
}

export interface PeMessageConversationUpdateOptions {
  permissions?: PeMessageConversationPermissions;
  role: PeMessageChannelRoles;
}
