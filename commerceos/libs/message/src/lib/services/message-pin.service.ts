import { Injectable } from '@angular/core';
import { cloneDeep } from 'lodash-es';
import { Observable, of } from 'rxjs';

import { PeChatMessage } from '@pe/shared/chat';

import { PeMessageWebsocketType } from '../enums';

import { PeMessageApiService } from './message-api.service';
import { PeMessageChatRoomListService } from './message-chat-room-list.service';
import { PeMessageManagementService } from './message-management.service';
import { PeMessageWebSocketService } from './message-web-socket.service';

@Injectable()
export class PeMessagePinService {
	pinnedMessages: PeChatMessage[] = [];

	constructor(
		private peMessageApiService: PeMessageApiService,
		private peMessageWebSocketService: PeMessageWebSocketService,
		private peMessageManagementService: PeMessageManagementService,
		private peMessageChatRoomListService: PeMessageChatRoomListService,
	) { }

	public updatePinnedMessages(message) {
		this.pinnedMessages = this.pinnedMessages.filter(m => m._id !== message.pinned.messageId);
	}

	public pinMessage(message): Observable<any>  {
		const pinnedMessage = cloneDeep(message);
		this.pinnedMessages = ([...this.pinnedMessages, pinnedMessage])
			.sort((a, b) => a.createdAt > b.createdAt ? 1 : -1);
		const chat = this.peMessageChatRoomListService.activeChat;

    if (!chat?.business) {
			return of(null);
		}

		return this.peMessageApiService.pinMessage(chat.business, message.chat, message._id, true);
	}

	public unpinMessage(message): void {
		const chat = this.peMessageChatRoomListService.chatList.find(c => c._id === message.chat);
		if (!chat?.business) {
			return;
		}

		const pinned = chat.pinned.find(pM => pM.messageId === message._id);
		if (!pinned) {
			return;
		}

		this.peMessageWebSocketService.unpinMessage(
			chat.websocketType ?? PeMessageWebsocketType.Regular,
			{ pinId: pinned._id , chatId: chat._id },
		);

		this.pinnedMessages = this.pinnedMessages.filter(pM => pM._id !== message._id);
	}
}
