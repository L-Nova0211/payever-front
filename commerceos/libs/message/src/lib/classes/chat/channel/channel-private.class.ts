import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeMessageChannelType } from '@pe/shared/chat';

import { ChannelAbstractClass } from './channel-abstract.class';

export class ChannelPrivateClass extends ChannelAbstractClass {
  subType = PeMessageChannelType.Private;

  create(data): Observable<boolean | null> {
    this.postIntegrationChannel$ = super.create({ ...data, ...{ subType: this.subType } }).pipe(
      map(newChannel => {
        this.channel = newChannel;

        return true;
      }),
    );

    return this.postIntegrationChannel$;
  }
}
