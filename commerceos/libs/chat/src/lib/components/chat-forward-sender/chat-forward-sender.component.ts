import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';

import { PeDestroyService } from '@pe/common';
import { PE_OVERLAY_DATA } from '@pe/overlay-widget';

@Component({
  selector: 'pe-chat-forward-sender',
  styleUrls: ['./chat-forward-sender.component.scss'],
  templateUrl: './chat-forward-sender.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [PeDestroyService],
})
export class PeChatForwardSenderComponent {
  constructor(
    @Inject(PE_OVERLAY_DATA) public peOverlayData: any,
  ) {
    this._senderName = this.peOverlayData.data;
  }

  _senderName = true;

  set senderName(value) {
    this._senderName = value;
    this.peOverlayData.onChangeSenderNameSubject$.next(value);
  }

  get senderName() {
    return this._senderName;
  }

  showChatDetails() {
    this.peOverlayData.onChangeRecipientSubject$.next(true);
  }

  done() {
    this.peOverlayData.onCloseSubject$.next(this.senderName);
  }
}
