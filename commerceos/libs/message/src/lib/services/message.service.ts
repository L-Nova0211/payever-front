import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeAuthService } from '@pe/auth';
import { AuthUserData } from '@pe/auth/services/auth.service';
import { PeMessageContact, PeMessageIntegration, PeMessageUser, PeChatMessage } from '@pe/shared/chat';
import { SnackbarService } from '@pe/snackbar';

import {
  PeMessageSubscription,
  PeMessageBubble,
} from '../interfaces';


@Injectable()
export class PeMessageService {

  activeUser!: PeMessageUser;
  uuid!: string;
  app!: string;
  appId!: string;
  checkoutId!: string;
  shopId!: string;
  siteId!: string;
  contactList!: PeMessageContact[];
  channelSetId!: PeMessageIntegration;
  isLiveChat!: boolean;
  isEmbedChat!: boolean;
  subscriptionList: PeMessageSubscription[] = [];
  activationChatId?: string;
  isBusiness: boolean;

  private unreadMessagesStream$ = new BehaviorSubject<any>(0);
  unreadMessages$ = this.unreadMessagesStream$.asObservable();
  get unreadMessages(): number {
    return this.unreadMessagesStream$.value;
  }

  set unreadMessages(count: number) {
    this.unreadMessagesStream$.next(count);
  }

  liveChatBubbleClickedStream$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private readonly userListStream$ = new BehaviorSubject<PeMessageUser[]>(null);
  userList$ = this.userListStream$.asObservable();

  set userList(userList: PeMessageUser[]) {
    this.userListStream$.next(userList);
  }

  get userList(): PeMessageUser[] {
    return this.userListStream$.value;
  }

  private bubbleStream$ = new BehaviorSubject<PeMessageBubble>({});
  bubble$ = this.bubbleStream$.asObservable();
  get bubble(): PeMessageBubble {
    return this.bubbleStream$.value;
  }

  set bubble(bubble: PeMessageBubble) {
    this.bubbleStream$.next(bubble);
  }

  bubbleLogo?: File;

  constructor(
    private snackbarService: SnackbarService,
    private peAuthService: PeAuthService,
  ) {
  }

  getUserData(): AuthUserData {
    // TODO:
    // But maybe think of an approach different to ternary checks all the time.
    // Probably some abstractions and separation of live from the other one.
    // For future refactor to not forget.
    return this.isLiveChat ? {
      roles: '',
      uuid: '',
    } as AuthUserData : this.peAuthService.getUserData();
  }

  changeUnreadMessages(value: number) {
    const total = this.unreadMessages + value;
    this.unreadMessages = total < 0 ? 0 : total;
  }

  public isValidUrl(url: string): boolean {
    try {
      new URL(url);
    } catch (e) {
      return false;
    }

    return true;
  }

  public prepareDraftMessage(draftMessage: PeChatMessage): PeChatMessage {

    return draftMessage
      ? {
        ...draftMessage,
        content: draftMessage.content.length > 10
          ? draftMessage.content.slice(0, 10) + '…'
          : draftMessage.content,
      }
      : null;
  }

  public isValidImgUrl(url: string): Promise<any> {

    const myRequest = new Request(url);

    return fetch(myRequest);
  }

  alert(content) {
    this.snackbarService.toggle(true, {
      content: content,
      duration: 5000,
      iconId: 'icon-apps-alert',
      iconSize: 24,
      iconColor: '#E2BB0B',
      useShowButton: false,
    });
  }
}
