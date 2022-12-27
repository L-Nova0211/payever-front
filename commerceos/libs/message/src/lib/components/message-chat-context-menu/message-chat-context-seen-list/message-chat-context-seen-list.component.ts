import { Component, ChangeDetectionStrategy, Input, OnInit } from '@angular/core';

import { PeDestroyService } from '@pe/common';
import { PeChatMemberService, PeChatMessage } from '@pe/shared/chat';

import { PeMessageChatRoomListService } from '../../../services';

@Component({
  selector: 'pe-message-chat-context-seen-list',
  templateUrl: './message-chat-context-seen-list.html',
  styleUrls: ['./message-chat-context-seen-list.scss'],
  providers: [PeDestroyService],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PeMessageChatContextSeenListComponent implements OnInit {
  @Input() seenList: string[];
  members: PeChatMessage[];

  constructor(
      private peMessageChatRoomListService: PeMessageChatRoomListService,
      private peChatMessageService: PeChatMemberService,
    ) {}

  ngOnInit() {
    this.members = this.peChatMessageService.mapMemberToChat(
      this.peMessageChatRoomListService?.activeChat?.membersInfo
        .filter(member => this.seenList.includes(member?.user?._id))
    );
  }
}
