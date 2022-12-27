import { ScrollDispatcher } from '@angular/cdk/overlay';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { By, DomSanitizer } from '@angular/platform-browser';
import { PeDestroyService, PE_ENV } from '@pe/common';

import { PeChatComponent } from './chat.component';

import { of, Subject } from 'rxjs';
import { MatIconRegistry } from '@angular/material/icon';
import { ChatScrollService } from './chat.service';
import { I18nModule } from '@pe/i18n';
import { VirtualScrollViewportComponent } from './scrolling/virtual-scroll-viewport.component';
import { PeChatMessage } from '@pe/shared/chat';
import { Component } from '@angular/core';

@Component({
  selector: 'pe-virtual-scroll-viewport',
  template: '',
  providers: [{
    provide: VirtualScrollViewportComponent,
    useClass: VirtualScrollViewportComponentMock,
  }],
})

class VirtualScrollViewportComponentMock {
  attachView = jasmine.createSpy('attachView');
  items = jasmine.createSpy('items').and.returnValue(10);
  virtualScroll = {
    renderedRangeStream: of(null),
    scrollToIndex: jasmine.createSpy('scrollToIndex'),
    scrollTo: jasmine.createSpy('scrollTo'),
    measureScrollOffset: jasmine.createSpy('measureScrollOffset').and.returnValue(30),
  };
}

describe('PeChatComponent', () => {

  let fixture: ComponentFixture<PeChatComponent>;
  let iconRegistry: MatIconRegistry;
  let component: PeChatComponent;
  let viewportComponent: VirtualScrollViewportComponent;
  let domSanitizer: jasmine.SpyObj<DomSanitizer>;
  let chatScrollServiceSpy;

  beforeEach(waitForAsync(() => {

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustStyle: 'style.passed',
      bypassSecurityTrustResourceUrl: 'bypassed.resource.url',
    });

    chatScrollServiceSpy = jasmine.createSpyObj<ChatScrollService>('ChatScrollService', {}, {
      setInputItems$: new Subject(),
      scrollChange$: new Subject<void>(),
      scrollToMessage$: new Subject<PeChatMessage>(),
    });

    const scrollDispatcherSpy = jasmine.createSpyObj<ScrollDispatcher>('ScrollDispatcher', {
      scrolled: of(null),
    },
    );

    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        I18nModule,
      ],
      declarations: [
        PeChatComponent,
        VirtualScrollViewportComponentMock,
      ],
      providers: [
        FormBuilder,
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: PeDestroyService, useValue: new Subject() },
        { provide: ChatScrollService, useValue: chatScrollServiceSpy },
        { provide: ScrollDispatcher, useValue: scrollDispatcherSpy },
        { provide: PE_ENV, useValue: {} },
      ],
    })
      .overrideComponent(PeChatComponent, {
        set: { providers: [] },
      })
      .compileComponents().then(() => {

        fixture = TestBed.createComponent(PeChatComponent);
        component = fixture.componentInstance;
        iconRegistry = TestBed.inject(MatIconRegistry);

        spyOnProperty(component, 'virtualFor').and.returnValue({ template: 'tp1' } as any);
        domSanitizer = TestBed.inject(DomSanitizer) as jasmine.SpyObj<DomSanitizer>;
      });

  }));

  it('should be defined', () => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  it('should be scrolled', () => {
    fixture.detectChanges();

    const nextSpy = spyOn(chatScrollServiceSpy.scrollChange$, 'next');
    component.scrollIndexChange();

    expect(nextSpy).toHaveBeenCalled();
  });

  it('should be scrolled to bottom', (done) => {
    fixture.detectChanges();

    component.scrollListBottom();
    fixture.whenStable().then(() => {
      expect(component.viewport.virtualScroll.scrollTo).toHaveBeenCalledTimes(10);
      done();
    })
  });

  it('messages should be defined', () => {
    fixture.detectChanges();

    component.ngAfterViewInit();

    expect(component.messages).toBeDefined();
  });

  it('should call scrollToIndex', () => {
    fixture.detectChanges();

    component.viewport.items = [];
    component.navigateToMessage('id');

    expect(component.viewport.virtualScroll.scrollToIndex).toHaveBeenCalled();
  });

  it('should be pinned messages show', () => {
    fixture.detectChanges();
    const nextSpy = spyOn(component, 'findMessageIndex');
    const messageId = '8b00fcc3-d380-4d8b-99b9-608f8bdc588d';
    component.viewport.items = [
      {
        '_id': '8b00fcc3-d380-4d8b-99b9-608f8bdc588d',
        'attachments': [],
        'chat': '7c499b59-cb80-4263-8f2d-2ca43d485136',
        'content': '112',
        'deletedForUsers': [],
        'editedAt': null,
        'mentions': [],
        'readBy': [],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': '2022-09-08T10:59:07.165Z',
        'status': 'sent',
        'type': 'text',
        'createdAt': '2022-09-08T10:59:07.517Z',
        'updatedAt': '2022-09-08T10:59:07.517Z',
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
      {
        '_id': 'ad147ce6-3434-4539-bb70-c7f642726369',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': '889',
        'deletedForUsers': [],
        'editedAt': null,
        'mentions': [],
        'readBy': [],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': '2022-09-13T14:11:37.893Z',
        'status': 'sent',
        'type': 'text',
        'createdAt': '2022-09-13T14:11:38.004Z',
        'updatedAt': '2022-09-13T14:11:38.004Z',
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
      {
        '_id': '43ff060e-52c1-426c-9790-c9bdbb71264a',
        'attachments': [],
        'chat': 'ee0018f6-a335-4aba-bcae-071780cfc15c',
        'content': 'nn',
        'deletedForUsers': [],
        'editedAt': null,
        'mentions': [],
        'readBy': [],
        'sender': '7183f726-e61b-4026-87cf-bfb98772ce40',
        'sentAt': '2022-09-13T14:11:49.581Z',
        'status': 'sent',
        'type': 'text',
        'createdAt': '2022-09-13T14:11:50.165Z',
        'updatedAt': '2022-09-13T14:11:50.165Z',
        'avatar': '',
        'reply': true,
        'name': 'Firoj  Khan',
      },
    ];
    component.navigateToMessage(messageId);
    expect(nextSpy).toHaveBeenCalled();
  });


  it('Scroll button should have display=none when not visible', () => {
    component.ngOnInit();
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const e = fixture.debugElement.query(By.css(".messages__container_scroll-bottom")).nativeElement;
      expect(getComputedStyle(e).display).toEqual('none');
    })

  })

  it('Scroll button should have display=flex when visible', () => {
    component.ngOnInit();
    component.scrollBottom = false;
    fixture.detectChanges();

    fixture.whenStable().then(() => {
      const e = fixture.debugElement.query(By.css(".messages__container_scroll-bottom")).nativeElement;
      expect(getComputedStyle(e).display).toEqual('flex');
    })

  })


  describe('ngOnInit', () => {
    it('should scrollToMessage$.pipe()', () => {
      const nextSpy = spyOn(chatScrollServiceSpy.scrollToMessage$, 'pipe').and.returnValue({ subscribe: () => { } });
      component.ngOnInit();
      expect(nextSpy).toHaveBeenCalled();
    });
  });

});
