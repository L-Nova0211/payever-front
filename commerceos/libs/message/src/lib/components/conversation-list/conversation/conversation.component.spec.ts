import { NO_ERRORS_SCHEMA, Pipe, PipeTransform } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';

import { PeDestroyService, PeGridItemType } from '@pe/common';
import { PeGridMenuService, PeGridService } from '@pe/grid';
import { BehaviorSubject, Subject } from 'rxjs';

import { PeChatMessageStatus, PeChatMessageType } from '../../../../../../shared/chat/src/lib/enums';
import { PeMessageConversationService, PeMessageManagementService } from '../../../services';
import { PeMessageConversationComponent } from './conversation.component';
import { By } from '@angular/platform-browser';

@Pipe({ name: 'translate' })
export class TranslatePipe implements PipeTransform {
  transform(value: string): string {
    return value;
  }
}

describe('PeMessageConversationComponent', () => {
  let fixture: ComponentFixture<PeMessageConversationComponent>;
  let component: PeMessageConversationComponent;
  let peMessageManagementService;
  let peMessageConversationService;

  beforeEach(
    waitForAsync(() => {
      peMessageManagementService = jasmine.createSpyObj<PeMessageManagementService>(
        'PeMessageManagementService',
        {
          isMessageRead: true,
        },
        {
          messageList: [
            {
              _id: '4af16d4f-04fc-4e7d-aec9-cc35a2802520',
              attachments: [],
              chat: 'e48c309b-372d-484f-9cbb-4a22ee69de53',
              content: 'Last message from service',
              deletedForUsers: [],
              editedAt: null,
              readBy: ['86eca978-09c1-4bd7-aa49-31df79570737'],
              sender: '7183f726-e61b-4026-87cf-bfb98772ce40',
              status: PeChatMessageStatus.READ,
              type: PeChatMessageType.Text,
            },
          ],
        },
      );

      peMessageConversationService = jasmine.createSpyObj<PeMessageConversationService>(
        'PeMessageConversationService',
        {
          taggedMessage: false,
          userIsTagged: false,
        },
        {
          activeConversation$: new BehaviorSubject(null),
        },
      );

      TestBed.configureTestingModule({
        declarations: [PeMessageConversationComponent, TranslatePipe],
        providers: [
          { provide: PeMessageConversationService, useValue: peMessageConversationService },
          { provide: PeMessageManagementService, useValue: peMessageManagementService },
          { provide: PeGridMenuService, useValue: {} },
          { provide: PeDestroyService, useValue: new Subject() },
          { provide: PeGridService, useValue: {} },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeMessageConversationComponent);
          component = fixture.componentInstance;

          component.item = {
            action: {
              label: 'item',
            },
            columns: [],
            id: 'e48c309b-372d-484f-9cbb-4a22ee69de53',
            image: '',
            title: 'CH5',
            type: PeGridItemType.Item,
          };

          component.item.data = {
            accentColor: '#24272ED9',
            draft: 'as',
            integrationName: 'CH5',
            initials: 'data',
            isLastMessageAttachment: false,
            isPrivateChannel: false,
            lastMessage: 'content',
            showTag: false,
            unreadMessages: 2,
            updatedAt: Date.now(),
            messages: [
              {
                _id: '4af16d4f-04fc-4e7d-aec9-cc35a2802515',
                attachments: [],
                chat: 'e48c309b-372d-484f-9cbb-4a22ee69de53',
                content: '1',
                deletedForUsers: [],
                editedAt: null,
                mentions: [],
                readBy: ['86eca978-09c1-4bd7-aa49-31df79570737'],
                sender: '7183f726-e61b-4026-87cf-bfb98772ce40',
                sentAt: '2022-08-11T15:58:57.625Z',
                status: 'read',
                type: 'text',
                createdAt: '2022-08-11T15:58:57.730Z',
                updatedAt: '2022-08-11T15:58:57.730Z',
              },
            ],
          };
        });
    }),
  );

  it('component should initialize', () => {
    component.ngOnInit();

    const { accentColor, activeUser, draft, initials, messages, subType, updatedAt } = component.item?.data;

    expect(accentColor).toEqual(component.item?.data.accentColor);
    expect(activeUser).toEqual(component.item?.data.activeUser);
    expect(draft).toEqual(component.item?.data.draft);
    expect(initials).toEqual(component.item?.data.initials);
    expect(messages).toEqual(component.item?.data.messages);
    expect(subType).toEqual(component.item?.data.subType);
    expect(updatedAt).toBeGreaterThanOrEqual(component.item?.data.updatedAt);
  });

  it('context menu should open on long press', () => {
    const event = {
      isTrusted: true,
      x: 108,
      y: 192,
      altKey: false,
      bubbles: true,
      cancelBubble: true,
      cancelable: true,
      composed: true,
      ctrlKey: false,
      defaultPrevented: true,
      detail: 0,
      eventPhase: 0,
      metaKey: false,
      returnValue: false,
      shiftKey: false,
      timeStamp: 877094.5,
      type: 'touchstart',
      which: 0,
    };
    const openContextSpy = spyOn(component, 'openContextMenu');
    component.openContextMenuItem(event);
    expect(openContextSpy).toHaveBeenCalledWith(event as PointerEvent);
  });

  it('should return last message if draft is empty', () => {
    const { messages } = component.item?.data;
    component.item.data.draft = null;
    component.ngOnInit();

    expect(component.conversation.lastMessage).toEqual(messages[0].content);
  });

  it('should remove message if it is deleted for current user', () => {
    component.item.data.draft = null;
    component.item.data.activeUser = {
      _id: '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
    };
    component.item.data.messages = [
      {
        _id: '4af16d4f-04fc-4e7d-aec9-cc35a2802515',
        attachments: [],
        chat: 'e48c309b-372d-484f-9cbb-4a22ee69de53',
        content: '1',
        deletedForUsers: ['5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f'],
        editedAt: null,
        mentions: [],
        readBy: ['86eca978-09c1-4bd7-aa49-31df79570737'],
        sender: '7183f726-e61b-4026-87cf-bfb98772ce40',
        sentAt: '2022-08-11T15:58:57.625Z',
        status: 'read',
        type: 'text',
        createdAt: '2022-08-11T15:58:57.730Z',
        updatedAt: '2022-08-11T15:58:57.730Z',
      },
    ];

    component.ngOnInit();

    expect(component.conversation.lastMessage).toBeNull();
  });

  it('should be updated today', () => {
    component.item.data.draft = null;
    component.item.data.messages = [
      {
        _id: '4af16d4f-04fc-4e7d-aec9-cc35a2802515',
        attachments: [],
        chat: 'e48c309b-372d-484f-9cbb-4a22ee69de53',
        content: '1',
        deletedForUsers: ['5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f'],
        editedAt: null,
        mentions: [],
        readBy: ['86eca978-09c1-4bd7-aa49-31df79570737'],
        sender: '7183f726-e61b-4026-87cf-bfb98772ce40',
        sentAt: '2022-08-11T15:58:57.625Z',
        status: 'read',
        type: 'text',
        createdAt: '2022-08-11T15:58:57.730Z',
        updatedAt: Date.now(),
      },
    ];

    component.ngOnInit();

    expect(component.conversation.isUpdatedToday).toBeTrue();
  });

  it('should not be updated today', () => {
    component.item.data.draft = null;
    component.item.data.messages = [
      {
        _id: '4af16d4f-04fc-4e7d-aec9-cc35a2802515',
        attachments: [],
        chat: 'e48c309b-372d-484f-9cbb-4a22ee69de53',
        content: '1',
        deletedForUsers: ['5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f'],
        editedAt: null,
        mentions: [],
        readBy: ['86eca978-09c1-4bd7-aa49-31df79570737'],
        sender: '7183f726-e61b-4026-87cf-bfb98772ce40',
        sentAt: '2022-08-11T15:58:57.625Z',
        status: 'read',
        type: 'text',
        createdAt: '2022-08-11T15:58:57.730Z',
        updatedAt: '2022-08-11T15:58:57.730Z',
      },
    ];

    component.ngOnInit();

    expect(component.conversation.isUpdatedToday).toBeFalse();
  });

  it('conversation should have bottom divider line', function () {
    fixture.detectChanges();
    const conv = fixture.debugElement.query(By.css('.pe-grid-conversation')).nativeElement.parentElement;
    const afterPseudoElementContent = window.getComputedStyle(conv, ':after').getPropertyValue('content');
    const afterPseudoElementHeight = window.getComputedStyle(conv, ':after').getPropertyValue('height');
    expect(afterPseudoElementContent).toBe('""');
    expect(afterPseudoElementHeight).toBe('1px');
  });
});
