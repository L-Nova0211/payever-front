import {
  ChangeDetectionStrategy,
  Component,
  Input,
  Output,
  EventEmitter, Inject,
} from '@angular/core';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageChooseRecipientOverlayData } from '../../interfaces';

@Component({
  selector: 'pe-message-chat-list',
  templateUrl: './message-chat-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeMessageChatListComponent {
  @Input() loading = this.peOverlayData?.loading ?? true;
  @Input() accentColor: string;
  @Input() chatList = this.peOverlayData?.chatList ?? [];
  @Input() draggable = this.peOverlayData?.draggable ?? false;

  @Output() activatedChat = new EventEmitter<PeMessageChat>();
  @Output() dragStarted = new EventEmitter<PeMessageChat>();
  @Output() contextmenuClicked = new EventEmitter<{event: MouseEvent, chat: PeMessageChat}>();

  activeChat: PeMessageChat;

  constructor(
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageChooseRecipientOverlayData,
  ) {
  }

  setChatAsActive(chat: PeMessageChat) {
    this.peOverlayData?.activatedChat$?.next(chat);
    this.activatedChat.emit(chat);
  }

  dragStart(chat: PeMessageChat) {
    this.dragStarted.emit(chat);
  }

  openContextMenu(event, chat) {
    this.contextmenuClicked.emit({ event: event, chat });
  }

  public trackOption(index: number, option: PeMessageChat): PeMessageChat {
    return option;
  }
}
