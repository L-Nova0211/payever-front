import { PeMessageSettings, PeMessageIntegrationThemeItem, PeMessageSubscription } from '../interfaces';
import { PeMailConfig } from '../modules/editor';

export enum MessageActions {
  SetMessageOverlayStatus = '[@pe/message] SetMessageOverlayStatus',
  SetRecipientEmails = '[@pe/message] SetRecipientEmails',
  SetMailConfig = '[@pe/message] SetMailConfig',
  InitMessageSettings = '[@pe/message] init message settings',
  SetCurrentMessageSettings = '[@pe/message] set current message settings',
  SetSubscriptionList = '[@pe/message] set subscription list',
}

export class SetSubscriptionList {
  static type = MessageActions.SetSubscriptionList;

  constructor(public subscriptionList: PeMessageSubscription[]) { }
}

export class SetMessageOverlayStatus {
  static type = MessageActions.SetMessageOverlayStatus;

  constructor(public overlayStatus: string) { }
}

export class InitMessageSettings {
  static type = MessageActions.InitMessageSettings;

  constructor(public settings: PeMessageSettings) { }
}

export class SetCurrentMessageSettings {
  static type = MessageActions.SetCurrentMessageSettings;

  constructor(public currSettings: PeMessageIntegrationThemeItem) { }
}

export class SetRecipientEmails {
  static type = MessageActions.SetRecipientEmails;

  constructor(public recipientEmails: string[]) {}
}

export class SetMailConfig {
  static type = MessageActions.SetMailConfig;

  constructor(public mailConfig: PeMailConfig) {}
}
