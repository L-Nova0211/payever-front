import { Observable } from 'rxjs';

import { PeMessageChatRoomListService } from '../../../services';
import { ChatFacadeClass } from '../chat-facade.class';

import { GroupClass } from './group.class';

export class GroupFacadeClass extends ChatFacadeClass {
  protected main = {
    title: '',
    description: '',
    photo: '',
  };

  get group(): any {
    return this.chatClass.chat;
  }

  mainInfo(data) {
    this.main = data;
  }

  create(): GroupClass {
    this.chatClass = new GroupClass(this.peMessageApiService);
    this.chatClass.create(this.main);

    return this.chatClass as GroupClass;
  }

  inviteMembers(
    members: any[],
    peMessageChatRoomListService: PeMessageChatRoomListService,
    chatInviteId?: string
  ): Observable<any> {
    return this.chatClass.inviteMembers(members, peMessageChatRoomListService, chatInviteId);
  }
}
