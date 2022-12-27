import { Inject, Injectable } from '@angular/core';


import { PE_ENV } from '@pe/common';
import { PeChatChannelMenuItem } from '@pe/shared/chat';

import { PeMessageChatRoomService } from './message-chat-room.service';
import { PeMessageService } from './message.service';

@Injectable()
export class PeMessageAppsService {
  private appsImages = {
    whatsapp: [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/whatsapp-3.png`,
    ],
    'facebook-messenger': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/fb-messenger-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/fb-messenger-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/fb-messenger-3.png`,
    ],
    'live-chat': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/live-chat-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/live-chat-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/live-chat-3.png`,
    ],
    'instagram-messenger': [
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/instagram-1.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/instagram-2.png`,
      `${this.environmentConfigInterface.custom.cdn}/icons-messages/instagram-3.png`,
    ],
  };

  get images(): any {
    return this.appsImages;
  }

  constructor(
    public peMessageService: PeMessageService,
    public peMessageChatRoomService: PeMessageChatRoomService,
    @Inject(PE_ENV) public environmentConfigInterface: any,
  ) { }

  appsMenuItem(item: { app: string; image: string }): void {
    const foundApp = this.peMessageService.subscriptionList.find(s => s.integration.name === item.app);

    let action, provider;

    switch (item.app) {
      case PeChatChannelMenuItem.FacebookMessenger: {
        if (foundApp) {
          action = `https://facebook.com/${foundApp.info?.pageId}`;
        }
        break;
      }
      case PeChatChannelMenuItem.WhatsApp: {
        if (foundApp) {
          action = `https://wa.me/${foundApp.info?.phoneNumber}`;
        }
        break;
      }
      case PeChatChannelMenuItem.Instagram: {
        if (foundApp) {
          action = `https://www.instagram.com/${foundApp.info?.username}`;
        }
        break;
      }
      case PeChatChannelMenuItem.LiveChat: {
        if (foundApp) {
          action = foundApp.info?.authorizationId ?? foundApp.authorizationId;
          provider = { name: PeChatChannelMenuItem.LiveChat };
        }
        break;
      }
    }

    const event = {
      type: 'template',
      components: [
        {
          type: 'header',
          parameters: [
            {
              type: 'image',
              image: {
                link: item.image,
                provider,
              },
              action: action,
            },
          ],
        },
      ],
    };

    this.peMessageChatRoomService.sendMessage(event);
  }
}
