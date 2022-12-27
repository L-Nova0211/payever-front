import { PeChatHeaderTagComponent } from '@pe/chat';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { MediaService } from '@pe/media';
import { PeAuthService } from '@pe/auth';
import { PeMessageChat } from '@pe/shared/chat';

describe('ChatHeaderTagComponent ', () => {
  let fixture: ComponentFixture<PeChatHeaderTagComponent>;
  let component: PeChatHeaderTagComponent;

  const mockUserData = {
    uuid: 'user-001',
    first_name: 'TestFirstName',
    last_name: 'TestLastName',
    email: 'test@example.com',
    roles: '',
  }
  const chat: PeMessageChat = {
    title: 'mock title',
    _id: 'chat-001',
    initials: 'SZ',
  }

  beforeEach(waitForAsync(() => {
    const mediaServiceSpy = jasmine.createSpyObj<MediaService>('MediaService', {
      getMediaUrl: 'url/image',
    });

    const authServiceSpy = jasmine.createSpyObj<PeAuthService>('AuthService', {
      getUserData: mockUserData
    })

    TestBed.configureTestingModule({
      declarations: [PeChatHeaderTagComponent],
      providers: [
        { provide: PeAuthService, useValue: authServiceSpy },
        { provide: MediaService, useValue: mediaServiceSpy },
  ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents()
      .then(()=>{
        fixture = TestBed.createComponent(PeChatHeaderTagComponent);
        component = fixture.componentInstance;
        component.chat = chat;
        fixture.detectChanges();
      });
  }));

  it('should be defined', () => {
    expect(component).toBeDefined();
  });

  it('initials should be one letter', function () {
    fixture.detectChanges();
    const initialsFirstLetter = component.chat.initials[0]
    const initials = fixture.debugElement.nativeElement.querySelector('.pe-message-chat-room-list__initials').innerText;
    expect(initials).toBe(initialsFirstLetter)
  });

});
