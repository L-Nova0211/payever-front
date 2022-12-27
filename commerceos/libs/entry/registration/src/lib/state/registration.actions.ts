export class Fetch {
  static type = MessageNameEnum.GET_NOTIFICATIONS;

  constructor(public event: MessageNameEnum, public data: ConnectPayloadInterface) {
  }
}
