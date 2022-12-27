import { PeMessageChatInvites } from './chat-invites.interface';
import { PeMessageChat } from './chat.interface';

export interface PeMessageGroup extends Omit<PeMessageChat, 'type'> {
  inviteCode?: string;
  description?: string;
}

export interface PeMessageTypeGroup {
  chatInvites?: PeMessageChatInvites;
}
