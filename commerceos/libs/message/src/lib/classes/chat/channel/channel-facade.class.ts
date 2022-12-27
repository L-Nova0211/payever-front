import { PeMessageChannelType } from '@pe/shared/chat';

import { ChatFacadeClass } from '../chat-facade.class';

import { ChannelAbstractClass } from './channel-abstract.class';
import { ChannelIntegrationClass } from './channel-integration.class';
import { ChannelPrivateClass } from './channel-private.class';
import { ChannelPublicClass } from './channel-public.class';

export class ChannelFacadeClass extends ChatFacadeClass {
  protected main = {
    title: '',
    description: '',
    photo: '',
  };

  get channel(): any {
    return this.chatClass.chat;
  }

  mainInfo(data) {
    this.main = data;
  }

  create(subType): ChannelAbstractClass {
    switch (subType) {
      case PeMessageChannelType.Public:
        this.chatClass = new ChannelPublicClass(this.peMessageApiService);
        break;
      case PeMessageChannelType.Private:
        this.chatClass = new ChannelPrivateClass(this.peMessageApiService);
        break;
      case PeMessageChannelType.Integration:
        this.chatClass = new ChannelIntegrationClass(this.peMessageApiService);
        break;
    }

    this.chatClass.create(this.main);

    return this.chatClass as ChannelAbstractClass;
  }
}
