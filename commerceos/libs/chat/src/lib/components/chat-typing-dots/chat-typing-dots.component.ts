import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';

import { TranslateService } from '@pe/i18n-core';
import { PeMessageChannelMemberByCategory } from '@pe/shared/chat';

@Component({
  selector: 'pe-chat-typing-dots',
  templateUrl: './chat-typing-dots.component.html',
  styleUrls: ['./chat-typing-dots.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeChatTypingDotsComponent {
  constructor(
    private translateService: TranslateService,
  ) { }

  @Input() messageAppColor = '';

  @Input() userTyping: PeMessageChannelMemberByCategory[];

  @Input() truncateLength: number;

  @Output() clickByAvatar = new EventEmitter<boolean>();

  clickOnAvatar(): void {
    this.clickByAvatar.emit(true);
  }
}