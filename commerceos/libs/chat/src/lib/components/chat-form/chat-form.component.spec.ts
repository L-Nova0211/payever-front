import { Overlay } from '@angular/cdk/overlay';
import { CdkTextareaAutosize } from '@angular/cdk/text-field';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { FormBuilder } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { DomSanitizer } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Subject } from 'rxjs';

import { PeDestroyService } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeOverlayWidgetService } from '@pe/overlay-widget';
import { PeChatMemberService } from '@pe/shared/chat';

import { PeChatFormComponent } from './chat-form.component';

describe('PeChatFormComponent', () => {

  let fixture: ComponentFixture<PeChatFormComponent>;
  let component: PeChatFormComponent;
  let peOverlayWidgetService: {
    isOpenOverlay$: Subject<void>,
  };

  beforeEach(waitForAsync(() => {

    const sanitizerSpy = jasmine.createSpyObj<DomSanitizer>('DomSanitizer', {
      bypassSecurityTrustStyle: 'style.passed',
    });

    const overlaySpy = jasmine.createSpyObj<Overlay>('Overlay', {
      position: {
        flexibleConnectedTo: () => ({
          withDefaultOffsetY: () => ({
            withPositions: () => 'position.strategy',
          }),
        }),
      } as any,
    }, {
      scrollStrategies: {
        reposition: () => 'scroll.strategy.reposition',
      } as any,
    });

    const translateServiceSpy = jasmine.createSpyObj<TranslateService>('TranslateService', {
      translate: 'translated',
    });

    peOverlayWidgetService = {
      isOpenOverlay$: new Subject(),
    };

    const chatMemberServiceSpy = jasmine.createSpyObj<PeChatMemberService>('PeChatMemberService', ['mapMemberToChat']);

    TestBed.configureTestingModule({
      imports: [
        MatMenuModule,
        NoopAnimationsModule,
      ],
      declarations: [
        PeChatFormComponent,
        CdkTextareaAutosize,
      ],
      providers: [
        FormBuilder,
        { provide: DomSanitizer, useValue: sanitizerSpy },
        { provide: Overlay, useValue: overlaySpy },
        { provide: TranslateService, useValue: translateServiceSpy },
        { provide: PeOverlayWidgetService, useValue: peOverlayWidgetService },
        { provide: PeChatMemberService, useValue: chatMemberServiceSpy },
        { provide: PeDestroyService, useValue: new Subject() },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideComponent(PeChatFormComponent, {
        set: { providers: [] },
      })
      .compileComponents().then(() => {

      fixture = TestBed.createComponent(PeChatFormComponent);
      component = fixture.componentInstance;
      component.sender = 'Test Sender';
      fixture.autoDetectChanges();
    });

  }));

  it('should be defined', () => {
    fixture.detectChanges();
    expect(component).toBeDefined();
  });

  it('should return selected tagged person', () => {

    let chatItem = {
      'avatar': '',
      'title': 'Test Payments',
      'initials': 'TP',
    };

    fixture.detectChanges();

    component.onSelectTag(chatItem);
    expect(component.membersTag.length).toEqual(0);
    expect(component.menuTrigger).toEqual(false);
    expect(component.chatForm.controls.textarea.value).toContain('Test Payments ');

  });

  it('should set isTyping to false, when message is sent', () => {
    fixture.detectChanges();
    component.isTyping = true;
    component.sendMessage();
    expect(component.isTyping).toBeFalse();
  });

  it('should emit typing event when input changes', () => {
    spyOn(component.typing, 'emit');
    component.isTyping = false;
    fixture.detectChanges();
    component.inputChange$.next();

    expect(component.typing.emit).toHaveBeenCalled();
    expect(component.isTyping).toBeTrue();
  });

  describe('openEditMessageMenu', () => {
    it('should assign value to _editMessage', () => {
      const messageToEdit = 'messageToEdit';

      fixture.detectChanges();

      component.openEditMessageMenu(messageToEdit);
      expect(component._editMessage).toEqual(messageToEdit);
      expect(component.editMessageMenuTrigger).toEqual(true);
      expect(component.chatForm.controls.textarea.value).toContain(messageToEdit);
    });

    it('should not assign value to _editMessage', () => {
      const messageToEdit = undefined;

      fixture.detectChanges();

      component.openEditMessageMenu(messageToEdit);
      expect(component._editMessage).toEqual('');
      expect(component.editMessageMenuTrigger).toEqual(false);
      expect(component.chatForm.controls.textarea.value).not.toContain('');
    });
  });
});
