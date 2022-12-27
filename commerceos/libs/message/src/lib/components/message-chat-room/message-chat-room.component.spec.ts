import { Clipboard } from '@angular/cdk/clipboard';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ApiService } from '@pe/api';
import { PeAuthService } from '@pe/auth';
import { PebEnvService } from '@pe/builder-core';
import { ChatScrollService } from '@pe/chat';
import { APP_TYPE, AppType, PE_ENV, PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { LocaleConstantsService, TranslateService } from '@pe/i18n';
import { MediaService } from '@pe/media';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeChatMessage, PeMessageChat } from '@pe/shared/chat';

import { BehaviorSubject, EMPTY, of, Subject } from 'rxjs';

import { ConversationFacade } from '../../classes';
import {
  PeMessageApiService,
  PeMessageAppsService,
  PeMessageChatBoxService,
  PeMessageChatContextMenuService,
  PeMessageChatRoomListService,
  PeMessageChatRoomService,
  PeMessageConversationService,
  PeMessageFileUploadService,
  PeMessageGuardService,
  PeMessageIntegrationService,
  PeMessageLiveChatService,
  PeMessageManagementService,
  PeMessagePinService,
  PeMessageService,
  PeMessageThemeService,
  PeMessageVirtualService,
  PeMessageWebSocketService,
} from '../../services';
import { PeMessageChatRoomComponent } from './message-chat-room.component';

describe('PeMessageChatRoomComponent', () => {
  let fixture: ComponentFixture<PeMessageChatRoomComponent>;
  let component: PeMessageChatRoomComponent;

  let peMessageManagementServiceSpy: jasmine.SpyObj<PeMessageManagementService>;
  let chatScrollServiceMock: jasmine.SpyObj<ChatScrollService>;

  const activeChatMock = {
    _id: '56fb8a80-a484-45e4-8d4e-865f1506efdf',
    onlineMembersCount : 10,
    title:''
  }
  const chatOnlineCounts = [activeChatMock]
  const mockModalResponse = of(true)
  beforeEach(waitForAsync(() => {

    spyOnProperty(PeMessageChatRoomComponent.prototype, 'loading').and.returnValue({});

      const envMock = {
        custom: {
          storage: 'c-storage',
        },
      };

      const apiServiceSpy = jasmine.createSpyObj<ApiService>('ApiService', {
        getUserAccount: of(null),
      });

      const clipboardSpy = jasmine.createSpyObj<Clipboard>('Clipboard', ['copy']);

      const localeConstantsServiceSpy = jasmine.createSpyObj<LocaleConstantsService>('LocaleConstantsService', {
        getLang: 'en',
      });

      const routerSpy = jasmine.createSpyObj<Router>('Router', {
        navigate: Promise.resolve(true),
      });

      const storeSpy = jasmine.createSpyObj<Store>('Store', ['dispatch']);

     const confirmScreenServiceSpy = jasmine.createSpyObj<ConfirmScreenService>('ConfirmScreenService', {
       show: mockModalResponse
     });

      const mediaServiceSpy = jasmine.createSpyObj<MediaService>('MediaService', {
        getMediaUrl: 'mocked/media/url',
      });

      const peAuthServiceSpy = jasmine.createSpyObj<PeAuthService>('PeAuthService', {
        getUserData: { uuid: 'user-001' } as any,
      });

      const envServiceMock = { channelId: null };

      const peMessagePinServiceSpy = jasmine.createSpyObj<PeMessagePinService>('PeMessagePinService', [
        'updatePinnedMessages',
        'pinMessage',
        'unpinMessage',
      ]);
      peMessagePinServiceSpy.pinnedMessages = [];

      const peOverlayWidgetServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
        'open',
        'close',
      ]);

      const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
        translate: 'translated',
      });

    peMessageManagementServiceSpy = jasmine.createSpyObj<PeMessageManagementService>('PeMessageManagementService', [
      'pushMessage',
      'messageTransform',
      'getNonLoadingMessage',
      'updateMessage',
      'handleDeleteMessage',
      'clearSelectedMessages',
      'deleteMessage',
      'handleActiveMessage',
    ]);
    peMessageManagementServiceSpy.messageTitle = 'message.title';
    peMessageManagementServiceSpy.messageList = [];

      const conversationFacadeSpy = jasmine.createSpyObj<ConversationFacade>('ConversationFacade', {
        normalizeActiveChat: EMPTY,
      });

      const peContextMenuServiceSpy = jasmine.createSpyObj<PeMessageChatContextMenuService>(
        'PeMessageChatContextMenuService',
        ['open'],
      );

      const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService', [
        'allPinnedMessages',
        'postMedia',
        'postChatMessageMarked',
      ]);

      const peMessageAppsServiceSpy = jasmine.createSpyObj<PeMessageAppsService>('PeMessageAppsService', [
        'appsMenuItem',
      ]);

      const peMessageChatBoxServiceSpy = jasmine.createSpyObj<PeMessageChatBoxService>('PeMessageChatBoxService', [
        'smallBoxUrls',
        'linkNormalise',
      ]);

      const peMessageChatRoomListServiceSpy = jasmine.createSpyObj<PeMessageChatRoomListService>(
        'PeMessageChatRoomListService',
        ['hasPermission', 'deleteChat', 'postDraftMessage', 'deleteDraftMessage', 'getMember', 'handleOnlineMessage'],
        {
          activeChat$: of(activeChatMock as PeMessageChat),
          chatOnlineCounts: [activeChatMock],
          unreadInFolder$: of(3),
          initAddingMembersInfoToConversation$: of(null),
          detectChangeStream$: new Subject(),
          chatList: [],
        },
      );

      peMessageChatRoomListServiceSpy.handleOnlineMessage.and.returnValue(
        of({
          _id: '56fb8a80-a484-45e4-8d4e-865f1506efdf',
          onlineMembersCount: 10,
          title: '',
        }),
      );

      const peMessageChatRoomServiceSpy = jasmine.createSpyObj<PeMessageChatRoomService>('PeMessageChatRoomService', [
        'getOldMessages',
        'sendMessage',
      ]);

      const peMessageConversationServiceSpy = jasmine.createSpyObj<PeMessageConversationService>(
        'PeMessageConversationService',
        [
          'rememberCurrentConversation',
          'forgetCurrentConversation',
          'draftUpdateChange',
          'conversationToGridItemMapper',
        ],
        {
          isLoading$: new BehaviorSubject(false),
          conversationList$: new BehaviorSubject([]),
          setConversationAsActiveById$: new Subject(),
        },
      );

      const peMessageGuardServiceSpy = jasmine.createSpyObj<PeMessageGuardService>('PeMessageGuardService', [
        'isAllowByRoles',
      ]);

      const peMessageIntegrationServiceMock = {
        currSettings$: of({}),
      };

      const peMessageLiveChatServiceSpy = jasmine.createSpyObj<PeMessageLiveChatService>('PeMessageLiveChatService', [
        'initLiveChat',
      ]);

      const peMessageWebSocketServiceSpy = jasmine.createSpyObj<PeMessageWebSocketService>(
        'PeMessageWebSocketService',
        [
          'handleSubjectObservable',
          'typingMessage',
          'typingStoppedMessage',
          'updateMessage',
          'forwardMessage',
          'leaveChat',
        ],
      );
      peMessageWebSocketServiceSpy.handleSubjectObservable.and.returnValue(EMPTY);

      chatScrollServiceMock = jasmine.createSpyObj<ChatScrollService>(
        'ChatScrollService',
        {},
        {
          scrollChange$: new Subject<void>(),
          scrollToMessage$: new Subject<PeChatMessage>(),
        },
      );

      const peMessageFileUploadServiceSpy = jasmine.createSpyObj<PeMessageFileUploadService>(
        'PeMessageFileUploadService',
        ['attachFileUpload'],
      );

      const peMessageThemeServiceSpy = jasmine.createSpyObj<PeMessageThemeService>('PeMessageThemeService', [
        'setColors',
        'setMessageTheme',
        'messageAccentColor',
      ]);
      peMessageThemeServiceSpy.colors = {
        message: ['', ''],
        bgChat: '',
        accent: '',
        app: '',
      };

      const peMessageVirtualServiceSpy = jasmine.createSpyObj<PeMessageVirtualService>('PeMessageVirtualService', [
        'reloadVirtualMessages',
      ]);

      TestBed.configureTestingModule({
        declarations: [PeMessageChatRoomComponent],
        providers: [
          { provide: PE_ENV, useValue: envMock },
          { provide: ApiService, useValue: apiServiceSpy },
          { provide: Clipboard, useValue: clipboardSpy },
          { provide: LocaleConstantsService, useValue: localeConstantsServiceSpy },
          { provide: ActivatedRoute, useValue: null },
          { provide: Router, useValue: routerSpy },
          { provide: Store, useValue: storeSpy },
          { provide: APP_TYPE, useValue: AppType.Connect },
          { provide: ConfirmScreenService, useValue: confirmScreenServiceSpy },
          { provide: MediaService, useValue: mediaServiceSpy },
          { provide: PeAuthService, useValue: peAuthServiceSpy },
          { provide: PebEnvService, useValue: envServiceMock },
          { provide: PeMessagePinService, useValue: peMessagePinServiceSpy },
          { provide: PeOverlayWidgetService, useValue: peOverlayWidgetServiceSpy },
          { provide: TranslateService, useValue: translateServiceSpy },
          { provide: PeMessageManagementService, useValue: peMessageManagementServiceSpy },
          { provide: PeDestroyService, useValue: new Subject() },
          { provide: ConversationFacade, useValue: conversationFacadeSpy },
          { provide: PeMessageChatContextMenuService, useValue: peContextMenuServiceSpy },
          { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
          { provide: PeMessageAppsService, useValue: peMessageAppsServiceSpy },
          { provide: PeMessageChatBoxService, useValue: peMessageChatBoxServiceSpy },
          { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceSpy },
          { provide: PeMessageChatRoomService, useValue: peMessageChatRoomServiceSpy },
          { provide: PeMessageConversationService, useValue: peMessageConversationServiceSpy },
          { provide: PeMessageGuardService, useValue: peMessageGuardServiceSpy },
          { provide: PeMessageIntegrationService, useValue: peMessageIntegrationServiceMock },
          { provide: PeMessageLiveChatService, useValue: peMessageLiveChatServiceSpy },
          { provide: PeMessageWebSocketService, useValue: peMessageWebSocketServiceSpy },
          { provide: ChatScrollService, useValue: chatScrollServiceMock },
          { provide: PeMessageService, useValue: {} },
          { provide: PeMessageFileUploadService, useValue: peMessageFileUploadServiceSpy },
          { provide: PeMessageThemeService, useValue: peMessageThemeServiceSpy },
          { provide: PeMessageVirtualService, useValue: peMessageVirtualServiceSpy },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .overrideComponent(PeMessageChatRoomComponent, {
          set: { providers: [] },
        })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeMessageChatRoomComponent);
          component = fixture.componentInstance;

          fixture.detectChanges();
        });
    }),
  );

  it('Should be defined', () => {
    expect(component).toBeDefined();
  });

  describe('showRepliedMessage', () => {
    it('should call scrollToMessage$.next()', () => {
      const nextSpy = spyOn(chatScrollServiceMock.scrollToMessage$, 'next');
      component.showRepliedMessage({} as any);
      expect(nextSpy).toHaveBeenCalled();
    });
  });

  it('should show confirmation dialog', function (done) {
    component.unpinAllMessages()
    fixture.detectChanges()
    mockModalResponse.subscribe((res) => {
      expect(res).toBe(true)
    })
    done()
  });

  it('should not return back to chat after unpin message', function () {
      mockModalResponse.subscribe((res) => {
        component.chatModeToggle()
        fixture.detectChanges()
        expect(component.chatMode).toBe(false)
      })
  });
});
