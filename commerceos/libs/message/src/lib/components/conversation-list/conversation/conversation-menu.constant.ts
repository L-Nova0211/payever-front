import { PeGridMenu } from '@pe/grid';

import { PeMessageConversationActionsEnum } from '../../../enums';

export const PE_MESSAGE_CONVERSATION_MENU: PeGridMenu = {
  items: [
    {
      label: 'message-app.sidebar.add_to_folder',
      value: PeMessageConversationActionsEnum.AddToFolder,
    },
    {
      label: 'message-app.sidebar.exclude_from_current_folder',
      value: PeMessageConversationActionsEnum.ExcludeFromFolder,
      hidden: true,
    },
    {
      label: 'message-app.sidebar.delete_and_leave',
      value: PeMessageConversationActionsEnum.LeaveChat,
    },
    {
      label: 'message-app.sidebar.delete',
      value: PeMessageConversationActionsEnum.Delete,
      hidden: true,
    },
  ],
  showCloseButton: false,
  title: 'message-app.sidebar.options',
};
