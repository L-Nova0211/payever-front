import { Injectable } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';
import { cloneDeep } from 'lodash-es';
import { BehaviorSubject, Subject } from 'rxjs';

import { PeGridItem, PeGridItemType } from '@pe/grid';
import { MediaService } from '@pe/media';
import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageChatType, PeMessageStorageItemsEnum } from '../enums';

import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageService } from './message.service';

@Injectable({ providedIn: 'root' })
export class PeMessageConversationService {
  public readonly activeConversation$ = new BehaviorSubject<PeGridItem<PeMessageChat>>(null);
  public readonly checkForInvitation$ = new BehaviorSubject<boolean>(false);
  public readonly conversationList$ = new BehaviorSubject<PeGridItem<PeMessageChat>[]>([]);
  public readonly isLoading$ = new BehaviorSubject<boolean>(true);
  public readonly setConversationAsActiveById$ = new Subject<string>();
  private conversationId = 'conversationId';


  constructor(
    private mediaService: MediaService,
    private peMessageService: PeMessageService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
  ) {}

  public get currentUserId(): string {
    return this.peMessageService.getUserData().uuid;
  }

  public destroy(): void {
    this.activeConversation$.next(null);
    this.checkForInvitation$.next(false);
    this.conversationList$.next([]);
    this.isLoading$.next(true);
  }

  public sortByLatestMessage(conversationList: PeGridItem<PeMessageChat>[]) {
    const getDateInMilliseconds = (date: Date): number => new Date(date).getTime();
    const getLatestChangeDate = ({ draft, messages, lastMessages, members }: PeMessageChat): number => {
      const dates: number[] = [];
      const messagesList = lastMessages ?? messages ?? [];
      const draftDate = getDateInMilliseconds(draft?.sentAt);
      const lastMessageDate = getDateInMilliseconds([...messagesList].pop()?.sentAt);
      const memberIncludedDate = getDateInMilliseconds([...members].pop()?.createdAt);
      draftDate && dates.push(draftDate);
      lastMessageDate && dates.push(lastMessageDate);
      memberIncludedDate && dates.push(memberIncludedDate);

      return Math.max(...dates);
    };

    return conversationList.sort((prev, curr) => getLatestChangeDate(curr.data) - getLatestChangeDate(prev.data));
  }

  public conversationToGridItemMapper(conversations: PeMessageChat[], accentColor = ''): PeGridItem<PeMessageChat>[] {
    const { activeUser } = this.peMessageService;

    return conversations.map(
      (conversation): PeGridItem<PeMessageChat> => {
        const directConversationAvatar = (): SafeStyle => {
          const userDirectChat = conversation.membersInfo?.find(member => member.user._id !== this.currentUserId);

          return userDirectChat?.user?.userAccount?.logo
            ? this.mediaService.getMediaUrl(userDirectChat.user.userAccount.logo, 'images')
            : '';
        };

        const image = (conversation.type === PeMessageChatType.DirectChat
          ? directConversationAvatar()
          : conversation.avatar) as string;

        return {
          columns: [],
          data: {
            accentColor,
            activeUser,
            ...conversation,
          },
          id: conversation._id,
          image,
          isDraggable: true,
          title: conversation.title,
          type: PeGridItemType.Item,
        };
      },
    );
  }

  public setConversationIdToLs(id) {
    localStorage.setItem(this.conversationId, id)
  }

  public getConversationIdFromLS() {
    return localStorage.getItem(this.conversationId);
  }

  public removeConversationIdFromLs() {
    localStorage.removeItem(this.conversationId);
  }

  public rememberCurrentConversation(id: string): void {
    localStorage.setItem(PeMessageStorageItemsEnum.CurrentConversation, id);
  }

  public rememberedConversation(): string {
    return localStorage.getItem(PeMessageStorageItemsEnum.CurrentConversation);
  }

  public forgetCurrentConversation(): void {
    localStorage.removeItem(PeMessageStorageItemsEnum.CurrentConversation);
  }

  public userIsTagged = (activeUser, messages, isUnreadedMessage): boolean => {
    const taggedName = activeUser?.userAccount
      ? `@${activeUser.userAccount.firstName} ${activeUser.userAccount.lastName}`
      : null;

    return messages.some(message => message?.content?.includes(taggedName) && isUnreadedMessage(message));
  };

  public taggedMessage = (activeUser, messages): boolean => {
    const userId = activeUser?._id;
    const msgsWithReplyTo = messages.filter(
      msg => msg.replyTo && msg.sender !== userId && msg.readBy && !msg.readBy.find(id => id === userId),
    );

    const userMsgs = messages.filter(msg => msg.sender === userId);

    for (let msg of msgsWithReplyTo) {
      if (userMsgs.find(userMsg => userMsg._id === msg.replyTo)) {
        return true;
      }
    }

    return false;
  };
}
