import { PeGridMenu } from '@pe/grid';

import { PeMessageConversationListActionsEnum } from '../../enums';

export const PE_MESSAGE_CONVERSATION_LIST_MENU: PeGridMenu = {
  items: [
    {
      label: 'message-app.sidebar.mail',
      value: PeMessageConversationListActionsEnum.CreateMailMessage,
      hidden: false,
    },
    {
      label: 'message-app.sidebar.channel',
      value: PeMessageConversationListActionsEnum.CreateChannel,
    },
  ],
  showCloseButton: false,
  title: 'message-app.sidebar.add_new',
};
