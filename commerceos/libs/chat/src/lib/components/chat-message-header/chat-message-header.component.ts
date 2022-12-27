import { Component, Input, Output, EventEmitter } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';

import { PeChatMessageForward } from '../../interfaces';

@Component({
  selector: 'pe-chat-message-header',
  templateUrl: './chat-message-header.component.html',
  styleUrls: ['./chat-message-header.component.scss'],
})
export class ChatMessageHeaderComponent {

  @Input() avatarStyle: SafeStyle;
  @Input() sender: string;
  @Input() showAuthor: boolean;
  @Input() dateFormat: string;
  @Input() accentColor: string;
  @Input() status: string;
  @Input() grouped = false;
  @Input() date: Date;
  @Input() edited: boolean;
  @Input() forward: boolean;
  @Input() forwardBy: PeChatMessageForward;
  @Input() accentMessageColor = '';
  @Input() forwardedFrom: string;
  @Input() selected: boolean;

  @Output() timeClicking = new EventEmitter<boolean>();
  @Output() replyingMessage = new EventEmitter<MouseEvent>();
  @Output() emitGetMember = new EventEmitter<boolean>();

  timeClick(event) {
    this.timeClicking.emit(event);
  }

  getMember(){
    this.emitGetMember.emit(true);
  }

  replyMessage(event: MouseEvent) {
    event.stopPropagation();
    this.replyingMessage.emit(event);
  }
}
