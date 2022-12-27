import { ChangeDetectionStrategy, Component, HostBinding, Inject } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { combineLatest } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

import { OverlayHeaderConfig, PE_OVERLAY_DATA } from '@pe/overlay-widget';
import { PeMessageChat, PeMessageChatType, PeMessageIntegration, PeMessageChannelRoles } from '@pe/shared/chat';

import { PeMessageForwardChatData } from '../../interfaces';
import { PeMessageConversationService } from '../../services';

@Component({
  selector: 'pe-message-forward-form',
  templateUrl: './message-forward-form.component.html',
  styleUrls: ['./message-forward-form.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageForwardFormComponent {
  @HostBinding('class') theme = this.peOverlayConfig.theme;

  public readonly forwardConversationList = new FormGroup({
    searchFilter: new FormControl(['']),
  });

  public readonly filteredChatList$ = combineLatest([
    this.forwardConversationList.controls.searchFilter.valueChanges.pipe(startWith('')),
    this.peMessageConversationService.conversationList$,
  ]).pipe(
    map(([filter, conversationList]) => conversationList.reduce((conversationList, conversation) => {
      conversation.id !== this.peMessageConversationService.activeConversation$.value.id
        && this.isForm(conversation.data)
        && conversation.title.toLocaleLowerCase().includes(filter.toLocaleLowerCase())
        && conversationList.push({
          _id: conversation.id,
          avatar: conversation.image,
          description: conversation.data.integrationName === 'email'
            ? this.getLastMessageContent(conversation.data)
            : conversation.data.description,
          initials: conversation.data.initials,
          title: conversation.title,
        });

      return conversationList;
    }, [])));

  constructor(
    @Inject(PE_OVERLAY_DATA) public peOverlayConfig: OverlayHeaderConfig,
    @Inject(PE_OVERLAY_DATA) public peOverlayData: PeMessageForwardChatData,

    private peMessageConversationService: PeMessageConversationService,
  ) { }

  private get currentUserId(): string {
    return this.peMessageConversationService.currentUserId;
  }

  private isForm(chat: PeMessageChat): boolean {
    return this.checkType(chat)
      ? false
      : this.liveChatCheck(chat);
  }

  private liveChatCheck(chat): boolean {
    return this.peOverlayData.isLiveChat
      ? chat.type !== PeMessageChatType.IntegrationChannel
      : this.isGroup(chat) || this.isChannel(chat)
        ? this.isMemberHasRight(chat)
        : true;
  }

  private checkType(chat): boolean {
    return chat.integrationName === PeMessageIntegration.Email
      || chat.template
      || chat.type === PeMessageChatType.AppChannel
      || chat.app;
  }

  private isGroup(chat): boolean {
    return chat.type === PeMessageChatType.Group;
  }

  private isChannel(chat): boolean {
    return chat.type === PeMessageChatType.Channel;
  }

  private isMemberHasRight(chat, permission = 'sendMessages'): boolean {
    const member = chat?.members?.find((member: any) => member?.user === this.currentUserId);

    return member?.role === PeMessageChannelRoles.Admin || chat?.permissions?.[permission];
  }

  private getLastMessageContent(chat: PeMessageChat): string | null {
    if (chat.messages?.length) {
      const filteredMessages = chat.messages.filter(message => {
        return !message.deletedForUsers?.includes(this.currentUserId);
      });
      const length = filteredMessages.length;
      const lastMessage = filteredMessages[length - 1];

      if (
        lastMessage &&
        lastMessage.content &&
        lastMessage.type !== 'template' &&
        lastMessage.content !== '{#empty#}'
      ) {
        return lastMessage.content.length > 22 ? lastMessage.content.slice(0, 22) + '…' : lastMessage.content;
      }
    }

    return null;
  }

  public forwardMessage(chat: PeMessageChat): void {
    this.peOverlayData.onChatSelectSubject$.next(chat);
  }
}
