import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { PeAuthService } from '@pe/auth';
import { TranslateService } from '@pe/i18n-core';
import { MessageChatEvents, PeChatMessage, PeChatMessageStatus, PeChatMessageType } from '@pe/shared/chat';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';

import { PeMessageVirtualService } from './message-virtual.service';

describe('PeMessageVirtualService', () => {

  let api: PeMessageVirtualService;

  beforeEach(() => {

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        PeMessageVirtualService,
        {
          provide: PeAuthService, useValue: {
            getUserData: () => ({ uuid: '10101010' }),
          },
        },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeMessageChatRoomListService, useValue: {} },
      ],
    });

    api = TestBed.inject(PeMessageVirtualService);

  });

  it('should be defined', () => {

    expect(api).toBeDefined();

  });

  it('should be reload message', () => {
    const originalMessageList = [
      {
        '_id': '86a21911-e73a-4372-8573-fbef805aa426',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '112',
        'deletedForUsers': [],
        'editedAt': null,
        'readBy': [
          'd118f9d8-d528-4092-b076-7cc2bca3386f',
        ],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': new Date('2022-08-26T12:30:30.423Z'),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Text,
        'createdAt': new Date('2022-08-26T12:30:30.547Z'),
        'updatedAt': new Date('2022-08-26T12:30:30.547Z'),
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
      {
        '_id': 'e351a258-1617-4677-8dec-30159a0c8099',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '113',
        'deletedForUsers': [],
        'editedAt': null,
        'readBy': [
          'd118f9d8-d528-4092-b076-7cc2bca3386f',
        ],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': new Date('2022-08-26T12:31:24.526Z'),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Text,
        'createdAt': new Date('2022-08-27T12:31:24.639Z'),
        'updatedAt': new Date('2022-08-27T12:31:24.639Z'),
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
      {
        '_id': 'de6953fc-e8e4-470f-b5ae-e181f5e3b3c2',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '114',
        'deletedForUsers': [],
        'editedAt': null,
        'readBy': [
          'd118f9d8-d528-4092-b076-7cc2bca3386f',
        ],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': new Date('2022-08-26T12:31:32.504Z'),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Text,
        'createdAt': new Date('2022-08-28T12:31:32.620Z'),
        'updatedAt': new Date('2022-08-28T12:31:32.620Z'),
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
    ];
    const targetMessageList = [
      {
        '_id': '86a21911-e73a-4372-8573-fbef805aa426',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '112',
        'deletedForUsers': [],
        'editedAt': null,
        'readBy': [
          'd118f9d8-d528-4092-b076-7cc2bca3386f',
        ],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': new Date('2022-08-26T12:30:30.423Z'),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Text,
        'createdAt': new Date('2022-08-26T12:30:30.547Z'),
        'updatedAt': new Date('2022-08-26T12:30:30.547Z'),
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
      {
        '_id': 'e351a258-1617-4677-8dec-30159a0c8099',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '113',
        'deletedForUsers': [],
        'editedAt': null,
        'readBy': [
          'd118f9d8-d528-4092-b076-7cc2bca3386f',
        ],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': new Date('2022-08-26T12:31:24.526Z'),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Text,
        'createdAt': new Date('2022-08-27T12:31:24.639Z'),
        'updatedAt': new Date('2022-08-27T12:31:24.639Z'),
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
      {
        '_id': 'de6953fc-e8e4-470f-b5ae-e181f5e3b3c2',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '114',
        'deletedForUsers': [],
        'editedAt': null,
        'readBy': [
          'd118f9d8-d528-4092-b076-7cc2bca3386f',
        ],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': new Date('2022-08-26T12:31:32.504Z'),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Text,
        'createdAt': new Date('2022-08-28T12:31:32.620Z'),
        'updatedAt': new Date('2022-08-28T12:31:32.620Z'),
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
    ];
    expect(api.reloadVirtualMessages(originalMessageList, targetMessageList)).toContain({
      content: '26.8.2022',
      type: PeChatMessageType.DateSeparator,
    });
  });

  it('should return translated message when event name is exclude-member or include-member', () => {
    let originalMessageList: PeChatMessage[] = [
      {
        '_id': '495eeff4-e4ac-4276-90dd-616027dc42fc',
        'chat': '8ed91810-4f2c-41f9-a2c3-a42b458268df',
        'createdAt': new Date(),
        'data': {
          'includedById': '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
          'includedUserId': '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
          'withInvitationLink': true,
          'includedBy': {
            'contact': null,
            'contactId': null,
            'user': null,
            'userAccount': {
              'email': 'test@test.com',
              'firstName': 'Test',
              'lastName': 'User',
            },
          },
          'includedUser': {
            'contact': null,
            'contactId': null,
            'user': '567aad40-6e94-4595-be15-761b1a357c86',
            'userAccount': {
              'email': 'anothertestuser@payever.org',
              'firstName': 'another',
              'lastName': 'user',
            },
          },
        },
        'editedAt': null,
        'eventName': MessageChatEvents.IncludeMember,
        'readBy': [
          '2673fa45-82b9-484c-bcbe-46da250c2639',
        ],
        'sender': '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
        'sentAt': new Date(),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Event,
        'updatedAt': new Date(),
        'content': '',
        'reply': false,
        'name': 'Test User',
      },
      {
        '_id': 'd47468cd-ead5-4dea-9ba9-0181310a88f3',
        'chat': '8ed91810-4f2c-41f9-a2c3-a42b458268df',
        'createdAt': new Date(),
        'data': {
          'excludedById': '2673fa45-82b9-484c-bcbe-46da250c2639',
          'excludedUserId': '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
          'excludedBy': {
            'contact': null,
            'contactId': null,
            'user': null,
            'userAccount': {
              'email': 'test@test.com',
              'firstName': 'Test',
              'lastName': 'User',
            },
          },
          'excludedUser': {
            'contact': null,
            'contactId': null,
            'user': null,
            'userAccount': {
              'email': 'test@test.com',
              'firstName': 'Test',
              'lastName': 'User',
            },
          },
        },
        'editedAt': null,
        'eventName': MessageChatEvents.ExcludeMember,
        'readBy': [
          '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
        ],
        'sender': '2673fa45-82b9-484c-bcbe-46da250c2639',
        'sentAt': new Date(),
        'status': PeChatMessageStatus.READ,
        'type': PeChatMessageType.Event,
        'updatedAt': new Date(),
        'avatar': '3bcb27d0-12a1-4ce9-9030-0cef509e0fd5-Screenshot from 2021-12-17 13-45-36.png',
        'content': '',
        'reply': true,
        'name': 'Jack Daniels',
      },
    ];
    let targetMessageList = [];

    let messageList = api.reloadVirtualMessages(originalMessageList, targetMessageList);
    expect(messageList[1].content).toEqual('translated');
  });
});
