import { Inject, Injectable } from '@angular/core';
import { forkJoin, Observable } from 'rxjs';
import { map, tap } from 'rxjs/operators';

import { PE_ENV } from '@pe/common';
import { TranslateService } from '@pe/i18n-core';
import { PeChatAttachFileUpload, PeChatThumbs, PeMessageConversationMemberAddMethod } from '@pe/shared/chat';

import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageChatRoomService } from './message-chat-room.service';
import { PeMessageManagementService } from './message-management.service';
import { PeMessageService } from './message.service';

@Injectable({
  providedIn: 'root',
})
export class PeMessageFileUploadService {

  constructor(
    private peMessageService: PeMessageService,
    private translateService: TranslateService,
    private peMessageApiService: PeMessageApiService,
    @Inject(PE_ENV) public environmentConfigInterface: any,
    private peMessageChatRoomService: PeMessageChatRoomService,
    private messageManagementService: PeMessageManagementService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
  ) { }

  public attachFileUpload(data: PeChatAttachFileUpload) {
    const activeChat: any = this.peMessageChatRoomListService.activeChat;

    if (
      activeChat.currentMember?.permissions?.sendMedia === false
      && activeChat.currentMember.addMethod !== PeMessageConversationMemberAddMethod.Owner
    ) {
      this.peMessageService.alert(this.translateService.translate('message-app.permissions.send-media'));

      return;
    }
    this.messageManagementService.createLoadingMessage(data.files[0]);

    let filesUploadArr$: Observable<any>[] = [];
    filesUploadArr$ = data.files.map((file) => {
      return this.peMessageApiService.postFile(file).pipe(
        map((res) => {
          return { res, file };
        })
      );
    });

    forkJoin(filesUploadArr$).pipe(tap(files => this.sendMessageAfterUpload(files, data))).subscribe();
  }

  private sendMessageAfterUpload(files, data) {
    const url = PeChatThumbs.Files as string;
    const event = {
      type: 'text',
      message: data.text || '{#empty#}',
      attachments: files.map((response) => {

        return {
          mimeType: response.file.type,
          size: response.file.size,
          title: data.text,
          url,
          data: {
            url: data.url
            || `${this.environmentConfigInterface.custom.storage}/message/${response.res.body.blobName}`,
          },
        };
      }),
    };

    this.peMessageChatRoomService.sendMessage(event);
  }
}