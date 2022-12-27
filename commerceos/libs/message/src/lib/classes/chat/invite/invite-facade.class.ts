import { ChatFacadeClass } from '../chat-facade.class';

import { InviteClass } from './invite.class';

export class InviteFacadeClass extends ChatFacadeClass {
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

  create(): InviteClass {
    
    this.chatClass = new InviteClass(this.peMessageApiService);
    
    this.chatClass.create(this.main);

    return this.chatClass as InviteClass;
  }
}
