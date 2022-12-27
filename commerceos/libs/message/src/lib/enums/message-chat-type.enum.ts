export enum PeMessageChatType {
  Channel = 'channel',
  IntegrationChannel = 'integration-channel',
  AppChannel = 'app-channel',
  Chat = 'chat',
  DirectChat = 'direct-chat',
  Group = 'group',
  Email = 'email',
}

export enum PeMessageWebsocketType {
  Regular = 'regular',
  Widget = 'widget',
  LiveChat = 'live-chat',
}

export enum PeMessageAddMethod {
  Owner = 'owner',
  Include = 'include',
  Invite = 'invite',
}

export enum PeContactPopupMode {
  Email = 'email',
  AddMember = 'add-member',
}
