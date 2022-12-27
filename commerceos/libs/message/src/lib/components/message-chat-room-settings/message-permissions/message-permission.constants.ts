export const MEMBER_PERMISSIONS = [
  { name: 'sendMessages', label: 'message-app.channel.settings.send-messages' },
  { name: 'sendMedia', label: 'message-app.channel.settings.send-media' },
  { name: 'addMembers', label: 'message-app.channel.settings.add-members' },
  { name: 'changeGroupInfo', label: 'message-app.channel.settings.change-group-info' },
];

export enum MessagePermissionOptions {
  addMembers = 'addMembers',
  changeGroupInfo = 'changeGroupInfo'
}
