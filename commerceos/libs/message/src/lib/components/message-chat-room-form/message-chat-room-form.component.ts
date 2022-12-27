import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, Inject, Injector } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

import { ConfirmActionDialogComponent } from '@pe/confirm-action-dialog';
import { PE_OVERLAY_CONFIG, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import {
  PeChatMessage,
  PeChatAttachMenuItem,
  PeChatChannelMenuItem,
  PeMessageContact,
  PeMessageIntegration,
} from '@pe/shared/chat';

import { PeMessageApiService, PeMessageIntegrationService } from '../../services';



@Component({
  selector: 'pe-message-chat-room-form',
  templateUrl: './message-chat-room-form.component.html',
  styleUrls: ['./message-chat-room-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageChatRoomFormComponent {

  activeChannel!: PeChatChannelMenuItem;
  attachMenuItems = [
    PeChatAttachMenuItem.Product,
  ];

  channelMenuItems!: PeChatChannelMenuItem[];
  contact?: PeMessageContact;
  productOverlayRef!: OverlayRef;
  messageList: PeChatMessage[] = [];
  sender = this.peOverlayData.sender;
  theme = this.peOverlayConfig.theme;
  mailConfig: { recipients: string[], subject: string, sender: string, testMailRecipient: string };
  recipients: string[] = [];

  items = this.peOverlayData.contactList?.map((contact: PeMessageContact) => {
    return { title: contact.name, value: contact._id };
  });

  messageAppColor = this.peMessageIntegrationService.currSettings.settings?.messageAppColor || '';
  accentColor = this.peMessageIntegrationService.currSettings.settings?.accentColor || '';
  bgChatColor = this.peMessageIntegrationService.currSettings.settings?.bgChatColor || '';

  constructor(
    private injector: Injector,
    private overlay: Overlay,
    private router: Router,
    private route: ActivatedRoute,
    private peMessageApiService: PeMessageApiService,
    public peMessageIntegrationService: PeMessageIntegrationService,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
    @Inject(PE_OVERLAY_CONFIG) public peOverlayConfig: any,
    private matDialog: MatDialog,
  ) {
    this.mailConfig = peOverlayData.mailConfig;
    this.recipients = peOverlayData.recipients;
  }

  onClose(): void {
    this.peOverlayData.onCloseSubject$.next(true);
  }

  onSelected(event: any): void {
    const foundContact = this.peOverlayData.contactList
      .find((contact: PeMessageContact) => contact._id === event.value);

    if (foundContact) {
      this.contact = foundContact;
      this.activeChannel = foundContact.communications[0]?.integrationName ?? PeMessageIntegration.WhatsApp;
      this.channelMenuItems = foundContact.communications.map((communucation: any) => {
        return communucation.integrationName;
      });
    }
  }

  sendMessage(event: any): void {
    if (!this.contact) {
      this.matDialog.open(ConfirmActionDialogComponent, {
        panelClass: 'message-confirm-dialog',
        hasBackdrop: true,
        backdropClass: 'confirm-dialog-backdrop',
        data: {
          title: 'No contact',
          subtitle: `There is no such contact in the list, please find use a valid contact.`,
          confirmButtonTitle: 'OK',
          theme: this.theme,
        },
      });

      return;
    }
    this.peOverlayData.onCloseSubject$.next({
      contact: this.contact?._id,
      content: event.message,
      integrationName: this.activeChannel,
    });
  }

  channelMenuItem(channel: PeChatChannelMenuItem): void {
    this.activeChannel = channel;
  }

  attachMenuItem(item: PeChatAttachMenuItem): void {
    if (item === PeChatAttachMenuItem.Product) {
      this.router.navigate(['products'], { relativeTo: this.route });
    }
  }
}
