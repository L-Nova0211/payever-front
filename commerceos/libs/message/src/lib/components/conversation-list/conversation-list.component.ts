import { ChangeDetectionStrategy, Component, ContentChild, Input, TemplateRef } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

import { PeGridItem } from '@pe/grid';
import { PeMessageChat } from '@pe/shared/chat';

import { PeMessageConversationComponent } from './conversation/conversation.component';

@Component({
  selector: 'pe-message-conversation-list',
  templateUrl: './conversation-list.component.html',
  styleUrls: ['./conversation-list.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConversationListComponent {
  @Input() isLoading = false;
  @Input() set conversationList({ conversationList }) {
    this.conversationList$.next(conversationList);
  }

  @ContentChild(
    TemplateRef,
    { static: false },
  ) public conversationTemplate: TemplateRef<PeMessageConversationComponent>;

  public readonly conversationList$ = new BehaviorSubject<PeGridItem<PeMessageChat>[]>([]);
}
