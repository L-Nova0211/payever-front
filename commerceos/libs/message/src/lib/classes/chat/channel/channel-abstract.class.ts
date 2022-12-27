import { Observable } from 'rxjs';

import { PeMessageChannelType } from '@pe/shared/chat';

import { PeMessageChannelInfo } from '../../../interfaces';
import { ChatAbstractClass } from '../chat-abstract.class';

export abstract class ChannelAbstractClass extends ChatAbstractClass {
  abstract subType: PeMessageChannelType;

  set channel(ch: PeMessageChannelInfo) {
    this.chat = ch;
  }

  get channel(): PeMessageChannelInfo {
    return this.chat;
  }

  create(data): Observable<null | any> {
    return this.peMessageApiService.postChannel({ ...data, ...{ contacts: [] } });
  }
}
