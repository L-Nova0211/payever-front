import { Injectable } from '@angular/core';
import { SelectSnapshot } from '@ngxs-labs/select-snapshot';
import { Store } from '@ngxs/store';
import { ReplaySubject } from 'rxjs';

import { PeMessageChannel } from '../../../interfaces';
import { SetMailConfig } from '../../../state/message.actions';
import { MessageState } from '../../../state/message.state';

import { PeForwardConfig, PeMailConfig } from './interfaces/mail-builder.interface';

@Injectable({
  providedIn: 'root',
})
export class PeMailBuilderService {

  @SelectSnapshot(MessageState.mailConfig) mailConfigSnapshot: PeMailConfig;

  constructor(
    private store: Store,
  ) {}

  blockRouteNavigation$ = new ReplaySubject<boolean | null>(1);
  replyConfig$ = new ReplaySubject<PeMessageChannel | null>(1);
  forwardConfig$ = new ReplaySubject<PeForwardConfig>(1);

  setMailConfig(mailConfig: PeMailConfig): void {
    this.store.dispatch(new SetMailConfig(mailConfig));
  }

  resetToolbar(): void {
    this.replyConfig$.next(null);
    this.forwardConfig$.next(null);
    this.store.dispatch(new SetMailConfig(null));
  }
}
