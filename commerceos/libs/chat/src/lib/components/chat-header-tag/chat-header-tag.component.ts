import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { SafeStyle } from '@angular/platform-browser';

import { PeAuthService } from '@pe/auth';
import { PeDestroyService } from '@pe/common';
import { MediaService } from '@pe/media';
import { PeMessageChat, PeMessageChatType } from '@pe/shared/chat';

@Component({
    selector: 'pe-chat-header-tag',
    templateUrl: './chat-header-tag.component.html',
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [PeDestroyService],
})
export class PeChatHeaderTagComponent implements OnInit {
    @Input() chat: PeMessageChat;
    @Input() accentColor = '';
    avatar: SafeStyle = '';

    constructor(
        public mediaService: MediaService,
        public authService: PeAuthService,
    ) { }

    ngOnInit(): void {
        this.avatar = this.getAvatar();
    }

    getAvatar(): SafeStyle {
        if (this.chat.type === PeMessageChatType.DirectChat) {
            const userDirectChat = this.chat?.membersInfo?.find(
                    (member) => member.user._id !== this.authService.getUserData().uuid
                );
            if (userDirectChat?.user?.userAccount?.logo) {
                return this.mediaService.getMediaUrl(userDirectChat?.user?.userAccount?.logo, 'images');
            } else {
                return ''
            }
        }

        return this.chat.avatar;
    }

    getLastMessageIcon(chat: PeMessageChat): boolean {
        if (chat.messages?.length) {
            const length = chat.messages.length;
            const lastMessage = chat.messages[length - 1];

            return !!lastMessage?.attachments?.length;
        }

        return false;
    }
}
