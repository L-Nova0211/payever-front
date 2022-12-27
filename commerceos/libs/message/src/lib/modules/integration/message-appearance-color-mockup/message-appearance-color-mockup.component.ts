import { Component, ChangeDetectionStrategy, Input, HostListener, Output, EventEmitter } from '@angular/core';

import { PeMessageIntegrationSettings } from '@pe/shared/chat';

@Component({
  selector: 'pe-message-appearance-color-mockup',
  templateUrl: './message-appearance-color-mockup.component.html',
  styleUrls: ['./message-appearance-color-mockup.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageAppearanceColorMockupComponent {

  @Input() selected = false;
  @Input() title = '';
  @Input() bgChatColor = PeMessageIntegrationSettings.bgChatColor;
  @Input() messagesTopColor = PeMessageIntegrationSettings.messagesTopColor;
  @Input() messagesBottomColor = PeMessageIntegrationSettings.messagesBottomColor;

  @Output() selectColor = new EventEmitter<boolean>();

  @HostListener('click', ['$event'])
  onClick(event: any) {
    event.preventDefault();
    this.selected = true;
    this.selectColor.emit(true);
  }
}
