import { Observable } from 'rxjs';

import { PeMessageChannelType, PeMessageChat } from '@pe/shared/chat';

import { PeMessageGuardService, PeMessageApiService, PeMessageChatRoomListService } from '../../services';

import { ChatAbstractClass } from './chat-abstract.class';
export class ChatFacadeClass {
  protected main = {
    title: '',
    description: '',
    photo: '',
  };

  chatClass: ChatAbstractClass;

  set chat(chat) {
    this.chatClass.chat = chat;
  }

  get chat(): any {
    return this.chatClass.chat;
  }

  constructor(
    protected app: string,
    protected peMessageApiService: PeMessageApiService,
    protected peMessageGuardService: PeMessageGuardService
  ) {}

  mainInfo(data) {
    this.main = data;
  }

  create(type?: PeMessageChannelType): ChatAbstractClass { return null; };
  
  createTemplate(): Observable<PeMessageChat> {
    return this.peMessageApiService.postChatTemplate({ ...this.main, app: this.app });
  }

  createByRole(subType?: PeMessageChannelType): ChatAbstractClass {
    return this.create(subType);
  }

  inviteMembers(
    members: any[],
    peMessageChatRoomListService: PeMessageChatRoomListService,
    chatInviteId?: string
  ): Observable<any> {
    return this.chatClass.inviteMembers(members, peMessageChatRoomListService, chatInviteId);
  }
}
