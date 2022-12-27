import { PeMessageChannelRoles, PeMessageUserRole, PeMessageUserStatus } from '../enums';

import { PeMessageConversationPermissions } from './chat-permissions.interface';

export interface PeMessageUserAccount {
  _id: string;
  email: string;
  firstName: string;
  lastName: string;
  logo: string;
  phone: string;
}

export interface PeMessageChannelMember {
  _id: string;
  avatar?: string;
  initials: string;
  title: string;
}

export interface PeMessageUserSession {
  ipAddress: string;
  userAgent: string;
}

export interface PeMessageUser {
  _id: string;
  businesses: string[];
  lastSeen?: Date;
  roles: PeMessageUserRole[];
  sessions: PeMessageUserSession[];
  status: PeMessageUserStatus;
  userAccount: PeMessageUserAccount;
}

export interface PeMessageChatMember extends Partial<PeMessageChannelMember> {
  addedBy?: string;
  addMethod?: string;
  notificationDisabledUntil?: Date;
  role?: PeMessageChannelRoles;
  user?: string;

  createdAt?: string;
  updatedAt?: string;
}

export interface PeMessageChatCurrentMemberUserInfo {
  _id: string;
  userAccount: PeMessageUserAccount;
}

export interface PeMessageChatCurrentMemberInfo extends
  Omit<PeMessageConversationMember, 'user'>,
  Omit<PeMessageChatMember, 'user'> {
  user?: string | PeMessageChatCurrentMemberUserInfo
}

export interface PeMessageChannelMemberByCategory extends PeMessageChannelMember {
  label?: string;
  permissions?: PeMessageConversationPermissions;
  role?: PeMessageChannelRoles;
  userAccount?: PeMessageUserAccount;
  isOnline?: boolean;
}

export interface PeMessageConversationMember {
  permissions?: PeMessageConversationPermissions;
  profile?: string;
  role?: PeMessageChannelRoles;
  user?: {
    _id: string;
    userAccount: PeMessageUserAccount;
  };
}

export interface PeMessageChatTypingUser extends PeMessageUser {
  avatar: string;
  initials: string;
  title: string;
  user?: string;
}
