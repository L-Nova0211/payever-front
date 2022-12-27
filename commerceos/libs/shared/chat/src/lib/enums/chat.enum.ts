
  export enum PeMessageUserRole {
    WHATSAPPADMIN = 'whatsappadmin',
    WHATSAPPUSER = 'whatsappuser',
  }

  export enum PeMessageUserStatus {
    Busy = 'busy',
    Offline = 'offline',
    Online = 'online',
  }

  export enum PeMessageChatType {
    AppChannel = 'app-channel',
    DirectChat = 'direct-chat',
    Channel = 'channel',
    Chat = 'chat',
    Email = 'email',
    Group = 'group',
    IntegrationChannel = 'integration-channel',
  }


  export enum PeChatMessageType {
    Attachment = 'attachment',
    Box = 'box',
    DateSeparator = 'date-seperator',
    Default = 'default',
    File = 'file',
    Link = 'link',
    NavigateTo = 'navigateTo',
    Template = 'template',
    Text = 'text',
    WelcomeMessage = 'welcome-message',
    Event = 'event',
  }

  export enum PeChatChannelMenuItem {
    FacebookMessenger = 'facebook-messenger',
    Instagram = 'instagram-messenger',
    LiveChat = 'live-chat',
    WhatsApp = 'whatsapp',
  }

  export enum PeMessageIntegration {
    Bot = 'bot',
    Email = 'email',
    FacebookMessenger = 'facebook-messenger',
    InstagramMessenger = 'instagram-messenger',
    Internal = 'internal',
    LiveChat = 'live-chat',
    Payever = 'payever',
    Telegram = 'telegram',
    WhatsApp = 'whatsapp',
  }
