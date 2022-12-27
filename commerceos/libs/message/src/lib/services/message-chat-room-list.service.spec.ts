import { TestBed, waitForAsync } from '@angular/core/testing';
import { PeMessageGuardService } from './message-guard.service';
import { PeMessageService } from './message.service';
import { MessageStateService } from './message-state.service';
import { PeMessageWebSocketService } from './message-web-socket.service';
import { PeMessageApiService } from './message-api.service';
import { ConversationFacade } from '../classes/conversation/conversation-facade';
import { ChatListFacade } from '../classes/chat-list/chat-list-facade';
import { PeMessageChannelMemberByCategory, PeMessageChannelRoles } from '../../../../shared/chat/src';

import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { MessageBus, PE_ENV } from '@pe/common';
import { ApmService } from '@elastic/apm-rum-angular';
import { PeAuthService } from '@pe/auth';
import { SnackbarService } from '@pe/snackbar';
import { TranslateService } from '@pe/i18n-core';

describe('PeMessageChatRoomListService', () => {
  let peMessageChatRoomListService: PeMessageChatRoomListService;

  beforeEach(
    waitForAsync(() => {
      const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
        translate: 'translated',
      });

      const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', ['emit']);

      TestBed.configureTestingModule({
        providers: [
          PeMessageChatRoomListService,
          { provide: ApmService, useValue: {} },
          { provide: MessageBus, useValue: messageBusSpy },
          {
            provide: PeAuthService,
            useValue: {
              getUserData: () => ({ uuid: '10101010' }),
            },
          },
          { provide: SnackbarService, useValue: {} },
          { provide: TranslateService, useValue: translateServiceSpy },
          { provide: ChatListFacade, useValue: {} },
          { provide: ConversationFacade, useValue: {} },
          { provide: PeMessageApiService, useValue: {} },
          { provide: PeMessageGuardService, useValue: {} },
          { provide: MessageStateService, useValue: {} },
          { provide: PeMessageService, useValue: {} },
          { provide: PeMessageWebSocketService, useValue: {} },
          { provide: PE_ENV, useValue: {} },
        ],
      });
      peMessageChatRoomListService = TestBed.inject(PeMessageChatRoomListService);
    }),
  );

  it('should be defined', () => {
    expect(peMessageChatRoomListService).toBeDefined();
  });

  it('should return who is online', () => {
    let userMock: PeMessageChannelMemberByCategory[] = [
      {
        _id: '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
        title: 'Test User',
        label: 'Test User',
        role: PeMessageChannelRoles.Admin,
        initials: 'TU',
        permissions: {
          addMembers: true,
          changeGroupInfo: true,
          pinMessages: true,
          sendMedia: true,
          sendMessages: true,
        },
      },
    ];
    peMessageChatRoomListService.onlineMembers = [
      {
        contact: null,
        contactId: null,
        user: '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
        userAccount: {
          email: 'artjoms.petrovs@payever.org',
          firstName: 'Test',
          lastName: 'User',
        },
        connectionId: '/chat#QuUp2k7qfvIez_diAAWx',
        lastActivity: '2022-10-11T12:00:32.516Z',
      },
      {
        contact: null,
        contactId: null,
        user: '567aad40-6e94-4595-be15-761b1a357c86',
        userAccount: {
          email: 'anothertestuser@payever.org',
          firstName: 'another',
          lastName: 'user',
        },
        connectionId: '/chat#aP_L2SkGBn960ARZAAWy',
        lastActivity: '2022-10-11T12:01:10.176Z',
      },
    ];
    let onlineMembersResult = peMessageChatRoomListService.getWhoIsOnline(userMock);

    expect(onlineMembersResult[0].isOnline).toEqual(true);
  });
});
