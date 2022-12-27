import { PeMessageChat } from '@pe/shared/chat';

export abstract class ChatListAbstract {
  constructor(protected chatList: PeMessageChat[]) {}

  abstract activeChat(): PeMessageChat | null;
}
