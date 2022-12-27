import { HttpClient, HttpParams } from '@angular/common/http';
import { Inject, Injectable, InjectionToken } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';

import { CosEnvService } from '@pe/base';
import { PebEnvService } from '@pe/builder-core';
import { EnvironmentConfigInterface, PE_ENV } from '@pe/common';
import { FolderItem, FolderPosition } from '@pe/folders';
import { RuleValues } from '@pe/rules';
import {
  FileUploadTypes,
  PeChatMessage,
  PeMessageChat,
  PeMessageChatInvites,
  PeMessageContact,
  PeMessageConversationUpdateOptions,
} from '@pe/shared/chat';

import { PeMessageChatType } from '../enums';
import {
  PeMessageBubble,
  PeMessageChannel,
  PeMessageFolder,
  PeMessageIntegrationThemeItem,
  PeMessageChannelInfo,
  PeMessageChatInvitation,
  PeMessageSubscription,
  PeMessageSubscriptionAll,
  PeMessageDirectChat,
  PeMessageChannelPermissions,
} from '../interfaces';

import { PeMessageService } from './message.service';

export const PE_MEDIA_API_PATH = new InjectionToken<string>('PE_MEDIA_API_PATH');
export const PE_MESSAGE_API_PATH = new InjectionToken<string>('PE_MESSAGE_API_PATH');
export const PE_PRODUCTS_API_PATH = new InjectionToken<string>('PE_PRODUCTS_API_PATH');

@Injectable()
export class PeMessageApiService {
  constructor(
    private httpClient: HttpClient,
    private cosEnvService: CosEnvService,
    private pebEnvService: PebEnvService,
    private peMessageService: PeMessageService,
    @Inject(PE_ENV) public env: EnvironmentConfigInterface,
    @Inject(PE_MEDIA_API_PATH) private peMediaApiPath: string,
    @Inject(PE_MESSAGE_API_PATH) private peMessageApiPath: string,
    @Inject(PE_PRODUCTS_API_PATH) private peProductsApiPath: string,
  ) { }

  private get currentUserId(): string {
    // need use some point to get user data from PeAuthService in common use and userData for live chat
    return this.peMessageService.getUserData().uuid;
  }

  private get isPersonalMode(): boolean {
    return this.cosEnvService.isPersonalMode;
  }

  private get businessId(): string {
    return this.pebEnvService.businessId;
  }

  private get applicationId(): string {
    return this.pebEnvService.applicationId;
  }

  private get businessPath(): string {
    return `${this.peMessageApiPath}/api/business/${this.businessId}`;
  }

  // admin/chat-templates
  private get chatTemplatesPath(): string {
    return `${this.peMessageApiPath}/api/admin/chat-templates`;
  }

  public postChatTemplate(chatTemplate: any): Observable<any> {
    return this.httpClient.post(this.chatTemplatesPath, chatTemplate);
  }

  public getChatTemplateList(): Observable<any> {
    return this.httpClient.get(this.chatTemplatesPath);
  }

  public getChatTemplate(chatTemplateId: string): Observable<any> {
    return this.httpClient.get(`${this.chatTemplatesPath}/${chatTemplateId}`);
  }

  public patchChatTemplate(chatTemplate: any): Observable<any> {
    return this.httpClient.patch(`${this.chatTemplatesPath}/${chatTemplate._id}`, chatTemplate);
  }

  public deleteChatTemplate(chatTemplateId: string): Observable<any> {
    return this.httpClient.delete(`${this.chatTemplatesPath}/${chatTemplateId}`);
  }

  // admin/message-templates
  public postMessageTemplate(chatTemplateId: string, messageTemplate: any): Observable<any> {
    return this.httpClient.post(`${this.chatTemplatesPath}/${chatTemplateId}/messages`, messageTemplate);
  }

  public getMessageTemplateList(chatTemplateId: string): Observable<any> {
    return this.httpClient.get(`${this.chatTemplatesPath}/${chatTemplateId}/messages`);
  }

  public getMessageTemplate(chatTemplateId: string, messageTemplateId: string): Observable<any> {
    return this.httpClient.get(`${this.chatTemplatesPath}/${chatTemplateId}/messages/${messageTemplateId}`);
  }

  public patchMessageTemplate(chatTemplateId: string, messageTemplate: any): Observable<any> {
    return this.httpClient
      .patch(`${this.chatTemplatesPath}/${chatTemplateId}/messages/${messageTemplate._id}`, messageTemplate);
  }

  public deleteMessageTemplate(chatTemplateId: string, messageTemplateId: string): Observable<any> {
    return this.httpClient.delete(`${this.chatTemplatesPath}/${chatTemplateId}/messages/${messageTemplateId}`);
  }

  // apps/channels
  private get messagingPath(): string {
    return `${this.businessPath}/messaging`;
  }

  public getAppsChannelList(options = {}): Observable<any> {
    return this.httpClient.get(this.messagingPath, this.makeParams(options));
  }

  public getIntegrationChannelList(options = {}): Observable<any> {
    return this.httpClient.get(this.messagingPath, this.makeParams(options));
  }

  public getAppsChannel(appName: string): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/${appName}`);
  }

  // conversations
  public getConversationList(folderId?: string): Observable<any> {
    let queryParams = new HttpParams();

    if (folderId) {
      queryParams = queryParams.append('parentFolderId', folderId);
    }

    return this.httpClient.get(this.messagingPath, { params: queryParams });
  }

  // Messaging
  public getConversation(conversationId: string, appType: string): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/${appType}/${conversationId}`);
  }

  patchConversation(
    conversationId: string,
    appType: string,
    conversation: PeMessageChannel,
    business: string = this.pebEnvService.businessId
  ): Observable<any> {
    return this.httpClient.patch(
      `${this.peMessageApiPath}/api/business/${business}/messaging/${appType}/${conversationId}`,
      conversation,
    );
  }

  public postConversationPermissions(
    businessId: string,
    conversationId: string,
    appType: string,
    conversation: PeMessageChannelPermissions,
  ): Observable<any> {
    return this.httpClient.post(
      `${this.peMessageApiPath}/api/business/${businessId}/messaging/${appType}/${conversationId}/permissions`,
      conversation,
    );
  }

  public deleteAppConversation(
    conversationId: string,
    conversationType: PeMessageChatType,
    businessId = this.businessId,
  ): Observable<any> {
    return this.httpClient
      .delete(`${this.peMessageApiPath}/api/business/${businessId}/messaging/${conversationType}/${conversationId}`);
  }

  public getConversationById(conversationId: string): Observable<PeMessageChat[]> {
    return this.httpClient.get<PeMessageChat[]>(`${this.messagingPath}?filter={"_id":"${conversationId}"}`);
  }

  // Messaging-Members
  public getConversationMembers(conversationType: PeMessageChatType, conversationId: string): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/${conversationType}/${conversationId}/members`);
  }

  public getMutualMembers(userId: string): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/mutual/${userId}`);
  }

  public postConversationMemberUpdate(
    channelId: string,
    memberId: string,
    conversationType: PeMessageChatType,
    options: PeMessageConversationUpdateOptions,
  ): Observable<any> {
    return this.httpClient
      .post(`${this.messagingPath}/${conversationType}/${channelId}/members/${memberId}/update`, options);
  }

  public postConversationMemberInclude(
    channelId: string,
    memberId: string,
    conversationType: PeMessageChatType,
  ): Observable<any> {
    return this.httpClient
      .post(`${this.messagingPath}/${conversationType}/${channelId}/members/${memberId}/include`, { });
  }

  private get chatsPath(): string {
    return `${this.businessPath}/chats`;
  }

  public postConversationMemberInvite(channelId: string, memberId: string, chatInviteId: string): Observable<any> {
    return this.httpClient
      .post(`${this.chatsPath}/${channelId}/invites/${chatInviteId}/send-to-contact/${memberId}`, { });
  }

  public postChannelEmailInvite(channelId: string, email: string, chatInviteId: string): Observable<any> {
    return this.httpClient
      .post(`${this.chatsPath}/${channelId}/invites/${chatInviteId}/send-to-email/${email}`, { });
  }

  public postDirectChatInviteByEmail(email: string): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/direct-chat/invite-email/${email}`, { });
  }

  public postConversationMemberExclude(
    channelId: string,
    memberId: string,
    conversationType: PeMessageChatType,
    businessId = this.businessId,
  ): Observable<any> {
    return this.httpClient.post(
      `${this.peMessageApiPath}/api/business/${businessId}/messaging/${conversationType}` +
      `/${channelId}/members/${memberId}/exclude`,
      { },
    );
  }

  public getConversationMemberInfo(channelId: string, memberId: string,
                                   businessId = this.businessId,): Observable<any> {
    return this.httpClient.get(`${this.peMessageApiPath}/api/business/${businessId}` +
      `/messaging/channel/${channelId}/members/user/${memberId}`);
  }

  // Invitations
  public getInvitations(chatInviteCode: string): Observable<any> {
    return this.httpClient.get(`${this.peMessageApiPath}/api/invitations/${chatInviteCode}`);
  }

  public postInvitations(chatInviteCode: string): Observable<any> {
    return this.httpClient.post(`${this.peMessageApiPath}/api/invitations/${chatInviteCode}/join`, { });
  }

  public getPublicChannelsBySlug(slug: string): Observable<any> {
    return this.httpClient.get(`${this.peMessageApiPath}/api/public-channels/by-slug/${slug}`);
  }

  // Messaging - Apps-channels
  public getAppChannels(conversationType: PeMessageChatType): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/app-channels/${conversationType}`);
  }

  public getAppChannelByName(name: string): Observable<any> {
    return this.httpClient.get(`${this.messagingPath}/app-channel/by-name/${name}`);
  }

  // Messaging - Common-channels

  postChannel(channel: PeMessageChannel): Observable<any> {
    return this.httpClient.post(this.getBackendMessagingChannelUrl(), channel);
  }

  patchChannel(
    channelId: string, channel: PeMessageChannel, business: string = this.pebEnvService.businessId ): Observable<any> {
    return this.httpClient.patch(
      `${this.peMessageApiPath}/api/business/${business}/messaging/channel/${channelId}`,
      channel,
    );
  }

  // Messaging - Pin

  allPinnedMessages(businessId = this.businessId, chatId: string): Observable<any> {
    return this.httpClient
      .get(`${this.peMessageApiPath}/api/business/${businessId}/chats/${chatId}/pinned-messages`)
      .pipe(catchError(error => of([])));
  }

  pinMessage(businessId = this.businessId, chatId: string, messageId: string, forAllUsers: boolean): Observable<any> {
    return this.httpClient.post(
      `${this.peMessageApiPath}/api/business/${businessId}/chats/${chatId}/messages/${messageId}/pin`,
      { messageId, forAllUsers },
    );
  }

  unpinMessage(businessId = this.businessId, chatId: string, messageId: string): Observable<any> {
    return this.httpClient.delete(
      `${this.peMessageApiPath}/api/business/${businessId}/chats/${chatId}/messages/${messageId}/pin`,
    );
  }

  // Messaging - Direct-chats
  public postDirectChat(chat: PeMessageDirectChat): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/direct-chat`, chat);
  }

  // Messaging - Group-chats
  public postGroupChat(chat: { title: string; description: string; photo: string }): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/group`, chat);
  }

  public patchGroupChat(groupId: string, chat: { description: string; photo: string }): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/group/${groupId}`, chat);
  }

  public patchGroupChatPermissions(
    groupId: string,
    permissions: {
      sendMessages: boolean;
      sendMedia: boolean;
      addMembers: boolean;
      pinMessages: boolean;
      changeGroupInfo: boolean;
    },
  ): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/group/${groupId}`, permissions);
  }

  // Messaging - Integration-channel
  public postIntegrationChannel(channel: PeMessageChannelInfo): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/integration-channel`, channel);
  }

  public getIntegrationChannel(businessId: string, channelId: string): Observable<any> {
    return this.httpClient
      .get(`${this.peMessageApiPath}/api/business/${businessId}/integration-channels/${channelId}`);
  }

  public patchIntegrationChannel(
    businessId: string,
    channelId: string,
    channel: PeMessageChannelInfo,
  ): Observable<PeMessageChannelInfo> {
    return this.httpClient.patch<PeMessageChannelInfo>(
      `${this.peMessageApiPath}/api/business/${businessId}/messaging/integration-channel/${channelId}`,
      channel,
    );
  }

  public getChatLocation(
    businessId: string,
    chatId: string,
    chat: PeMessageChat,
  ): Observable<PeMessageChannelInfo> {
    return this.httpClient.post<PeMessageChannelInfo>(
      `${this.peMessageApiPath}/api/folders/business/${businessId}/document/${chatId}/first-location`,
      {
        title: chat.title,
        type : chat.type,
      },
    );
  }

  // Messaging - Conversations
  private get conversationsPath(): string {
    return `${this.businessPath}/conversations`;
  }

  public postNotificationDisable(
    conversationId: string,
    config: { forever?: boolean; until?: Date },
  ): Observable<any> {
    return this.httpClient.post(`${this.conversationsPath}/${conversationId}/notification/disable`, config);
  }

  public postNotificationEnable(conversationId: string): Observable<any> {
    return this.httpClient.post(`${this.conversationsPath}/${conversationId}/notification/enable`, { });
  }

  // Channels
  public getChannel(channelId: string, type: PeMessageChatType): Observable<any> {
    return this.getConversation(channelId, type);
  }

  public getChannelList(): Observable<any> {
    return this.getAppsChannelList();
  }

  public deleteChannel(
    channelId: string,
    conversationType: PeMessageChatType,
    businessId = this.businessId,
  ): Observable<any> {
    return this.deleteAppConversation(channelId, conversationType, businessId);
  }

  // chat-invites
  public postChatInvites(chatId: string, invitation: PeMessageChatInvitation): Observable<PeMessageChatInvites> {
    return this.httpClient.post<PeMessageChatInvites>(`${this.chatsPath}/${chatId}/invites`, invitation);
  }

  public getChatInvites(chatId: string): Observable<PeMessageChatInvites> {
    return this.httpClient.get<PeMessageChatInvites>(`${this.chatsPath}/${chatId}/invites`);
  }

  // chat
  public postChat(chat: PeMessageChat): Observable<any> {
    return this.httpClient.post(`${this.messagingPath}/chat`, chat);
  }

  public patchChat(chat: PeMessageChat): Observable<any> {
    return this.httpClient.patch(`${this.messagingPath}/chat/${chat._id}`, chat);
  }

  public postChatInvite(chatId: string, userId: string): Observable<any> {
    return this.httpClient.post(`${this.chatsPath}/${chatId}/invite/${userId}`, null);
  }

  public getChatList(parentFolder?: string): Observable<any> {
    const filter = parentFolder ? `?filter=${JSON.stringify({ parentFolder })}` : '';

    return this.httpClient.get(`${this.chatsPath}${filter}`);
  }

  public getChat(chatId: string): Observable<any> {
    return this.getConversationById(chatId);
  }

  public deleteChat(chatId: string, conversationType: PeMessageChatType): Observable<any> {
    return this.deleteAppConversation(chatId, conversationType);
  }

  // group
  private get messagingGroupPath(): string {
    return  `${this.businessPath}/messaging/group`;
  }

  public postGroupInvite(chatId: string, userId: string): Observable<any> {
    return this.httpClient.post(`${this.businessPath}/groups/${chatId}/invite/${userId}`, null);
  }

  public getGroupList(parentFolder?: string): Observable<any> {
    const filter = parentFolder ? `?filter=${JSON.stringify({ parentFolder })}` : '';

    return this.httpClient.get(`${this.messagingGroupPath}${filter}`);
  }

  public getGroup(chatId: string): Observable<any> {
    return this.httpClient.get(`${this.messagingGroupPath}/${chatId}`);
  }

  public postGroup(chat: PeMessageChat): Observable<any> {
    return this.httpClient.post(this.messagingGroupPath, chat);
  }

  public patchGroup({ _id, title }: PeMessageChat): Observable<any> {
    return this.httpClient.patch(`${this.messagingGroupPath}/${_id}`, { title });
  }

  public deleteGroup(chatId: string): Observable<any> {
    return this.httpClient.delete(`${this.messagingGroupPath}/${chatId}`);
  }

  // chat-messages
  public postChatMessage(chatId: string, message: Partial<PeChatMessage>): Observable<any> {
    return this.httpClient.post(`${this.chatsPath}/${chatId}/messages`, message);
  }

  public getChatMessageList(chatId: string): Observable<any> {
    return this.httpClient.get(`${this.chatsPath}/${chatId}/messages`);
  }

  public patchChatMessage(chatId: string, { _id, content, status }: PeChatMessage): Observable<any> {
    return this.httpClient.patch(`${this.chatsPath}/${chatId}/messages/${_id}`, { content, status });
  }

  public deleteChatMessage(chatId: string, messageId: string): Observable<any> {
    return this.httpClient.delete(`${this.chatsPath}/${chatId}/messages/${messageId}`);
  }

  public postChatMessageMarked(chatId: string, messageId: string, marked: boolean): Observable<any> {
    return this.httpClient.post(`${this.chatsPath}/${chatId}/messages/${messageId}/marked`, { marked });
  }

  // chat-draft messages
  getChatDraftMessage(chatId: string, business: string): Observable<PeChatMessage[]> {
    return this.httpClient.get<PeChatMessage[]>(
      `${this.peMessageApiPath}/api/business/${business}/chats/${chatId}/messages/drafts`,
    );
  }

  postChatDraftMessage(chatId: string, business: string, message: PeChatMessage): Observable<any> {
    return this.httpClient.post(
      `${this.peMessageApiPath}/api/business/${business}/chats/${chatId}/messages/drafts`,
      message,
    );
  }

  updateChatDraftMessage(chatId: string, message: PeChatMessage, business: string): Observable<any> {
    return this.httpClient.patch(
      `${this.peMessageApiPath}/api/business/${business}/chats/${chatId}/messages/drafts/${message._id}`,
      message,
    );
  }

  deleteChatDraftMessage(chatId: string, messageId: string, business: string): Observable<PeChatMessage> {
    return this.httpClient.delete<PeChatMessage>(
      `${this.peMessageApiPath}/api/business/${business}/chats/${chatId}/messages/drafts/${messageId}`,
    );
  }

  // Contacts
  private get contactsPath(): string {
    return `${this.businessPath}/contacts`;
  }

  public postContact(contact: PeMessageContact): Observable<any> {
    return this.httpClient.post(this.contactsPath, contact);
  }

  public getContactList(
    filter?: { 'communications.identifier': string; 'communications.integrationName': string }[],
  ): Observable<any> {
    const queryParam = filter ? `?filter={"$or": ${JSON.stringify(filter)}}` : '';

    return this.httpClient.get(`${this.contactsPath}${queryParam}`);
  }

  public getContactsSearch(search: string): Observable<any> {
    const searchQuery = search ? `?search=${JSON.stringify({ search })}` : '';

    return this.httpClient.get(`${this.contactsPath}/search${searchQuery}`);
  }

  public patchContact(contact: PeMessageContact): Observable<any> {
    return this.httpClient.patch(`${this.contactsPath}/${contact._id}`, contact);
  }

  public deleteContact(contactId: string): Observable<any> {
    return this.httpClient.delete(`${this.contactsPath}/${contactId}`);
  }

  // users
  public getUserList(options = {}): Observable<any> {
    return this.httpClient.get(`${this.businessPath}/users`, this.makeParams(options));
  }

  public fetchGuestToken() {
    return this.httpClient.post(`${this.env.backend.auth}/api/guest-token`, {});
  }

  // subscriptions
  private get messageSubscriptionsPath(): string {
    return `${this.businessPath}/subscriptions`;
  }

  public getSubscriptionList(): Observable<PeMessageSubscription[]> {
    return this.httpClient.get<PeMessageSubscription[]>(this.messageSubscriptionsPath);
  }

  public getSubscriptionsAll(): Observable<PeMessageSubscriptionAll[]> {
    return this.httpClient.get<PeMessageSubscriptionAll[]>(`${this.messageSubscriptionsPath}/all`);
  }

  public patchSubscriptionInstall(integrationName: string): Observable<any> {
    return this.httpClient.patch(`${this.messageSubscriptionsPath}/${integrationName}/install`, null);
  }

  public patchSubscriptionUninstall(integrationName: string): Observable<any> {
    return this.httpClient.patch(`${this.messageSubscriptionsPath}/${integrationName}/uninstall`, null);
  }

  // settings
  public getSettings(businessId: string = this.businessId): Observable<any> {
    return this.httpClient.get(`${this.peMessageApiPath}/api/business/${businessId}/themes`);
  }

  public patchSettings(themeItem: PeMessageIntegrationThemeItem, themeId: string): Observable<any> {
    return this.httpClient.patch(`${this.businessPath}/themes/${themeId}`, themeItem);
  }

  public getBubble(businessId: string = this.businessId): Observable<any> {
    return this.httpClient.get(`${this.peMessageApiPath}/api/business/${businessId}/bubble`);
  }

  public patchBubble(bubble: PeMessageBubble): Observable<any> {
    return this.httpClient.patch(`${this.businessPath}/bubble`, bubble);
  }

  // business folders
  private get foldersPath(): string {
    return this.isPersonalMode
      ? `${this.peMessageApiPath}/api/folders/user/${this.currentUserId}`
      : `${this.peMessageApiPath}/api/folders/business/${this.businessId}`;
  }

  public createFolder(folder: PeMessageFolder): Observable<any> {
    return this.httpClient.post(this.foldersPath, folder);
  }

  public getFolderList(): Observable<any> {
    return this.httpClient.get(this.foldersPath);
  }

  public getFolderTree(): Observable<FolderItem[]> {
    return this.httpClient.get<FolderItem[]>(`${this.foldersPath}/tree`);
  }

  public getRootFolder(): Observable<FolderItem> {
    const postfixEndpoint = this.isPersonalMode ? '' : `/root-folder`;

    return this.httpClient.get<FolderItem>(`${this.foldersPath}${postfixEndpoint}`);
  }

  public updateFolder({ _id, ...folder }: PeMessageFolder): Observable<any> {
    return this.httpClient.patch(`${this.foldersPath}/folder/${_id}`, folder);
  }

  public deleteFolder(folderId: string): Observable<any> {
    return this.httpClient.delete(`${this.foldersPath}/folder/${folderId}`);
  }

  public updateFolderPosition(positions: FolderPosition[]): Observable<FolderItem> {
    return this.httpClient.post<FolderItem>(`${this.foldersPath}/update-positions`, { positions });
  }

  public getFolderDocuments(folderId?: string, rootFolderId?: string): Observable<any> {
    const documents = folderId !== rootFolderId ? `folder/${folderId}/documents` : 'root-documents';

    return this.httpClient.get(`${this.foldersPath}/${documents}`);
  }

  public addLocation(conversationId: string, chat: PeMessageChat, parentFolderId: string): Observable<any> {
    if (!chat.locations[0]?._id) {
      return this.getChatLocation(this.businessId, conversationId, chat).pipe(
        switchMap(data => {
          const fromLocationId = `?from=${data._id}`;

          return this.httpClient
            .post(`${this.foldersPath}/document/${conversationId}/locations${fromLocationId}`, { parentFolderId });
        }),
      );
    }
    const fromLocationId = `?from=${chat.locations[0]?._id}`;

    return this.httpClient
      .post(`${this.foldersPath}/document/${conversationId}/locations${fromLocationId}`, { parentFolderId });
  }

  public removeLocation(conversationId: string, folderId: string): Observable<any> {
    return this.httpClient.delete(`${this.foldersPath}/document/${conversationId}/locations/${folderId}`);
  }

  public moveToFolder(documentId: string, folderId?: string, rootFolderId?: string): Observable<any> {
    const moveTo = folderId !== rootFolderId ? `move-to-folder/${folderId}` : 'move-to-root';

    return this.httpClient.post(`${this.foldersPath}/document/${documentId}/${moveTo}`, { });
  }

  public searchDocuments(filter = ''): Observable<any> {
    return this.httpClient.post(`${this.foldersPath}/search`, { });
  }

  // bots
  private get messageBotsPath(): string {
    return `${this.businessPath}/bots`;
  }

  public getBotList(): Observable<any> {
    return this.httpClient.get(this.messageBotsPath);
  }

  public getBot(app: string): Observable<any> {
    return this.httpClient.get(`${this.messageBotsPath}/${app}`);
  }

  public getBotMessageList(app: string): Observable<any> {
    return this.httpClient.get(`${this.messageBotsPath}/${app}/messages`);
  }

  public postBotMessage(app: string, messageContent: string): Observable<any> {
    const bot = { bot: app, business: this.businessId, content: messageContent };

    return this.httpClient.post(`${this.messageBotsPath}/${app}/messages`, bot);
  }

  public patchBotMessage(app: string, message: PeChatMessage): Observable<any> {
    const bot = { bot: app, business: this.businessId, content: message.content };

    return this.httpClient.patch(`${this.messageBotsPath}/${app}/messages/${message._id}`, bot);
  }

  public deleteBotMessage(app: string, messageId: string): Observable<any> {
    return this.httpClient.delete(`${this.messageBotsPath}/${app}/messages/${messageId}`);
  }

  //
  // PE PRODUCTS
  //

  public getProductCheckoutLink(body: { productIds: string[]; type: string; }): Observable<any> {
    return this.httpClient.post(`${this.peProductsApiPath}/product/checkout/${this.businessId}/link`, body);
  }

  public getProductList(): Observable<any> {
    const query = `{
      getProducts(
        businessUuid: "${this.businessId}",
        pageNumber: 1,
        paginationLimit: 100,
      ) {
        products {
          images
          _id
          title
          description
          price
          salePrice
          currency
          active
          categories { id title }
        }
      }
    }`;

    return this.httpClient
      .post(`${this.peProductsApiPath}/products`, { query })
      .pipe(map((response: any) => response.data.getProducts.products));
  }

  public getChannelSetByBusiness(): Observable<any> {
    const query = `{
      getChannelSetByBusiness(
        businessId: ${this.businessId}
      ) {
        id
        name
        type
        active
        business
        enabledByDefault
        customPolicy
        policyEnabled
        originalId
      }
    }`;

    return this.httpClient
      .post(`${this.peProductsApiPath}/channelset`, { query })
      .pipe(map((response: any) => response.data.getChannelSetByBusiness));
  }

  // media

  postMedia(file: File, type: FileUploadTypes): Observable<any> {
    const formData = new FormData();
    formData.set('file', file);

    return this.httpClient.post(
      `${this.peMediaApiPath}/api/${type}/business/${this.businessId}/message`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  postFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.set('file', file);

    return this.httpClient.post(
      `${this.peMediaApiPath}/api/file/business/${this.businessId}/message/application/${this.applicationId}`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  public postVideo(file: File): Observable<any> {
    const formData = new FormData();
    formData.set('file', file);

    return this.httpClient.post(
      `${this.peMediaApiPath}/api/video/business/${this.businessId}/message`,
      formData,
      { reportProgress: true, observe: 'events' },
    );
  }

  // for boxes
  public getCheckout(): Observable<any> {
    return this.httpClient
      .get(`${this.env.backend.checkout}/api/business/${this.businessId}/checkout`)
      .pipe(catchError(() => of([])));
  }

  public getShop(): Observable<any> {
    return this.httpClient
      .get(`${this.env.backend.shop}/api/business/${this.businessId}/shop`)
      .pipe(catchError(() => of([])));
  }

  public getSite(): Observable<any> {
    return this.httpClient
      .get(`${this.env.backend.site}/api/business/${this.businessId}/site`)
      .pipe(catchError(() => of([])));
  }

  /* Rules */
  private get rulesPath(): string {
    return `${this.peMessageApiPath}/api/rules/business/${this.businessId}`;
  }

  public getRulesValues(): Observable<RuleValues> {
    return this.httpClient.get<RuleValues>(`${this.peMessageApiPath}/api/rules/values`);
  }

  public getRules(): Observable<any> {
    return this.httpClient.get(this.rulesPath);
  }

  public createRule(rule): Observable<any> {
    return this.httpClient.post(this.rulesPath, rule);
  }

  public updateRule(rule, ruleId: string): Observable<any> {
    return this.httpClient.patch(`${this.rulesPath}/rule/${ruleId}`, rule);
  }

  public deleteRule(ruleId: string): Observable<any> {
    return this.httpClient.delete(`${this.rulesPath}/rule/${ruleId}`);
  }

  public getRuleDetails(ruleId: string): Observable<any> {
    return this.httpClient.get(`${this.rulesPath}/rule/${ruleId}`);
  }

  private makeParams({ filters }: any) {
    let params = new HttpParams();
    filters && params.append('filter', JSON.stringify(filters));

    return { params };
  }

  public getClientMessageUrl(): string {
    const currentModePath = this.isPersonalMode
      ? `/personal/${this.currentUserId}`
      : `/business/${this.pebEnvService.businessId}`;

    return `${currentModePath}/message`;
  }

  private getBackendMessageUrl() {
    return this.isPersonalMode
      ? `${this.peMessageApiPath}/api`
      : this.businessPath;
  }

  private getBackendMessagingChannelUrl(appType = 'channel', id = '') {
    return this.getBackendMessageUrl() + `/messaging/${appType}${this.isPersonalMode?'s':''}` + (id ? `/${id}` : '');
  }
}
