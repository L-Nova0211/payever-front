import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, fakeAsync, TestBed, tick, waitForAsync } from '@angular/core/testing';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { PebEditorState, PebScreen } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-shared';
import { MessageBus } from '@pe/common';

import { PebEditorMailToolbarComponent } from './toolbar.component';

describe('PebEditorMailToolbarComponent', () => {

  let fixture: ComponentFixture<PebEditorMailToolbarComponent>;
  let component: PebEditorMailToolbarComponent;
  let messageBus: jasmine.SpyObj<MessageBus>;
  let emitter: Subject<{
    type: string;
    payload: any;
  }>;

  beforeEach(waitForAsync(() => {

    const messageBusSpy = jasmine.createSpyObj<MessageBus>('MessageBus', [
      'listen',
      'emit',
    ]);
    emitter = new Subject();
    messageBusSpy.listen.and.callFake((eventName: string) => emitter.pipe(
      filter(e => e.type === eventName),
      map(e => e.payload),
    ));

    TestBed.configureTestingModule({
      imports: [MatAutocompleteModule],
      declarations: [PebEditorMailToolbarComponent],
      providers: [
        { provide: PebEditorStore, useValue: {} },
        { provide: PebEditorState, useValue: {} },
        { provide: MessageBus, useValue: messageBusSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents().then(() => {

      fixture = TestBed.createComponent(PebEditorMailToolbarComponent);
      component = fixture.componentInstance;

      messageBus = TestBed.inject(MessageBus) as jasmine.SpyObj<MessageBus>;

    });

  }));

  it('should be defined', () => {

    fixture.detectChanges();

    expect(component).toBeDefined();

  });

  it('should get host skeleton class', () => {

    // FALSE
    expect(component.hostSkeletonClass).toBe(false);

    // TRUE
    component.loading = true;
    expect(component.hostSkeletonClass).toBe(true);

  });

  it('should get native element', () => {

    expect(component.nativeElement).toEqual(fixture.nativeElement);

  });

  it('should handle ng on init', fakeAsync(() => {

    const filterSpy = spyOn<any>(component, 'filterAutocomplete');
    const addSpy = spyOn(component, 'addRecipientChip');
    const detectSpy = spyOn(component[`cdr`], 'detectChanges');
    let event: {
      type: string;
      payload: any;
    };

    component.ngOnInit();

    expect(messageBus.listen.calls.allArgs()).toEqual([
      ['message.toolbar.reply'],
      ['message.toolbar.set-users'],
      ['message.mail.contacts-set'],
    ]);

    /**
     * handle form changes
     */
    component.form.patchValue({
      sender: 'test.sender',
    });

    tick(250);

    expect(messageBus.emit).toHaveBeenCalledWith('message.toolbar.change', component.form.value);

    /**
     * emit message.toolbar.reply event
     * event.payload.recipients is null
     */
    messageBus.emit.calls.reset();
    event = {
      type: 'message.toolbar.reply',
      payload: {
        recipients: null,
        subject: 'Subject',
        sender: 'Sender',
        testMailRecipient: 'Test Recipient',
      },
    };
    emitter.next(event);

    tick(250);

    expect(messageBus.emit).toHaveBeenCalledWith('message.toolbar.change', component.form.value);
    expect(component.form.value).toEqual({
      recipients: null,
      subject: event.payload.subject,
      sender: event.payload.sender,
      testMailRecipient: event.payload.testMailRecipient,
    });
    expect(detectSpy).toHaveBeenCalled();
    expect(addSpy).not.toHaveBeenCalled();
    expect(filterSpy).not.toHaveBeenCalled();

    /**
     * event.payload.recipients is set
     */
    messageBus.emit.calls.reset();
    event.payload.recipients = ['Recipient 1', 'Recipient 2'];
    emitter.next(event);

    tick(250);

    expect(messageBus.emit).toHaveBeenCalledWith('message.toolbar.change', component.form.value);
    expect(addSpy.calls.allArgs()).toEqual(event.payload.recipients.map((r: string) => [r]));
    expect(filterSpy).not.toHaveBeenCalled();

    /**
     * emit message.toolbar.set-users event
     */
    messageBus.emit.calls.reset();
    detectSpy.calls.reset();
    event = {
      type: 'message.toolbar.set-users',
      payload: [
        {
          userAccount: {
            firstName: 'James',
            lastName: 'Bond',
            email: '007@payever.de',
          },
        },
        {
          userAccount: {
            firstName: 'Bruce',
            lastName: 'Wayne',
            email: 'wayne@payever.de',
          },
        },
      ],
    };
    emitter.next(event);

    tick(250);

    expect(component.sendersList).toEqual(event.payload.map(user => ({
      name: `${user.userAccount.firstName} ${user.userAccount.lastName}`,
      email: user.userAccount.email,
    })));
    expect(detectSpy).toHaveBeenCalled();
    expect(component.form.value.sender).toEqual(event.payload[0].userAccount.email);
    expect(messageBus.emit).toHaveBeenCalledWith('message.toolbar.change', component.form.value);
    expect(filterSpy).not.toHaveBeenCalled();

    /**
     * change component.form.recipients
     */
    messageBus.emit.calls.reset();
    component.filteredContacts$.subscribe();
    component.form.patchValue({
      recipients: ['Recipient 1'],
    });

    tick(250);

    expect(messageBus.emit).toHaveBeenCalledWith('message.toolbar.change', component.form.value);
    expect(filterSpy).toHaveBeenCalledWith(['Recipient 1']);

    /**
     * emit message.mail.contacts-set event
     * payload is null
     * component.form.value.recipients is null
     */
    addSpy.calls.reset();
    component.form.patchValue({
      recipients: null,
    }, { emitEvent: false });
    event = {
      type: 'message.mail.contacts-set',
      payload: null,
    };
    emitter.next(event);

    expect(addSpy).not.toHaveBeenCalled();

    /**
     * payload is set
     */
    event.payload = [{ value: 'Recipient 1' }];
    emitter.next(event);

    expect(addSpy).toHaveBeenCalledOnceWith(event.payload[0].value);

    /**
     * component.form.value.recipients is set
     */
    addSpy.calls.reset();
    component.form.patchValue({
      recipients: ['Recipient 1'],
    }, { emitEvent: false });
    event.payload.push({ value: 'Recipient 2' });
    emitter.next(event);

    expect(addSpy).toHaveBeenCalledOnceWith(event.payload[1].value);

  }));

  it('should open contact dialog', () => {

    component.openContactDialog();

    expect(messageBus.emit).toHaveBeenCalledWith('message.mail.contacts-open', null);

  });

  it('should handle send test mail', () => {

    component.onSendTestMail();

    expect(messageBus.emit).toHaveBeenCalledWith('message.mail.send-test', component.form.value);

  });

  it('should add recipient chip', () => {

    const detectSpy = spyOn(component[`cdr`], 'detectChanges');

    /**
     * argument chipValue is null
     */
    component.addRecipientChip(null);

    expect(component.recipients).toEqual([]);
    expect(component.recipientCtrl.value).toBeNull();
    expect(component.form.value.recipients).toBeNull();
    expect(detectSpy).not.toHaveBeenCalled();

    /**
     * argument chipValue is ' '
     */
    component.addRecipientChip(' ');

    expect(component.recipients).toEqual([]);
    expect(component.recipientCtrl.value).toBeNull();
    expect(component.form.value.recipients).toEqual(component.recipients);
    expect(detectSpy).toHaveBeenCalled();

    /**
     * argument chipValue is ' test '
     */
    component.addRecipientChip(' test ');

    expect(component.recipients).toEqual(['test']);
    expect(component.form.value.recipients).toEqual(component.recipients);

  });

  it('should remove recipient chip', () => {

    component.recipients = [
      'Recipient 1',
      'Recipient 2',
      'Recipient 3',
    ];
    component.removeRecipientChip(1);

    expect(component.recipients).toEqual([
      'Recipient 1',
      'Recipient 3',
    ]);
    expect(component.form.value.recipients).toEqual(component.recipients);

  });

  it('should track contact', () => {

    expect(component.trackContact(1, { title: 'test' })).toEqual('test');

  });

  it('should handle dropdown select', () => {

    const selectSender = {
      showDropdown: jasmine.createSpy('showDropdown'),
    };

    component.selectSender = selectSender as any;
    component.onSelectDropdown();

    expect(selectSender.showDropdown).toHaveBeenCalled();

  });

  it('should filter autocomplete', () => {

    const contacts = [
      { title: 'James Bond' },
      { title: 'Bruce Wayne' },
    ];
    const values = ['test', 'uce'];

    component.contacts = contacts;
    expect(component[`filterAutocomplete`](values)).toEqual([contacts[1]]);

  });

  it('should get screen width', () => {

    const widthSpy = spyOnProperty(window, 'innerWidth').and.returnValue(1200);

    expect(component[`getScreenWidth`]()).toEqual(PebScreen.Desktop);

    widthSpy.and.returnValue(720);
    expect(component[`getScreenWidth`]()).toEqual(PebScreen.Tablet);

    widthSpy.and.returnValue(320);
    expect(component[`getScreenWidth`]()).toEqual(PebScreen.Mobile);

  });

});
