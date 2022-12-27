
export enum NotificationMessageNameEnum {
  CONNECT = 'connect',
  NOTIFICATIONS = 'notifications',
}

interface ActionInterface {
  name: string;
  type: string;
  url?: string;
}

export interface NotificationInterface {
  uuid: string;
  created_at: Date;
  logo: string;
  headline: string;
  subline: string;
  actions: ActionInterface[];
  source: string;
  viewed: boolean;
}

export interface PayloadInterface {
  id: string;
  kind: string;
  entity: string;
  app: string;
  token: string;
}

export interface NotificationRawInterface {
  _id: string;
  app: string;
  entity: string;
  kind: string;
  message: string;

  data?: any;
  params?: any;
}

export interface NotificationsMessage {
  name: string;
  notifications: NotificationRawInterface[];
  result: boolean;
}

export interface NotificationSocket extends WebSocket {
  connectionId: string;
  appName: string;
  entity: string;
}
