import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { PeAuthService } from '@pe/auth';
import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { PeGridSidenavService } from '@pe/grid';
import { SimpleLocaleConstantsService, TranslateService } from '@pe/i18n-core';
import { OverlayHeaderConfig, PE_OVERLAY_CONFIG, PeOverlayConfig, PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeMessageChannelMember } from '@pe/shared/chat';

import { BehaviorSubject, of, Subject } from 'rxjs';

import {
  PeMessageApiService,
  PeMessageChannelSettingsService,
  PeMessageChatAction,
  PeMessageChatRoomListService,
  PeMessageChatRoomSettingsComponent,
  PeMessageService,
} from '../..';

describe('PeMessageChatRoomSettingComponent', () => {
  let fixture: ComponentFixture<PeMessageChatRoomSettingsComponent>;
  let component: PeMessageChatRoomSettingsComponent;
  let mockOverlayHeaderConfig: OverlayHeaderConfig = {
    title: 'Test',
    onSaveSubject$: new BehaviorSubject<any>(true),
  };
  let peOverlayWidgetServiceSpy: jasmine.SpyObj<PeOverlayWidgetService>;

  beforeEach(
    waitForAsync(() => {
      const mockPeAuthService = {
        getUserData() {
          return {
            uuid: '123-3445-67754',
          };
        },
      };

      const mockConfirmScreenService = {
        show() {
          return of([]);
        },
      };

      const mockPeMessageChatRoomListService = {
        deleteChat(id?: string) {
          return of([]);
        },
        activeChat$: {
          pipe: () => [],
        },
        openPermissionPopUp$: {
          pipe: () => [],
        },
      };

      peOverlayWidgetServiceSpy = jasmine.createSpyObj<PeOverlayWidgetService>('PeOverlayWidgetService', [
        'open',
        'close',
      ]);

      peOverlayWidgetServiceSpy.open.and.callFake((config: PeOverlayConfig) => {
        config.headerConfig.onSaveSubject$.next(true);
        return [] as any;
      });

      const translateServiceSpy = jasmine.createSpyObj<TranslateService>(['translate']);
      translateServiceSpy.translate.and.callFake((key: string) => `${key}.translated`);

      TestBed.configureTestingModule({
        imports: [],
        declarations: [PeMessageChatRoomSettingsComponent],
        providers: [
          { provide: PE_OVERLAY_CONFIG, useValue: mockOverlayHeaderConfig },
          { provide: ConfirmScreenService, useValue: mockConfirmScreenService },
          { provide: PeAuthService, useValue: mockPeAuthService },
          { provide: PeOverlayWidgetService, useValue: peOverlayWidgetServiceSpy },
          { provide: PeDestroyService, useValue: new Subject() },
          { provide: PeGridSidenavService, useValue: {} },
          { provide: PeMessageApiService, useValue: {} },
          { provide: PeMessageChannelSettingsService, useValue: {} },
          { provide: PeMessageChatRoomListService, useValue: mockPeMessageChatRoomListService },
          { provide: PeMessageService, useValue: {} },
          { provide: TranslateService, useValue: translateServiceSpy },
          SimpleLocaleConstantsService,
        ],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeMessageChatRoomSettingsComponent);
          component = fixture.componentInstance;
          fixture.detectChanges();
        });
    }),
  );

  it('Should close the dialog after deleting the group', async () => {
    spyOn<any>(component, 'closeForm');
    component.pushAction(PeMessageChatAction.Delete);
    expect(component['closeForm']).toHaveBeenCalled();
  });

  it('Should open overlay widget', async () => {
    const reOpenSettingFormSpy = spyOn<any>(component, 'reOpenSettingForm');
    const mockMember: PeMessageChannelMember = {
      _id: '123456789',
      avatar: 'best-avatar',
      initials: 'AB',
      title: 'Hello',
    };

    component.activeChat = {
      _id: '56fb8a80-a484-45e4-8d4e-865f1506efdf',
      onlineMembersCount: 0,
      title: 'Test chat',
      members: [],
    };

    fixture.detectChanges();
    component.memberPermissions(mockMember);
    expect(peOverlayWidgetServiceSpy.open).toHaveBeenCalled();
    expect(reOpenSettingFormSpy).toHaveBeenCalled();
  });
});
