import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  HostBinding,
  Input,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { DomSanitizer, SafeStyle } from '@angular/platform-browser';

import { PeChatMessage } from '@pe/shared/chat';


@Component({
  selector: 'pe-chat-message-text',
  templateUrl: './chat-message-text.component.html',
  styleUrls: ['./chat-message-text.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
})
export class PeChatMessageTextComponent {

  _message: string;

  @Input() sender: string;
  @Input()
  set message(msg: string) {
    this._message = this.replaceNewLine(msg);
  }

  get message() {
    return this._message;
  }

  @Input() date: Date;
  @Input() dateFormat = 'shortTime';
  @Input() grouped = false;
  @Input() avatarStyle: SafeStyle;
  @Input() title: string;
  @Input() titleColor: string;
  @Input() contentColor: string;
  @Input() accentColor: string;
  @Input() replyData: PeChatMessage;

  @Output() showReplied = new EventEmitter<{event: MouseEvent, data: PeChatMessage}>();

  @HostBinding('class.pe-chat-message-text') peChatMessageText = true;

  constructor(
    protected domSanitizer: DomSanitizer,
  ) {
  }

  get previewImage(): SafeStyle {
    const attachment = this.replyData?.attachments?.find(item => item.url);

    return attachment ? this.domSanitizer.bypassSecurityTrustStyle(`url(${attachment.url})`) : null;
  }

  replaceNewLine(msg: string) {
    return msg.replace(new RegExp('\r?\n', 'g'), '<br>');
  }

  showRepliedMessage(event) {
    this.showReplied.emit({
      event,
      data: this.replyData,
    });
  }
}
