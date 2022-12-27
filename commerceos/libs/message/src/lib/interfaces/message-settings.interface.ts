import { PeMessageChatAction, PeMessageChatActionItem, PeMessageChatType } from '../enums';

import { PeMessageAppearanceColorBox } from './message-appearance.interface';
import { PeMessageChannelPermissionsEnum } from './message-channel.interface';

export interface PeMessageSettings {
  currentTheme?: string;
  themes?: PeMessageIntegrationThemeItem[];
}

export interface PeMessageIntegrationThemeItem {
  isDefault?: boolean;
  _id?: string;
  name?: string;
  settings: PeMessageIntegrationThemeItemValues;
}

export interface PeMessageIntegrationThemeItemValues {
  bgChatColor?: string;
  accentColor?: string;
  messageWidgetShadow?: string;
  messagesTopColor?: string;
  messagesBottomColor?: string;
  messageAppColor?: string;
  defaultPresetColor?: number;
  customPresetColors: PeMessageAppearanceColorBox[];
}

export interface PeMessageConversationListConfig {
  todo?: string,
  initialization?: boolean,
  clearCache?: boolean,
}

export const CONVERSATION_ACTIONS: PeMessageChatActionItem[] = [
  {
    action: PeMessageChatAction.Add,
    icon: '#icon-apps-customers',
    permissions: [PeMessageChannelPermissionsEnum.AddMembers],
    types: [PeMessageChatType.Channel, PeMessageChatType.Group],
  },
  {
    action: PeMessageChatAction.Link,
    icon: '#icon-apps-link',
    permissions: [PeMessageChannelPermissionsEnum.Public],
    types: [PeMessageChatType.Channel, PeMessageChatType.Group],
  },
  {
    action: PeMessageChatAction.Edit,
    icon: '#icon-apps-edit',
    permissions: [PeMessageChannelPermissionsEnum.Change],
    types: [PeMessageChatType.Channel, PeMessageChatType.Group, PeMessageChatType.IntegrationChannel],
  },
  {
    action: PeMessageChatAction.Delete,
    icon: '#icon-apps-delete',
    permissions: [],
    types: [PeMessageChatType.Channel, PeMessageChatType.Group, PeMessageChatType.IntegrationChannel],
  },
  {
    action: PeMessageChatAction.Permissions,
    icon: '#icon-apps-more',
    permissions: [],
    types: [PeMessageChatType.Channel],
  },
];
