import { PeMessageChatRoomContextActions, PeMessageChatRoomContextMenu } from '../enums';
import { PeMessageContext } from '../interfaces';

export const messageContextMenu =
  (isSelected, canEdit, copySelected, isMessagePinned, seenList, chatMode): PeMessageContext => {

  if (isSelected) {
    return selectedContextMenu;
  }

  if (!chatMode) {
    return selectedPinContextMenu;
  }

  return {
    title: 'message-app.chat-room.context-menu.title',
    list: [
      ...(canEdit ? [{
        label: 'message-app.chat-room.context-menu.items.edit',
        value: PeMessageChatRoomContextMenu.Edit,
      }] : []),
      {
        label: 'message-app.chat-room.context-menu.items.forward',
        value: PeMessageChatRoomContextMenu.Forward,
      },
      {
        label: 'message-app.chat-room.context-menu.items.select',
        value: PeMessageChatRoomContextMenu.Select,
      },
      {
        label: `message-app.chat-room.context-menu.items.copy${copySelected ? '_selected' : ''}`,
        value: PeMessageChatRoomContextMenu.Copy,
      },
      {
        label: 'message-app.chat-room.context-menu.items.reply',
        value: PeMessageChatRoomContextMenu.Reply,
      },
      {
        label: `message-app.chat-room.context-menu.items.${isMessagePinned ? 'un' : ''}pin`,
        value: PeMessageChatRoomContextMenu[isMessagePinned ? 'Unpin' : 'Pin'],
      },
      {
        label: 'message-app.chat-room.context-menu.items.delete',
        value: PeMessageChatRoomContextMenu.Delete,
        red: true,
      },
      ...(seenList.length ? [{
        label: '',
        value: PeMessageChatRoomContextMenu.Separator,
      },
      {
        prefix: seenList.length,
        items: seenList.slice(0, 3),
        actions: PeMessageChatRoomContextActions.SeenList,
        label: 'message-app.chat-room.context-menu.items.seen',
        value: PeMessageChatRoomContextMenu.Seen,
      }] : []),
    ],
  };
};

export const selectedContextMenu = {
  title: 'message-app.chat-room.context-menu.title',
  list: [
    {
      label: 'message-app.chat-room.context-menu.items.forward-selected',
      value: PeMessageChatRoomContextMenu.ForwardSelected,
    },
    {
      label: 'message-app.chat-room.context-menu.items.copy',
      value: PeMessageChatRoomContextMenu.CopySelected,
    },
    {
      label: 'message-app.chat-room.context-menu.items.clear-selection',
      value: PeMessageChatRoomContextMenu.ClearSelection,
    },
    {
      label: 'message-app.chat-room.context-menu.items.delete-selected',
      value: PeMessageChatRoomContextMenu.Delete,
      red: true,
    },
  ],
};

export const selectedPinContextMenu = {
  title: 'message-app.chat-room.context-menu.title',
  list: [
    {
      label: 'message-app.chat-room.context-menu.items.go-to-message',
      value: PeMessageChatRoomContextMenu.GoToMessage,
    },
    {
      label: `message-app.chat-room.context-menu.items.unpin`,
      value: PeMessageChatRoomContextMenu.Unpin,
    },
    {
      label: 'message-app.chat-room.context-menu.items.forward',
      value: PeMessageChatRoomContextMenu.Forward,
    },
    {
      label: 'message-app.chat-room.context-menu.items.copy',
      value: PeMessageChatRoomContextMenu.CopySelected,
    },
    {
      label: 'message-app.chat-room.context-menu.items.delete',
      value: PeMessageChatRoomContextMenu.Delete,
      red: true,
    },
  ],
};
