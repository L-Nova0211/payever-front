export interface PeMessageConversationInterface {
  accentColor: string;
  draft: string;
  integrationName: string;
  initials: string;
  isLastMessageAttachment: boolean;
  isPrivateChannel: boolean;
  lastMessage: string;
  showTag: boolean;
  unreadMessages: number;
  updatedAt: Date;
  isUpdatedToday: boolean;
}

export interface PeMessageConversationLocationInterface {
  _id: string;
  folderId: string;
  itemId?: string;
}
