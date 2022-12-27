import { PeChatUserIntegrationRole, PeChatUserStatus } from '../enums/chat.enums';


export interface PeChatUser {
  business: string;
  avatar: string;
  lastSeen?: Date;
  name: string;
  roles: PeChatUserIntegrationRole[];
  status: PeChatUserStatus;
  sessions: PeChatUserSession[];
}

export interface PeChatUserSession {
  userAgent: string;
  ipAddress: string;
}
