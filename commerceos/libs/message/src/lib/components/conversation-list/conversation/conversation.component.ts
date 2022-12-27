import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Injector, Input, OnInit } from '@angular/core';

import { GridBaseItemClassDirective } from '@pe/grid';
import { PeChatMessage, PeMessageChannelMemberByCategory, PeMessageChannelType } from '@pe/shared/chat';

import { PeMessageConversationInterface } from '../../../interfaces';
import { PeMessageManagementService, PeMessageConversationService } from '../../../services';

interface CurrentChatsDraft {
  message: string;
  id: string;
}

@Component({
  selector: 'pe-message-conversation',
  templateUrl: './conversation.component.html',
  styleUrls: ['./conversation.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageConversationComponent extends GridBaseItemClassDirective implements OnInit {
  public conversation = null;

  @Input() typingMembers: PeMessageChannelMemberByCategory[];

  @HostBinding('class') get _theme() {
    return this.theme;
  }

  @HostListener('contextmenu', ['$event']) onContextMenu(event: PointerEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.openContextMenu(event);
  }

  constructor(
    protected injector: Injector,
    private peMessageConversationService: PeMessageConversationService,
    private peChatManagementService: PeMessageManagementService,
  ) {
    super(injector);
  }

  @HostBinding('class.active')
  public get isConversationActive(): boolean {
    const { activeConversation$ } = this.peMessageConversationService;


    return window.innerWidth > 720
      && this.item
      && activeConversation$.value
      && this.item.id === activeConversation$.value.id;
  }

  ngOnInit(): void {
    this.conversation = this.conversationData();
  }

  public isUnreadedMessage = (message: PeChatMessage, activeUser): boolean =>
    !this.peChatManagementService.isMessageRead(message, activeUser);

  private conversationData(): PeMessageConversationInterface {
    const { accentColor, activeUser, draft, initials, messages, lastMessages, subType, updatedAt } = this.item?.data;
    const messagesList = lastMessages ?? messages ?? [];
    const isLastMessageAttachment = (): boolean => {
      const { attachments } = [...messagesList].pop() ?? { attachments: null };

      return attachments && !!attachments?.length;
    };
    const isPrivateChannel = subType === PeMessageChannelType.Private;
    const lastMessage = (): PeChatMessage => {
      return draft
        ? draft
        : messagesList
          .filter(message => !message.deletedForUsers?.includes(activeUser?._id))
          .pop() ?? { content: null, type: null, updatedAt };
    };
    const lastMessageContent = (): string => {
      const { content, type } = lastMessage();
      const regExp = /(\<(\/?[^>]+)>)/g;

      return content && type !== 'template' && content !== '{#empty#}'
        ? content.replace(regExp, '')
        : null;
    };
    const unreadMessages = (): number =>
      messagesList.length ? messagesList.filter(message =>
        this.isUnreadedMessage(message, activeUser)).length : null;

    const today = new Date();

    const isUpdatedToday = (updatedAt?: Date): boolean => {
      if (!updatedAt) {
        return false;
      }

      const updatedAtDate = new Date(updatedAt);

      return (
        updatedAtDate.getDate() === today.getDate() &&
        updatedAtDate.getMonth() === today.getMonth() &&
        updatedAtDate.getFullYear() === today.getFullYear()
      );
    };

    if (draft) {
      let draftToSave = { message: draft.content, id: draft.chat } as CurrentChatsDraft;
      if (sessionStorage.getItem('current_chats_draft')) {
        const currentChatsDraft = JSON.parse(sessionStorage.getItem('current_chats_draft')) as CurrentChatsDraft[];
        const currentChatIndex = currentChatsDraft.findIndex(chat => chat.id === draft.chat);
        if (currentChatIndex !== -1) {
          currentChatsDraft[currentChatIndex] = draftToSave;
        } else {
          currentChatsDraft.push(draftToSave);
        }
        sessionStorage.setItem('current_chats_draft', JSON.stringify(currentChatsDraft));
      } else {
        sessionStorage.setItem('current_chats_draft', JSON.stringify([draftToSave]));
      }
    }

    return {
      accentColor,
      draft,
      integrationName: '',
      initials,
      isLastMessageAttachment: isLastMessageAttachment(),
      isPrivateChannel,
      lastMessage: lastMessageContent(),
      showTag: this.item?.data && messages && this.showTag(activeUser, messages, this.isUnreadedMessage),
      unreadMessages: unreadMessages(),
      updatedAt: lastMessage().updatedAt,
      isUpdatedToday: isUpdatedToday(lastMessage().updatedAt),
    };
  }

  public showTag(activeUser, messages, isUnreadedMessage): boolean {
    return this.peMessageConversationService.taggedMessage(activeUser, messages)
      || this.peMessageConversationService.userIsTagged(activeUser, messages, isUnreadedMessage);
  }

  public setConversationAsActive(): void {
    this.actionClick.emit(this.item);
  }

  public openContextMenuItem(event): void {
    this.openContextMenu(event);
  }
}
