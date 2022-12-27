import { Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { PeMessageChannelType } from '@pe/shared/chat';

import { PeMessageCreatingChatData } from '../../../interfaces';

import { ChannelAbstractClass } from './channel-abstract.class';

export class ChannelIntegrationClass extends ChannelAbstractClass {
  subType = PeMessageChannelType.Public;
  postIntegrationChannel$: Observable<boolean | null>;

  create(data): null {
    this.postIntegrationChannel$ = this.peMessageApiService.postIntegrationChannel(
      { ...data }
    ).pipe(
      map((newChannel) => {
        this.channel = newChannel;

        return true;
      }),
    );

    return null;
  }

  next(data: PeMessageCreatingChatData): Observable<any> {
    return this.postIntegrationChannel$.pipe(
      tap(() => {
        data.onCloseSubject$.next(true);
      }),
    );
  }
}
