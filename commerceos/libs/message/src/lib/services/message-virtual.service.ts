import { Injectable } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';
import {
  MessageChatEvents,
  PeChatMessage,
  PeChatMessageType,
} from '@pe/shared/chat';

import { PeMessageChatRoomListService } from './message-chat-room-list.service';

@Injectable()
export class PeMessageVirtualService {
  constructor(
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private translateService: TranslateService,
  ) {}

  private getMessageDate(message: PeChatMessage): Date {
    return new Date(message.sentAt);
  }

  private getDateSeparator(message: PeChatMessage) {
    const dateMessage: Date = this.getMessageDate(message);

    return {
      content: `${dateMessage.getDate()}.${dateMessage.getMonth() + 1}.${dateMessage.getFullYear()}`,
      type: PeChatMessageType.DateSeparator,
    };
  }

  private checkOnlyLast(messages: PeChatMessage[], messageList: PeChatMessage[]) {
    const lastMessageIndex = messages.length - 1;
    const previousMessageIndex = lastMessageIndex - 1;

    if (lastMessageIndex === -1) {
      return messageList;
    }

    const getMessageDate = (message: PeChatMessage) => this.getMessageDate(message).getDate();
    const checkForServiceMessage = () => {
      return (
        getMessageDate(messages[lastMessageIndex]) !== getMessageDate(messages[previousMessageIndex]) &&
        !this.isVirtualServiceMessage(messages[previousMessageIndex].type)
      );
    };

    if (messages.length === 1 || checkForServiceMessage()) {
      messageList.splice(messageList.length - 1, 0, this.getDateSeparator(messages[messages.length - 1]));
    }

    return messageList;
  }

  private isVirtualServiceMessage(messageType: PeChatMessageType): boolean {
    return [PeChatMessageType.DateSeparator, PeChatMessageType.WelcomeMessage].includes(messageType);
  }

  public reloadVirtualMessages(
    originalMessageList: PeChatMessage[],
    targetMessageList: PeChatMessage[],
    checkOnlyLast?: boolean,
    pinnedList?: boolean,
  ): PeChatMessage[] {
    if (checkOnlyLast) {
      return this.checkOnlyLast(originalMessageList, targetMessageList);
    }

    const messageList = originalMessageList.filter(message => !this.isVirtualServiceMessage(message.type));
    const isNextMessageExisting = (index: number, list: PeChatMessage[]): boolean => index + 1 < list.length;
    const getDateOfNextMessage = (index: number, list: PeChatMessage[]): Date =>
      isNextMessageExisting(index, list) ? this.getMessageDate(list[index + 1]) : new Date();

    const list: PeChatMessage[] = [...messageList];

    list.forEach((message: PeChatMessage, index: number) => {
      index === 0 && messageList.unshift(this.getDateSeparator(message));
      const dateOfCurrentMassage = this.getMessageDate(message).getDate();
      const dateOfNextMassage = getDateOfNextMessage(index, list).getDate();
      const delta = messageList.length - list.length + index + 1;

      if (message.eventName === MessageChatEvents.ExcludeMember) {
        messageList[delta - 1].content = this.translateService
          .translate('message-app.invitation.notification.member_excluded_by')
          .replace(
            '{excludedUser}',
            message.data.excludedUser.userAccount.firstName + ' ' + message.data.excludedUser.userAccount.lastName,
          )
          .replace(
            '{excludedByUser}',
            message.data.excludedBy.userAccount.firstName + ' ' + message.data.excludedBy.userAccount.lastName,
          );
      }

      if (message.eventName === MessageChatEvents.LeaveMember){
        messageList[delta - 1].content = this.translateService
          .translate('message-app.invitation.notification.member_left_chat')
          .replace(
            '{leftUser}',
            message.data.leftUser.userAccount.firstName + ' ' + message.data.leftUser.userAccount.lastName,
          );
      }

      if (message.eventName === MessageChatEvents.IncludeMember) {
        if (message.data.withInvitationLink) {
          messageList[delta - 1].content = this.translateService
            .translate('message-app.invitation.notification.member_invited_by_link')
            .replace(
              '{includeUser}',
              message.data.includedUser.userAccount.firstName + ' ' + message.data.includedUser.userAccount.lastName,
            );
        }

        if (!message.data.withInvitationLink) {
          messageList[delta - 1].content = this.translateService
            .translate('message-app.invitation.notification.member_invited_by')
            .replace(
              '{includeUser}',
              message.data.includedUser.userAccount.firstName + ' ' + message.data.includedUser.userAccount.lastName,
            )
            .replace(
              '{includedByUser}',
              message.data.includedBy.userAccount.firstName + ' ' + message.data.includedBy.userAccount.lastName,
            );
        }
      }

      if (isNextMessageExisting(index, list) && dateOfCurrentMassage !== dateOfNextMassage) {
        const dateMessage = this.getDateSeparator(list[index + 1]);
        messageList.splice(delta, 0, dateMessage);
      }
    });

    return messageList;
  }
}
