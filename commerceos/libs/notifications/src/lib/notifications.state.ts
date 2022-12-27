import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';

import { Fetch } from './notification.actions';
import { MessageNameEnum, NotificationsResponseInterface } from './notification.interfaces';
@State<NotificationsResponseInterface>({
  name: MessageNameEnum.GET_NOTIFICATIONS,
})
@Injectable()
export class NotificationsState {

  constructor() {
  }

  @Action(Fetch)
  fetchNotifications(
    ctx: StateContext<NotificationsResponseInterface>,
    { notifications, total }: NotificationsResponseInterface,
  ) {
    ctx.patchState({ notifications, total });
  }
}
