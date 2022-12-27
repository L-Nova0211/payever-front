import { Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { AbstractBusInterface } from '@pe/common';
import { PeChatMessage, PeMessageContact } from '@pe/shared/chat';

import { MessageBusEvents } from '../enums';
import { PeMessageChannel } from '../interfaces';
import { PeMailConfig, PeMailEntity } from '../modules/editor';

export class CosMessageBus<T extends MessageBusEvents | string> implements AbstractBusInterface<T> {
  private readonly events$ = new Subject<{ type: T, payload: any }>();

  emit(type: T, payload: any): void {
    this.events$.next({ type, payload });
  }

  listen(type: MessageBusEvents.ContactsOpen): Observable<''>;
  listen(type: MessageBusEvents.ContactsSet): Observable<PeMessageContact[]>;
  listen(type: MessageBusEvents.OpenDialog): Observable<{ dialog: 'sms' | 'chat', mailConfig: PeMailConfig }>;
  listen(type: MessageBusEvents.SaveDraft): Observable<PeChatMessage>;
  listen(type: MessageBusEvents.SendMail): Observable<PeMailEntity>;
  listen(type: MessageBusEvents.SendTestMail): Observable<PeMailConfig>;
  listen(type: MessageBusEvents.ThemeInstalled): Observable<string>;
  listen(type: MessageBusEvents.ThemeOpen): Observable<{ themeId: string, isMobile: boolean }>;
  listen(type: MessageBusEvents.ToggleSidebar): Observable<''>;
  listen(type: MessageBusEvents.ToolbarChange): Observable<PeMailConfig>;
  listen(type: MessageBusEvents.ToolbarReply): Observable<PeMessageChannel>;
  listen(type: MessageBusEvents.ToolbarSetUsers): Observable<{_id: string, userAccount: any}[]>;
  /** @deprecated */
  listen<P>(event: string): Observable<P>;
  listen(type: MessageBusEvents): Observable<any> {
    return this.events$.asObservable().pipe(
      filter(e => e.type === type),
      map(e => e.payload),
    );
  }

}
