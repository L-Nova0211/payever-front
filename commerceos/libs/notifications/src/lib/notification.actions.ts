import { ConnectPayloadInterface, MessageNameEnum } from './notification.interfaces';

export class Connect {
  static type = MessageNameEnum.EVENT_CONNECTION;

  constructor(public event: MessageNameEnum, public data: ConnectPayloadInterface) {
  }
}

export class Delete {
  static type = MessageNameEnum.DELETE_NOTIFICATION;

  constructor(public from: string, public message: string) {
  }
}

export class Fetch {
  static type = MessageNameEnum.GET_NOTIFICATIONS;

  constructor(public event: MessageNameEnum, public data: ConnectPayloadInterface) {
  }
}
