import { Injectable, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { filter, take, takeUntil, tap } from 'rxjs/operators';

import { PeDestroyService } from '@pe/common';
import { ConfirmScreenService, Headings } from '@pe/confirmation-screen';
import { TranslateService } from '@pe/i18n-core';

import { PeMessageChatRoomListService } from './message-chat-room-list.service';


@Injectable()
export class MessageChatDialogService {

  private readonly deleteEveryOneStatusSubject = new BehaviorSubject<boolean>(false);

  constructor(
    private translateService: TranslateService,
    private confirmScreenService: ConfirmScreenService,
    private peMessageChatRoomListService: PeMessageChatRoomListService,
    private readonly destroy$: PeDestroyService,
  ) { }

  setDeleteEveryone(status: boolean): void {
    this.deleteEveryOneStatusSubject.next(status);
  }

  deleteLeaveChatDialog(activeChat, templateRef: TemplateRef<any> = null, isGridItem: boolean = true): void {
    const config: Headings = {
      confirmBtnText: this.translateService.translate('message-app.sidebar.leave'),
      declineBtnText: this.translateService.translate('message-app.sidebar.cancel'),
      subtitle: this.translateService.translate('message-app.sidebar.leave_chat_dialog').
        replace('"{channelLabel}"', activeChat.title),
      description: this.translateService.translate('message-app.sidebar.action_cannot_undone'),
      title: this.translateService.translate('message-app.channel.settings.are-you-sure'),
      customMiddleTemplate: templateRef,
    };
    this.confirmScreenService
      .show(config, true)
      .pipe(
        take(1),
        filter(Boolean),
        tap(() => {
          this.peMessageChatRoomListService.deleteChatFromSettings$.next(
            {
              leave: this.deleteEveryOneStatusSubject.getValue(),
              conversation: {
                type: isGridItem ? activeChat.data.type : activeChat.type,
                id: activeChat._id || activeChat.id,
              },
            }
          );
          this.setDeleteEveryone(false);
        }),
        takeUntil(this.destroy$),
      ).subscribe();
  }
}
