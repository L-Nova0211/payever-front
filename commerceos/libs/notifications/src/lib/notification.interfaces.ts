export enum MessageNameEnum {
  EVENT_CONNECTION = 'EventConnection',
  GET_NOTIFICATIONS = 'GetNotifications',
  DELETE_NOTIFICATION = 'DeleteNotification'
}

export interface SubscriptionGroupInterface {
  name: string;
  subscriptions: string[];
  common: boolean;
}

export interface NotificationGroupInterface {
  entity: string;
  kind: string;
  app: string;
}

export interface MessageResponseInterface {
  name: string;
  result: boolean;
}

export interface NotificationsResponseInterface extends MessageResponseInterface {
  notifications?: NotificationInterface[];
  total?: number;
}

export interface NotificationInterface extends NotificationGroupInterface {
  message: string;
  data: Record<string, unknown>;
}

export interface ConnectPayloadInterface extends NotificationGroupInterface {
  id?: string;
  token: string;
}

export interface ConnectResponseInterface extends MessageResponseInterface {
  id?: string;
}

