import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';

import { MessageChatDialogService } from '../../services';

@Component({
  selector: 'pe-message-delete-for-everyone-template',
  templateUrl: './delete-template.component.html',
  styleUrls: ['./delete-template.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})

export class PeMessageDeleteTemplateComponent {
  @Output() toggleButtonChangedEmit = new EventEmitter<boolean>();

  constructor(
    private messageChatDialogService: MessageChatDialogService,
  ){}

  toggleButtonChanged($event){
    this.messageChatDialogService.setDeleteEveryone($event);
    this.toggleButtonChangedEmit.emit($event);
  }
}