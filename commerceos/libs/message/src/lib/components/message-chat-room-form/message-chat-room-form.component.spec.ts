import { Overlay } from '@angular/cdk/overlay';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeChatAttachMenuItem, PeChatChannelMenuItem } from '@pe/shared/chat';

import { PeMessageApiService, PeMessageIntegrationService } from '../../services';
import { PeMessageChatRoomFormComponent } from './message-chat-room-form.component';

describe('PeMessageChatRoomFormComponent', () => {
  let fixture: ComponentFixture<PeMessageChatRoomFormComponent>;
  let component: PeMessageChatRoomFormComponent;
  let router: jasmine.SpyObj<Router>;
  let matDialog: jasmine.SpyObj<MatDialog>;
  let peOverlayData: {
    sender: string;
    contactList: { _id: string; name: string }[];
    mailConfig: any;
    recipients: string[];
    onCloseSubject$: {
      next: jasmine.Spy;
    };
  };
  let peMessageIntegrationService: {
    currSettings: {
      settings: any;
    };
  };

  const activatedRoute: any = { test: 'activated.route' };
  const peOverlayConfig = { theme: 'light' };

  beforeEach(
    waitForAsync(() => {
      const routerSpy = jasmine.createSpyObj<Router>('Router', ['navigate']);

      peMessageIntegrationService = {
        currSettings: {
          settings: null,
        },
      };

      peOverlayData = {
        sender: 'James Bond',
        contactList: [
          {
            _id: 'c-001',
            name: 'Contact 1',
          },
          {
            _id: 'c-002',
            name: 'Contact 2',
          },
        ],
        mailConfig: { test: 'mail.config' },
        recipients: ['recipient.1'],
        onCloseSubject$: {
          next: jasmine.createSpy('next'),
        },
      };

      const matDialogSpy = jasmine.createSpyObj<MatDialog>('MatDialog', ['open']);

      TestBed.configureTestingModule({
        declarations: [PeMessageChatRoomFormComponent],
        providers: [
          { provide: Overlay, useValue: null },
          { provide: Router, useValue: routerSpy },
          { provide: ActivatedRoute, useValue: activatedRoute },
          { provide: PeMessageApiService, useValue: null },
          { provide: PeMessageIntegrationService, useValue: peMessageIntegrationService },
          { provide: PE_OVERLAY_DATA, useValue: peOverlayData },
          { provide: PE_OVERLAY_CONFIG, useValue: peOverlayConfig },
          { provide: MatDialog, useValue: matDialogSpy },
        ],
        schemas: [NO_ERRORS_SCHEMA],
      })
        .compileComponents()
        .then(() => {
          fixture = TestBed.createComponent(PeMessageChatRoomFormComponent);
          component = fixture.componentInstance;

          router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
          matDialog = TestBed.inject(MatDialog) as jasmine.SpyObj<MatDialog>;
        });
    }),
  );

  it('should be defined', () => {
    fixture.detectChanges();

    expect(component).toBeDefined();
  });

  it('should set color props on construct', () => {
    /**
     * peMessageService.currSettings.settings is null
     */
    expect(component.messageAppColor).toEqual('');
    expect(component.accentColor).toEqual('');
    expect(component.bgChatColor).toEqual('');

    /**
     * peMessageService.currSettings.settings is set
     */
    peMessageIntegrationService.currSettings.settings = {
      messageAppColor: '#333333',
      accentColor: '#222222',
      bgChatColor: '#111111',
    };

    fixture = TestBed.createComponent(PeMessageChatRoomFormComponent);
    component = fixture.componentInstance;

    expect(component.messageAppColor).toEqual('#333333');
    expect(component.accentColor).toEqual('#222222');
    expect(component.bgChatColor).toEqual('#111111');
  });

  it('should set sender, theme & items on construct', () => {
    expect(component.sender).toEqual(peOverlayData.sender);
    expect(component.theme).toEqual(peOverlayConfig.theme);
    expect(component.items).toEqual(
      peOverlayData.contactList.map((c: any) => ({
        title: c.name,
        value: c._id,
      })),
    );
  });

  it('should handle close', () => {
    component.onClose();

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith(true);
  });

  it('should handle selected', () => {
    const event = { value: 'c-003' };
    const contact = {
      _id: 'c-001',
      name: 'Contact 1',
      communications: [],
    };

    peOverlayData.contactList = [contact];

    /**
     * contact does not exist in peOverlayData.contactList
     */
    component.onSelected(event);

    expect(component.contact).toBeUndefined();
    expect(component.activeChannel).toBeUndefined();
    expect(component.channelMenuItems).toBeUndefined();

    /**
     * contact exists in peOverlayData.contactList
     * contact.communications is [] (empty array)
     */
    event.value = contact._id;
    component.onSelected(event);

    expect(component.contact).toEqual(contact as any);
    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.WhatsApp);
    expect(component.channelMenuItems).toEqual([]);

    /**
     * contact.communications is set
     */
    contact.communications = [
      { integrationName: PeChatChannelMenuItem.FacebookMessenger },
      { integrationName: PeChatChannelMenuItem.WhatsApp },
    ] as any;

    component.onSelected(event);

    expect(component.contact).toEqual(contact as any);
    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.FacebookMessenger);
    expect(component.channelMenuItems).toEqual([
      PeChatChannelMenuItem.FacebookMessenger,
      PeChatChannelMenuItem.WhatsApp,
    ]);
  });

  it('should send message', () => {
    const event = { message: 'message' };

    /**
     * component.contact is null
     */
    component.activeChannel = PeChatChannelMenuItem.WhatsApp;
    component.contact = null;
    component.sendMessage(event);

    expect(matDialog.open).toHaveBeenCalledWith(ConfirmActionDialogComponent, {
      panelClass: 'message-confirm-dialog',
      hasBackdrop: true,
      backdropClass: 'confirm-dialog-backdrop',
      data: {
        title: 'No contact',
        subtitle: `There is no such contact in the list, please find use a valid contact.`,
        confirmButtonTitle: 'OK',
        theme: peOverlayConfig.theme,
      },
    });
    expect(peOverlayData.onCloseSubject$.next).not.toHaveBeenCalled();

    /**
     * component.contact is set
     */
    matDialog.open.calls.reset();

    component.contact = { _id: 'c-001' } as any;
    component.sendMessage(event);

    expect(peOverlayData.onCloseSubject$.next).toHaveBeenCalledWith({
      contact: 'c-001',
      content: event.message,
      integrationName: PeChatChannelMenuItem.WhatsApp,
    });
    expect(matDialog.open).not.toHaveBeenCalled();
  });

  it('should set active channel', () => {
    component.channelMenuItem(PeChatChannelMenuItem.FacebookMessenger);

    expect(component.activeChannel).toEqual(PeChatChannelMenuItem.FacebookMessenger);
  });

  it('should attach menu item', () => {
    /**
     * item is 'file'
     */
    component.attachMenuItem(PeChatAttachMenuItem.File);

    expect(router.navigate).not.toHaveBeenCalled();

    /**
     * item is 'product'
     */
    component.attachMenuItem(PeChatAttachMenuItem.Product);

    expect(router.navigate).toHaveBeenCalledWith(['products'], { relativeTo: activatedRoute });
  });
});
