import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash';
import { take } from 'rxjs/operators';

import {
  PeChatMessage,
  PeChatMessageStatus,
  PeChatMessageType,
  PeMessageChannelRoles,
  PeMessageChat,
  PeMessageChatNormalized,
} from '@pe/shared/chat';

import { PeLiveChatEnum, PeMessageWebsocketType } from '../enums';

import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageChatRoomService } from './message-chat-room.service';
import { PeMessageThemeService } from './message-theme.service';
import { PeMessageVirtualService } from './message-virtual.service';
import { PeMessageWebSocketService } from './message-web-socket.service';
import { PeMessageService } from './message.service';

@Injectable()
export class PeMessageManagementService {
  messageTitle?: string;
  messageList: PeChatMessage[] = [];

  constructor(
    private peMessageService: PeMessageService,
    private peMessageVirtualService: PeMessageVirtualService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private peMessageApiService: PeMessageApiService,
    private peMessageThemeService: PeMessageThemeService,
    private peMessageWebSocketService: PeMessageWebSocketService,
    private peMessageChatRoomService: PeMessageChatRoomService,
  ) {}

  private get currentUserId(): string {
    return this.peMessageService.getUserData().uuid;
  }

  public isMessageRead(message: PeChatMessage, user: string | { _id: string } = this.currentUserId) {
    const { readBy, sender, status, type } = message;
    const currentMemberId = typeof user === 'string' ? user : user?._id;

    return (
      sender === currentMemberId
      || (readBy && readBy.includes(currentMemberId) && status === PeChatMessageStatus.READ)
      || [PeChatMessageType.WelcomeMessage, PeChatMessageType.DateSeparator, PeChatMessageType.Box].includes(type)
    );
  }

  private getChatMemberUsernames(): string[] {
      const usernames = this.peMessageChatRoomListService.activeChat.membersInfo?.map(
        (member: { user: { userAccount: { firstName: string; lastName: string } } }) =>
          member.user.userAccount.firstName + ' ' + member.user.userAccount.lastName
      );

      return usernames ? usernames : [];
  }

  public messageTransform(message: PeChatMessage): any {
    const { activeChat } = this.peMessageChatRoomListService;
    const userUserList = this.peMessageService.userList?.find(u => u?._id === message?.sender)?.userAccount;
    const userActiveChat = activeChat?.membersInfo?.find(u => u?.user?._id === message?.sender)?.user?.userAccount;
    const userContact = this.peMessageService.contactList?.find(c => c?._id === message?.sender);
    const user = userUserList || userActiveChat;

    message.type = message.attachments?.length > 0 ? PeChatMessageType.Attachment : message.type;

    message.avatar = user?.logo;
    message.chatMemberUsernames = this.getChatMemberUsernames();
    message.content = message.content === '{#empty#}' ? '' : message.content;
    message.reply = message.sender === this.peMessageService.activeUser?._id;

    const repliedMessage = (activeChat.messages ?? activeChat.messages)?.find(aCM => aCM._id === message.replyTo);
    if (repliedMessage) {
      message.replyData = this.messageTransform(repliedMessage);
    }

    if (this.peMessageService.isLiveChat || this.peMessageChatRoomListService.activeChat.markConversation) {
      const title = this.peMessageChatRoomListService.chatList.find(chat => chat._id === message.chat)?.title;
      message.name = message.reply
        ? PeLiveChatEnum.Visitor
        : new RegExp(`\\/live-chat|${PeLiveChatEnum.LiveChat}`).test(title)
          ? PeLiveChatEnum.Merchant
          : title;
      message.avatar = this.peMessageChatRoomListService.activeChat.avatar;
    } else {
      message.name =
        user?.firstName || user?.lastName
          ? `${user?.firstName + ' '}${user?.lastName}`
          : /\/live-chat/.test(userContact?.name)
            ? PeLiveChatEnum.Visitor
            : userContact?.name;
    }

    if (!user && !userContact) {
      message.name = this.messageTitle || this.peMessageChatRoomListService.activeChat?.title;
    }

    if (message.type === 'box' && message.interactive?.action) {
      message.content = message.interactive.translations[message.interactive.defaultLanguage] ?? message.content;
    }

    this.peMessageThemeService.setMessageTheme(message);

    return message;
  }

  private dateSeparator(date: Date) {
    return {
      content: `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`,
      type: PeChatMessageType.DateSeparator,
    };
  };

  memberHasRight(activeChat, permission = 'sendMessages') {
    const member = activeChat?.membersInfo?.find(
      (member: any) => member?.user?._id === this.peMessageService?.activeUser?._id,
    );

    return member?.role === PeMessageChannelRoles.Admin || member?.permissions?.[permission];
  }

  pushMessage(message: PeChatMessage) {
    this.messageList.push(this.messageTransform(message));
    this.messageList = this.peMessageVirtualService.reloadVirtualMessages(this.messageList, this.messageList, true);
  }

  public createLoadingMessage(file: File): void {
    this.messageList.push(
      this.messageTransform({
        loadingHash: this.hashCode(`${file.type}${file.size}`),
        attachments: [],
        type: PeChatMessageType.Attachment,
        chat: '',
        content: '',
        sender: this.peMessageService.activeUser?._id,
        sentAt: new Date(),
      } as PeChatMessage),
    );
    this.messageList = this.peMessageVirtualService.reloadVirtualMessages(this.messageList, this.messageList, true);
  }

  public getNonLoadingMessage(message: PeChatMessage) {
    if (message.attachments?.length > 0) {
      const hash = this.hashCode(`${message.attachments[0].mimeType}${message.attachments[0].size}`);
      this.messageList = this.messageList.filter(item => item.loadingHash !== hash);
    }
  }

  public updateMessage(message: PeChatMessage): void {
    let index = this.messageList.findIndex(m => m._id === message._id);
    if (index < 0) {
      return;
    }

    const { deletedForUsers } = message;

    if (deletedForUsers && deletedForUsers.some(id => id === this.peMessageService.getUserData().uuid)) {
      this.deleteMessageFromList(this.peMessageChatRoomListService.activeChat, message);
    } else {
      this.messageList.splice(index, 1, this.messageTransform({ ...message }));
      this.messageList = this.peMessageVirtualService.reloadVirtualMessages(this.messageList, this.messageList, false);
    }
  }

  public handleDeleteMessage(message: PeChatMessage) {
    if (this.messageList.find(LMessage => LMessage._id === message._id)) {
      this.deleteMessage(this.peMessageChatRoomListService.activeChat, message, true);
    }
  }

  public deleteMessage(chat: PeMessageChat, message: PeChatMessage, deleteForEveryone: boolean): void {
    this.peMessageWebSocketService.deleteMessage(
      chat.websocketType ?? PeMessageWebsocketType.Regular,
      { _id: message._id, deleteForEveryone: deleteForEveryone },
    );

    this.deleteMessageFromList(chat , message);
  }

  private deleteMessageFromList(chat: PeMessageChat, message: PeChatMessage) {
    chat?.messages?.splice(
      chat?.messages?.findIndex(m => m._id === message._id),
      1,
    );
    this.peMessageChatRoomListService.detectChangeStream$.next();

    this.messageList.splice(
      this.messageList.findIndex(m => m._id === message._id),
      1,
    );

    this.messageList = this.messageList.filter(m => m.type !== PeChatMessageType.DateSeparator);
    this.messageList = this.peMessageVirtualService.reloadVirtualMessages([...this.messageList], this.messageList);
  }

  clearSelectedMessages() {
    this.messageList.forEach(item => (item.selected = false));
  }

  hashCode(s) {
    return s.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);

      return a&a;
    },0);
  }

  deleteBox(message: PeChatMessage): void {
    const index = this.messageList.findIndex(m => m._id === message._id);

    this.messageList.splice(index, 1);

    this.peMessageApiService.deleteChatMessage(message.chat, message._id).pipe(take(1)).subscribe();
  }

  handleActiveMessage(res: PeMessageChatNormalized) {
    this.messageTitle = res.messageTitle;

    this.messageList = res.messages.reduce((unique, message) => {
      const msg = this.messageTransform(message);
      const activeChat = this.peMessageChatRoomListService.activeChat;
      const userHaspermission = message.type === PeChatMessageType.Box ? this.isAdmin(activeChat) : true;

      return userHaspermission && !unique.some(m => m._id === msg._id) ? [...unique, msg] : unique;
    }, []);

    this.messageList = this.peMessageVirtualService.reloadVirtualMessages(this.messageList, this.messageList, false);
    this.peMessageChatRoomService.noMessagesPlaceholder = res.noMessagesPlaceholder;
    this.peMessageChatRoomListService.detectChangeStream$.next();
  }

  public updateMessageStatus(message: PeChatMessage): void {
    const foundChat = this.peMessageChatRoomListService.chatList.find(c => c._id === message.chat);
    const messages = cloneDeep(foundChat?.messages);
    const foundMessage = messages?.find(m => m._id === message._id);
    if (foundMessage) {
      foundMessage.status = PeChatMessageStatus.READ;
    }

    foundChat.messages = messages;

    this.peMessageWebSocketService.markReadMessage(
      this.peMessageChatRoomListService.activeChat?.websocketType ?? PeMessageWebsocketType.Regular,
      message._id,
    );
    this.peMessageChatRoomListService.detectChangeStream$.next();
  }

  isAdmin(activeChat) {
    const member = activeChat.membersInfo?.find(
      (member: any) => member.user._id === this.peMessageService.activeUser?._id,
    );

    return member?.role === PeMessageChannelRoles.Admin;
  }
}
