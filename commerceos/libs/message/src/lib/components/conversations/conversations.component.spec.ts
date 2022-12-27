import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { By, DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PebEnvService } from '@pe/builder-core';
import { PeMessageConversationActionsEnum } from '../../enums/conversation-action.enum';
import { BehaviorSubject, of, Subject } from 'rxjs';

import { PeDestroyService, PeGridItem, PeGridItemType, PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeChatMemberService, PeMessageChat, PeMessageChatType } from '@pe/shared/chat';
import { PeMessageConversationsComponent } from './conversations.component';
import { ActivatedRoute, Router } from '@angular/router';
import { Store } from '@ngxs/store';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { PePlatformHeaderService } from '@pe/platform-header';
import { SnackbarService } from '@pe/snackbar';
import { PeAuthService } from '@pe/auth';
import { MessageStateService } from '../../services/message-state.service';
import {
  PeMessageApiService,
} from '../../services/message-api.service';
import { PeMessageChatRoomListService } from '../../services/message-chat-room-list.service';
import { PeMessageConversationService } from '../../services/conversation.service';
import { PeMessageGuardService } from '../../services/message-guard.service';
import { PeMessageInvitationApiService } from '../../services/message-invitation-api.service';
import { PeMessageNavService } from '../../services/message-nav.service';
import { PeMessageService } from '../../services/message.service';
import { PeMessageWebSocketService } from '../../services/message-web-socket.service';
import { PeMessageManagementService } from '../../services';

describe('PeMessageConversationsComponent', () => {

  let fixture: ComponentFixture<PeMessageConversationsComponent>;
  let component: PeMessageConversationsComponent;
  let peOverlayWidgetService: {
    isOpenOverlay$: Subject<void>,
  };

  let setConversationAsActiveById$ = new Subject<string>();
  let chatCreated$ = new Subject();
  let activeConversation$ = new Subject();

  let peMessageApiService: jasmine.SpyObj<PeMessageApiService>;

  let peMessageManagementService: jasmine.SpyObj<PeMessageManagementService>;

  const peMessageWebSocketServiceSpy = {
    handleSubjectObservable: () => chatCreated$,
    chatRoomJoin: (webSocketType, chatId) => { },
  };

  const pePlatformHeaderServiceSpy = { assignSidenavItem: () => { } };

  const peMessageConversationServiceSpy = {
    setConversationAsActiveById$,
    activeConversation$,
    rememberCurrentConversation: (id: string) => null,
    conversationToGridItemMapper: item => item,
  };

  const peMessageChatRoomListServiceSpy = {
    activeChat$: new BehaviorSubject({}),
    activeChat: {},
    detectChangeStream$: new Subject(),
    getContactAvatar: (item) => '',
    getContactInitials: (item) => '',
    getTitle: (item) => '',
    chatList: [],
  };

  const peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>
    ('PeMessageApiService', {
      getFolderTree: of([]),
    });

  beforeEach(waitForAsync(() => {

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustStyle: 'style.passed',
    });

    const routeMock = {
      snapshot: {
        queryParams: '101010',
      },
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });


    const storeSpy = jasmine.createSpyObj<Store>('Store', {
      select: of(null),
      dispatch: of(null),
    });

    peOverlayWidgetService = jasmine.createSpyObj<any>
      ('PeOverlayWidgetService', ['open'], {
        isOpenOverlay$: new Subject(),
      });

    const chatMemberServiceSpy = jasmine.createSpyObj<PeChatMemberService>
      ('PeChatMemberService', ['mapMemberToChat']);


    const peMessageManagementServiceSpy = jasmine.createSpyObj<PeMessageManagementService>
      ('PeMessageManagementService', ['clearSelectedMessages'])

    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        NoopAnimationsModule,
      ],
      declarations: [
        PeMessageConversationsComponent,
        CdkTextareaAutosize,
      ],
      providers: [
        FormBuilder,
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeOverlayWidgetService, useValue: peOverlayWidgetService },
        { provide: PeChatMemberService, useValue: chatMemberServiceSpy },
        { provide: PeDestroyService, useValue: new Subject() },
        { provide: ActivatedRoute, useValue: routeMock },
        { provide: Router, useValue: {} },
        { provide: Store, useValue: storeSpy },
        { provide: PE_ENV, useValue: {} },
        { provide: ConfirmScreenService, useValue: {} },
        { provide: PePlatformHeaderService, useValue: pePlatformHeaderServiceSpy },
        { provide: SnackbarService, useValue: {} },
        {
          provide: PeAuthService, useValue: {
            getUserData: () => ({ uuid: '10101010' }),
          }
        },
        { provide: MessageStateService, useValue: {} },
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceSpy },
        { provide: PeMessageConversationService, useValue: peMessageConversationServiceSpy },
        { provide: PeMessageGuardService, useValue: {} },
        { provide: PeMessageInvitationApiService, useValue: {} },
        { provide: PeMessageNavService, useValue: {} },
        { provide: PeMessageService, useValue: {} },
        { provide: PeMessageWebSocketService, useValue: peMessageWebSocketServiceSpy },
        { provide: PeMessageManagementService, useValue: peMessageManagementServiceSpy }
      ],
    })
      .overrideComponent(PeMessageConversationsComponent, {
        set: { providers: [] },
      })
      .compileComponents().then(() => {

        fixture = TestBed.createComponent(PeMessageConversationsComponent);
        component = fixture.componentInstance;
      });

    peMessageApiService = TestBed.inject(PeMessageApiService) as jasmine.SpyObj<PeMessageApiService>;
    peMessageManagementService = TestBed.inject(PeMessageManagementService) as jasmine.SpyObj<PeMessageManagementService>;
  }));

  it('should be defined', () => {
    expect(component['handleChatMemberExcluded$']).toBeDefined();
    expect(component).toBeDefined();
  });

  it('on channel creation it should be added to chat list in service', () => {
    let chat = {
      _id: 'ee0018f6-a335-4aba-bcae-071780cfc15c',
      business: '64ad6e0a-2eab-468b-a1ff-3d26d780be98',
      contacts: [],
      description: null,
      integrationName: 'internal',
      messages: [],
      members: [
        {
          addMethod: 'owner',
          addedBy: '7183f726-e61b-4026-87cf-bfb98772ce40',
          role: 'admin',
          user: '7183f726-e61b-4026-87cf-bfb98772ce40',
          createdAt: '2022-08-22T15:17:00.838Z',
          updatedAt: '2022-08-22T15:17:00.838Z',
        },
      ],
      permissions: {
        addMembers: true,
        change: true,
        live: false,
        pinMessages: true,
        publicView: true,
        sendMedia: true,
        sendMessages: true,
        showSender: true,
      },
      photo: null,
      pinned: [],
      signed: false,
      slug: 'U9QTgNtrJyZnDJCDwVqNDLWIo4NC4RED',
      subType: 'public',
      title: 'LARGE',
      type: PeMessageChatType.Channel,
      usedInWidget: false,
      locations: [
        {
          _id: 'b60c32a0-d5da-4ba1-b2fb-a81a98d6188c',
          folderId: '60c0d273-ece6-44fe-a721-eaf30b300c1c',
        },
      ],
      avatar: '',
      initials: 'L',
      updatedAt: new Date('2022-09-05T14:33:43.826Z'),
    };
    component.addConversationToList(chat);
    expect(peMessageChatRoomListServiceSpy.chatList).toContain(chat);
  },
  );

  it('should call api to update folder tree when component calls add to folder dialog', () => {
    component.conversationContextSelect({
      gridItem: '',
      menuItem: PeMessageConversationActionsEnum.AddToFolder
    });
    component['addToFolderViaDialog']({} as any);

    expect(peMessageApiService.getFolderTree).toHaveBeenCalled();
  });

  it('grid-content and grid-sidenav should have no paddings on mobile', function () {
    const contentGridElement = fixture.debugElement.query(By.css('pe-grid-content')).nativeElement;
    const sidenavGridElement = fixture.debugElement.query(By.css('pe-grid-sidenav')).nativeElement;
    const contentPadding = getComputedStyle(contentGridElement).getPropertyValue('padding');
    const sidenavPadding = getComputedStyle(sidenavGridElement).getPropertyValue('padding');
    Object.defineProperty(window, 'innerWidth', {
      writable: true,
      configurable: true,
      value: 550,
    });

    window.dispatchEvent(new Event('resize'));

    expect(window.innerWidth).toBeLessThanOrEqual(720);
    if (window.innerWidth > 720) {
      expect(contentPadding).toBe('0px');
      expect(sidenavPadding).toBe('0px');
    }
  });

  it('should call peMessageManagementServiceSpy.clearSelectedMessages on actionClick', () => {
    let chat: PeMessageChat = {
      _id: 'ee0018f6-a335-4aba-bcae-071780cfc15c',
      business: '64ad6e0a-2eab-468b-a1ff-3d26d780be98',
      contacts: [],
      description: null,
      integrationName: 'internal',
      lastMessages: [],
      members: [
        {
          addMethod: 'owner',
          addedBy: '7183f726-e61b-4026-87cf-bfb98772ce40',
          role: 'admin',
          user: '7183f726-e61b-4026-87cf-bfb98772ce40',
          createdAt: '2022-08-22T15:17:00.838Z',
          updatedAt: '2022-08-22T15:17:00.838Z',
        },
      ],
      messages: [],
      permissions: {
        addMembers: true,
        change: true,
        live: false,
        pinMessages: true,
        publicView: true,
        sendMedia: true,
        sendMessages: true,
        showSender: true,
      },
      photo: null,
      pinned: [],
      signed: false,
      slug: 'U9QTgNtrJyZnDJCDwVqNDLWIo4NC4RED',
      subType: 'public',
      title: 'LARGE',
      type: PeMessageChatType.Channel,
      usedInWidget: false,
      locations: [
        {
          _id: 'b60c32a0-d5da-4ba1-b2fb-a81a98d6188c',
          folderId: '60c0d273-ece6-44fe-a721-eaf30b300c1c',
        },
      ],
      avatar: '',
      initials: 'L',
      updatedAt: new Date('2022-09-05T14:33:43.826Z'),
    };

    let actionItem: PeGridItem<PeMessageChat> = {
      action: {
        label: 'string',
        backgroundColor: 'string',
        color: 'string',
      },
      badge: {
        backgroundColor: 'string',
        color: 'string',
        label: 'string',
      },
      approve: {
        backgroundColor: 'string',
        color: 'string',
        label: 'string',
      },
      columns: [],
      id: 'string',
      image: 'string',
      title: 'string',
      type: PeGridItemType.Folder,
      isDraggable: false,
      data: chat,
      itemLoader$: new BehaviorSubject<boolean>(true),
    }

    component.actionClick(actionItem)
    expect(peMessageManagementService.clearSelectedMessages).toHaveBeenCalled();
  })

});
