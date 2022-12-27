import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PeMessageChannelType } from '@pe/shared/chat';

import { ChannelAbstractClass } from './channel-abstract.class';

export class ChannelPublicClass extends ChannelAbstractClass {
  subType = PeMessageChannelType.Public;
  postIntegrationChannel$: Observable<boolean | null>;

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
