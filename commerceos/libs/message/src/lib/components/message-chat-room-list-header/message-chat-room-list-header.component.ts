import { ChangeDetectionStrategy, ChangeDetectorRef, Component, HostBinding, Input, OnInit } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { of, Subject } from 'rxjs';
import { catchError, filter, switchMap, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { MediaService } from '@pe/media';
import {
  PeChatMessage,
  PeChatMessageStatus,
  PeChatMessageType,
  PeMessageChannelType,
  PeMessageChat,
} from '@pe/shared/chat';

import { PeMessageChatType } from '../../enums';
import { PeMessageApiService } from '../../services/message-api.service';
import { PeMessageChatRoomListService } from '../../services/message-chat-room-list.service';
import { PeMessageService } from '../../services/message.service';

@Component({
  selector: 'pe-message-chat-room-list-header',
  templateUrl: './message-chat-room-list-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageChatRoomListHeaderComponent implements OnInit {
  _chat: PeMessageChat;
  _order: string;
  @Input()
  set chat(value: PeMessageChat) {
    this._chat = value;
    this.checkDraft$.next(value);
  }

  get chat() {
    return this._chat;
  }

  @Input()
  set order(value: string) {
    this._order = value;
    this.hostOrder = value;
  }

  get order() {
    return this._order;
  }

  @Input() hasInfo = true;

  @Input() accentColor = '';

  @HostBinding('style.order') public hostOrder = '0';

  avatar: SafeStyle = '';
  checkDraft$ = new Subject<PeMessageChat>();
  draftMessage: PeChatMessage;

  constructor(
    public cdr: ChangeDetectorRef,
    private peMessageApiService: PeMessageApiService,
    public mediaService: MediaService,
    public peMessageChatRoomListService: PeMessageChatRoomListService,
    public peMessageService: PeMessageService,
    private readonly destroy$: PeDestroyService,
  ) {
    this.checkDraft$.pipe(
      filter(chat => !!chat),
      switchMap(chat => {
        return this.peMessageApiService.getChatDraftMessage(this.chat._id, this.chat.business).pipe(
          switchMap((message) => {
            if (message[0]) {
              this.draftMessage = this.peMessageService.prepareDraftMessage(message[0]);
              chat.draftUpdatedAt = new Date(this.draftMessage?.updatedAt);
              this.hostOrder = (-('1' + (new Date(this.draftMessage?.updatedAt).getTime())).toString().slice(6, 13))
                .toString();
            } else {
              this.draftMessage = null;
              chat.draftUpdatedAt = null;
              this.hostOrder = this.order;
              this.cdr.detectChanges();
            }
            this.cdr.markForCheck();

            return of([]);
          }),
        );
      }),
      catchError(() => of({ })),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private get activeUser() {
    return this.peMessageService.activeUser;
  }

  private get messages(): PeChatMessage[] {
    return this.chat?.messages;
  }

  ngOnInit(): void {
    this.avatar = this.getAvatar();
    this.peMessageChatRoomListService.draftChange$.pipe(
      tap(res => {
        if (this.chat._id === res) {
          this.checkDraft$.next(this.chat);
        }
      }),
      takeUntil(this.destroy$),
    ).subscribe();
  }

  private getAvatar(): SafeStyle {
    if (this.chat.type === PeMessageChatType.DirectChat) {
      const userDirectChat = this.chat?.membersInfo
        ?.find(member => member.user._id !== this.peMessageService.getUserData().uuid);

      return userDirectChat?.user?.userAccount?.logo
        ? this.mediaService.getMediaUrl(userDirectChat?.user?.userAccount?.logo, 'images')
        : '';
    }

    return this.chat.avatar;
  }

  public showTag(): any {
    if (this.activeUser?.userAccount) {
      const { firstName, lastName } = this.activeUser?.userAccount;
      const taggedName = `@${firstName} ${lastName}`;

      return this.messages
        ?.some(message => message?.content && message.content.includes(taggedName) && this.isMessageRead(message))
        || this.isSomeoneRepliedCurrentUser(this.activeUser._id);
    }

    return false;
  }

  isSomeoneRepliedCurrentUser(userId) {
    return !!this.messages?.find(lM => {
      if (lM.replyTo && lM.status !== PeChatMessageStatus.READ) {
        return !!this.messages
          .find(item => item._id === lM.replyTo && item.sender === userId && item.sender !== lM.sender);
      }

      return false;
    });
  }

  public isLastMessageIcon(): boolean {
    const { attachments } = [...this.messages].pop() ?? { attachments: null };

    return attachments && !!attachments?.length;
  }

  public getLastMessageContent(): string | null {
    if (this.messages.length) {
      const filteredMessages = this.messages
        .filter(message => !message.deletedForUsers?.includes(this.activeUser?._id));
      const lastMessage = filteredMessages.pop();
      const { content, type } = lastMessage ?? { content: null, type: null };

      if (content && type !== 'template' && content !== '{#empty#}') {
        return content.length > 22
          ? content.slice(0, 22) + '…'
          : content;
      }
    }

    return null;
  }

  public isMessageRead(message: PeChatMessage, user = this.activeUser) {
    const { readBy, sender, type } = message;
    const currentMemberId = (typeof user === 'string') ? user : user._id;

    return [PeChatMessageType.WelcomeMessage, PeChatMessageType.DateSeparator, PeChatMessageType.Box].includes(type)
      || (readBy && readBy.includes(currentMemberId)) || sender === currentMemberId;
  }

  public getNumberUnreadMessages(): number | null {
    return this.messages.length
      ? this.messages.filter(message => !this.isMessageRead(message)).length
      : null;
  }

  public isPrivateChannel(): boolean {
    return this.chat.subType === PeMessageChannelType.Private;
  }
}
