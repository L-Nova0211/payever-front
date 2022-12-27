import { TestBed, waitForAsync } from '@angular/core/testing';

import { PeAuthService } from '@pe/auth';
import { of, Subject } from 'rxjs';
import {
  PeChatMessage,
  PeChatMessageStatus,
  PeChatMessageType,
  PeMessageUserStatus,
} from '../../../../shared/chat/src';

import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageChatRoomService } from './message-chat-room.service';
import { PeMessageManagementService } from './message-management.service';
import { PeMessageThemeService } from './message-theme.service';
import { PeMessageVirtualService } from './message-virtual.service';
import { PeMessageWebSocketService } from './message-web-socket.service';
import { PeMessageService } from './message.service';

describe('PeMessageManagementService', () => {
  let peMessageManagementService: PeMessageManagementService;
  let peMessageApiService: PeMessageApiService;
  let peMessageChatRoomListService: PeMessageChatRoomListService;
  let peMessageVirtualService: PeMessageVirtualService;
  let peMessageThemeService: PeMessageThemeService;
  let peMessageWebSocketService: PeMessageWebSocketService;
  let peMessageChatRoomService: PeMessageChatRoomService;
  let peMessageService: PeMessageService;
  let peAuthService: PeAuthService;

  beforeEach(
    waitForAsync(() => {
      const peMessageWebSocketServiceMock = {
        deleteMessage: jasmine.createSpy(),
        markReadMessage: jasmine.createSpy(),
      };

      const peMessageChatRoomServiceSpy = jasmine.createSpyObj<PeMessageChatRoomService>(
        'PeMessageChatRoomService',
        {},
        {
          noMessagesPlaceholder: '',
        },
      );

      const peMessageThemeServiceSpy = jasmine.createSpyObj<PeMessageThemeService>('PeMessageThemeService', {
        setMessageTheme: '' as any,
      });

      const peMessageVirtualServiceSpy = jasmine.createSpyObj<PeMessageVirtualService>('PeMessageVirtualService', {
        reloadVirtualMessages: [],
      });

      const peMessageServiceMock = {
        isLiveChat: false,
        isEmbedChat: false,
        app: 'test-app',
        activeUser: {
          _id: '1',
          businesses: [],
          roles: [],
          sessions: [],
          status: PeMessageUserStatus.Online,
          userAccount: [] as any,
        },
      };

      const peMessageChatRoomListServiceSpy = jasmine.createSpyObj<PeMessageChatRoomListService>(
        'PeMessageChatRoomListService',
        {
          getConversationList: of([]),
          activeChat: of([]),
          chatList: of([]),
          detectChangeStream$: new Subject(),
        },
      );

      const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', {
        deleteChatMessage: of({} as any),
      });

      const peAuthServiceSpy = jasmine.createSpyObj<PeAuthService>('PeAuthService', {
        getUserData: {
          uuid: '1',
          first_name: '',
          last_name: '',
          email: '',
          roles: '',
        },
      });

      TestBed.configureTestingModule({
        providers: [
          PeMessageManagementService,
          { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
          { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceSpy },
          { provide: PeMessageVirtualService, useValue: peMessageVirtualServiceSpy },
          { provide: PeMessageThemeService, useValue: peMessageThemeServiceSpy },
          { provide: PeMessageWebSocketService, useValue: peMessageWebSocketServiceMock },
          { provide: PeMessageChatRoomService, useValue: peMessageChatRoomServiceSpy },
          { provide: PeMessageService, useValue: peMessageServiceMock },
          { provide: PeAuthService, useValue: peAuthServiceSpy },
        ],
      });
      peMessageManagementService = TestBed.inject(PeMessageManagementService);
      peMessageApiService = TestBed.inject(PeMessageApiService);
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService);
      peMessageVirtualService = TestBed.inject(PeMessageVirtualService);
      peMessageThemeService = TestBed.inject(PeMessageThemeService);
      peMessageWebSocketService = TestBed.inject(PeMessageWebSocketService);
      peMessageChatRoomService = TestBed.inject(PeMessageChatRoomService);
      peMessageService = TestBed.inject(PeMessageService);
      peAuthService = TestBed.inject(PeAuthService);
    }),
  );

  const chatMessageText: PeChatMessage = {
    _id: 'b095a56c-3be3-4ff1-a4d4-4946d3ed705b',
    readBy: ['2673fa45-82b9-484c-bcbe-46da250c2639', '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f'],
    sender: '1ed3a25f-4510-4088-8924-9ff9d8d217c4',
    status: PeChatMessageStatus.READ,
    type: PeChatMessageType.Text,
  };

  const chatMessageDateSeparator: PeChatMessage = {
    _id: 'b095a56c-3be3-4ff1-a4d4-4946d3ed705b',
    readBy: ['2673fa45-82b9-484c-bcbe-46da250c2639', '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f'],
    sender: '1ed3a25f-4510-4088-8924-9ff9d8d217c4',
    status: PeChatMessageStatus.READ,
    type: PeChatMessageType.DateSeparator,
  };

  it('should be defined', () => {
    expect(peMessageManagementService).toBeDefined();
  });

  it('should delete message from message list', () => {
    let messageList = [
      {
        content: '4.10.2022',
        type: 'date-seperator',
      },
      {
        _id: '30f58b78-ea1a-4bc4-a921-8e230924d0ee',
        attachments: [],
        chat: 'e0226071-a6f3-47de-acd0-42d9ed7a94bf',
        content: '1',
        deletedForUsers: [],
        editedAt: null,
        mentions: [],
        readBy: [],
        sender: 'bbb167bd-4272-4801-903a-1d759cd85244',
        sentAt: '2022-10-04T13:24:15.816Z',
        status: 'sent',
        type: 'text',
        createdAt: '2022-10-04T13:24:16.398Z',
        updatedAt: '2022-10-04T13:24:16.398Z',
        chatMemberUsernames: ['konstantine datunishvili'],
        reply: true,
        name: 'konstantine datunishvili',
        selected: false,
      },
      {
        _id: '8d91c187-6e6b-45c8-a803-ddd4627d4724',
        attachments: [],
        chat: 'e0226071-a6f3-47de-acd0-42d9ed7a94bf',
        content: '3',
        deletedForUsers: [],
        editedAt: null,
        mentions: [],
        readBy: [],
        sender: 'bbb167bd-4272-4801-903a-1d759cd85244',
        sentAt: '2022-10-04T13:24:17.063Z',
        status: 'sent',
        type: 'text',
        createdAt: '2022-10-04T13:24:17.666Z',
        updatedAt: '2022-10-04T13:24:17.666Z',
        chatMemberUsernames: ['konstantine datunishvili'],
        reply: true,
        name: 'konstantine datunishvili',
        selected: false,
      },
    ];
    let length = messageList.length;
    const messages = [
      {
        _id: '30f58b78-ea1a-4bc4-a921-8e230924d0ee',
        attachments: [],
        chat: 'e0226071-a6f3-47de-acd0-42d9ed7a94bf',
        content: '1',
        deletedForUsers: [],
        editedAt: null,
        mentions: [],
        readBy: [],
        sender: 'bbb167bd-4272-4801-903a-1d759cd85244',
        sentAt: '2022-10-04T13:24:15.816Z',
        status: 'sent',
        type: 'text',
        createdAt: '2022-10-04T13:24:16.398Z',
        updatedAt: '2022-10-04T13:24:16.398Z',
      },
    ];
    const message = {
      _id: '6b639bb0-784c-4035-ba0f-c88f6b1d2cbd',
      attachments: [],
      chat: 'e0226071-a6f3-47de-acd0-42d9ed7a94bf',
      content: '4',
      deletedForUsers: [],
      editedAt: null,
      mentions: [],
      readBy: [],
      sender: 'bbb167bd-4272-4801-903a-1d759cd85244',
      sentAt: '2022-10-04T14:50:54.970Z',
      status: 'sent',
      type: 'text',
      createdAt: '2022-10-04T14:50:55.513Z',
      updatedAt: '2022-10-04T14:50:55.513Z',
      chatMemberUsernames: ['konstantine datunishvili'],
      reply: true,
      name: 'konstantine datunishvili',
    };
    messages?.splice(
      messages?.findIndex(m => m._id === message._id),
      1,
    );
    messageList.splice(
      messageList.findIndex(m => m._id === message._id),
      1,
    );
    messageList = messageList.filter(m => m.type !== PeChatMessageType.DateSeparator);
    expect(length > messageList.length).toBeTrue();
  });


  it('message read status should be true when sender equals current user', () => {
    let isMessageRead = peMessageManagementService.isMessageRead(
      chatMessageText,
      '1ed3a25f-4510-4088-8924-9ff9d8d217c4',
    );

    expect(isMessageRead).toBeTrue();
  });

  it('message read status should be false when sender not equal to current user', () => {
    let isMessageRead = peMessageManagementService.isMessageRead(
      chatMessageText,
      '00000000-0000-0000-0000-000000000000',
    );

    expect(isMessageRead).toBeFalse();
  });

  it('message read status should be true when readBy includes current user and status is READ', () => {
    let isMessageRead = peMessageManagementService.isMessageRead(
      chatMessageText,
      '2673fa45-82b9-484c-bcbe-46da250c2639',
    );

    expect(isMessageRead).toBeTrue();
  });

  it('message read status should be true when message type is WelcomeMessage or DateSeparator or Box', () => {
    let isMessageRead = peMessageManagementService.isMessageRead(
      chatMessageDateSeparator,
      '2673fa45-82b9-484c-bcbe-46da250c2639',
    );

    expect(isMessageRead).toBeTrue();
  });

  describe('updateMessage', () => {
    it('should call reloadVirtualMessages', () => {
      peMessageManagementService.messageList = [chatMessageText];
      peMessageManagementService.updateMessage(chatMessageText);
      expect(peMessageVirtualService.reloadVirtualMessages).toHaveBeenCalled();
    });
  });
});
