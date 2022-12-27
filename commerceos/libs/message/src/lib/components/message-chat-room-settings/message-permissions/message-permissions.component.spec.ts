import { NO_ERRORS_SCHEMA, Pipe } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PeMessageChannelRoles } from '@pe/shared/chat';
import { PeMessagePermissionsComponent } from './message-permissions.component';
import { of, Subject } from 'rxjs';

import { APP_TYPE, AppType, PE_ENV, PeDestroyService } from '@pe/common';
import { ConfirmScreenService } from '@pe/confirmation-screen';
import { SimpleLocaleConstantsService, TranslateService } from '@pe/i18n-core';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';

import { PeMessageChatRoomListService } from '../../../services';
import { PeMessageApiService } from '../../../services/message-api.service';

@Pipe({
  name: 'translate',
})
class TranslatePipeMock {
  transform() {
  }
}

describe('PeMessagePermissionsComponent', () => {
  let fixture: ComponentFixture<PeMessagePermissionsComponent>;
  let component: PeMessagePermissionsComponent;
  let peOverlayConfig: any;
  let peOverlayData: any;
  let translateService: jasmine.SpyObj<TranslateService>;

  let confirmScreenServiceSpy: jasmine.SpyObj<ConfirmScreenService>;
  let peMessageApiServiceSpy : jasmine.SpyObj<PeMessageApiService>;

  beforeEach(waitForAsync(() => {

    const peOverlayDataMock = {
      id: 'test',
      theme: 'light',
      folder: {
        _id: 'f-001',
        name: 'Folder 1',
        parentFolder: 'parent',
      },
      newFolder: null,
      member: {
        initials: 'test',
        permissions: {},
        role: '',
      },
      channel: {},
    };

    const peOverlayConfigMock = {
      theme: 'light',
      onSaveSubject$: {
        next: jasmine.createSpy('next'),
      },
      doneBtnCallback: undefined,
      backBtnCallback: undefined,
      isLoading: false,
    };

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService',
      ['translate']);

    translateServiceSpy.translate.and.callFake((key: string) => `${key}`);

    confirmScreenServiceSpy = jasmine.createSpyObj<ConfirmScreenService>('ConfirmScreenService',
      ['show']);

    confirmScreenServiceSpy.show.and.callFake((headings: any, useObservable: any) => of(true));

    peMessageApiServiceSpy = jasmine.createSpyObj<PeMessageApiService>('PeMessageApiService',
      ['postConversationMemberExclude']);

    peMessageApiServiceSpy.postConversationMemberExclude.and.callFake((channelId: any, memberId: any, businessId: any) => of(true));
    const simpleLocaleConstantsServiceSpy = jasmine.createSpyObj<SimpleLocaleConstantsService>
    ('SimpleLocaleConstantsService',
      ['getLang']);

    let peMessageChatRoomListServiceMock = {
      activeChat: {
        members: [{
          'addMethod': 'invite',
          'addedBy': '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
          'role': 'member',
          'user': '5f5d6108-3a49-402b-ab9e-00d4b4ebfd4f',
          'createdAt': '2022-09-05T12:06:01.550Z',
          'updatedAt': '2022-09-05T12:06:01.550Z',
        }],
        membersInfo: [{
          user: {
            _id: '',
          },
        }],
      },
    };

    simpleLocaleConstantsServiceSpy.getLang.and.callFake(() => `en`);

    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule],
      declarations: [
        PeMessagePermissionsComponent,
        TranslatePipeMock,
      ],
      providers: [
        FormBuilder,
        { provide: PeMessageApiService, useValue: peMessageApiServiceSpy },
        { provide: PE_ENV, useValue: {} },
        { provide: PeDestroyService, useValue: new Subject() },
        { provide: PeMessageChatRoomListService, useValue: peMessageChatRoomListServiceMock },
        { provide: ConfirmScreenService, useValue: confirmScreenServiceSpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: SimpleLocaleConstantsService, useValue: simpleLocaleConstantsServiceSpy },
        { provide: PE_OVERLAY_DATA, useValue: peOverlayDataMock },
        { provide: PE_OVERLAY_CONFIG, useValue: peOverlayConfigMock },
        { provide: APP_TYPE, useValue: AppType.Message },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {
      fixture = TestBed.createComponent(PeMessagePermissionsComponent);
      component = fixture.componentInstance;

      translateService = TestBed.inject(TranslateService) as jasmine.SpyObj<TranslateService>;
      peOverlayConfig = TestBed.inject(PE_OVERLAY_CONFIG);
      peOverlayData = TestBed.inject(PE_OVERLAY_DATA);
    });

  }));

  it('should be defined', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should call showDismissMemberConfirmationDialog', () => {
    spyOn(component, 'showDismissMemberConfirmationDialog');
    component.dismissMember();
    expect(component.showDismissMemberConfirmationDialog).toHaveBeenCalled();
  });

  it('should return remove-member button label for regular users', () => {
    component.member.role = PeMessageChannelRoles.Member;
    fixture.detectChanges();
    expect(component.removeMemberButtonText).toEqual('message-app.channel.settings.remove-member');
  });

  it('should return dismiss-admin button label for admins', () => {
    component.member.role = PeMessageChannelRoles.Admin;
    fixture.detectChanges();
    expect(component.removeMemberButtonText).toEqual('message-app.channel.settings.dismiss-admin');
  });

  it('should call postConversationMemberExclude when member is excluded', () => {
    component.dismissMember();
    expect(confirmScreenServiceSpy.show).toHaveBeenCalled();
    expect(peMessageApiServiceSpy.postConversationMemberExclude).toHaveBeenCalled();
  })

  it('should call overlay subject`s next method when member is excluded', () => {
    component.dismissMember();
    expect(confirmScreenServiceSpy.show).toHaveBeenCalled();
    expect(peMessageApiServiceSpy.postConversationMemberExclude).toHaveBeenCalled();
    expect(peOverlayConfig.onSaveSubject$.next).toHaveBeenCalled();
  })
});
