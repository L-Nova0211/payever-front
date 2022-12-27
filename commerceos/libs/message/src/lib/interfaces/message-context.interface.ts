import { ContextMenuListItem } from '@pe/ui';

import { PeMessageChatRoomContextActions } from '../enums';

export interface PeMessageContext {
  title: string,
  list: PeMessageContextMenuItems[],
};

export interface PeMessageContextMenuItems extends ContextMenuListItem {
    prefix?: string,
    items?: Object[],
    actions?: PeMessageChatRoomContextActions,
    icon?: string,
};

