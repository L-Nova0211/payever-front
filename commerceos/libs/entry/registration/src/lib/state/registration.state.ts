import { Injectable } from '@angular/core';
import { Action, State, StateContext } from '@ngxs/store';

import { PeAuthService } from '@pe/auth';

@State()
@Injectable()
export class RegistrationState {
  constructor(private authService: PeAuthService) {}

  @Action(NotificationActions.Fetch)
  fetchNotifications(
    ctx: StateContext<NotificationsResponseInterface>,
    { notifications, total }: NotificationsResponseInterface,
  ) {
    ctx.patchState({ notifications, total });
  }
}
