import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import { PeMessageSettings, PeMessageIntegrationThemeItem, PeMessageSubscription } from '../interfaces';
import { PeMailConfig } from '../modules/editor';

import {
  SetMessageOverlayStatus,
  SetRecipientEmails,
  SetMailConfig,
  InitMessageSettings,
  SetCurrentMessageSettings, SetSubscriptionList,
} from './message.actions';

const messageStateName = 'peMessageState';

export interface PeMessageState {
  overlayStatus: string;
  settings: PeMessageSettings,
  currSettings: PeMessageIntegrationThemeItem,
  mailConfig: PeMailConfig;
  subscriptionList: PeMessageSubscription[];
}

@State<PeMessageState>({
  name: messageStateName,
  defaults: {
    overlayStatus: null,
    settings: null,
    currSettings: null,
    mailConfig: {
      recipients: null,
      sender: null,
      subject: null,
      testMailRecipient: null,
    },
    subscriptionList: null,
  },
})
@Injectable()
export class MessageState {
  @Selector()
  static subscriptionList(state: PeMessageState): PeMessageSubscription[] {
    return state.subscriptionList;
  }

  @Selector()
  static messageOverlayStatus(state: PeMessageState): string {
    return state.overlayStatus;
  }

  @Selector()
  static messageSettings(state: PeMessageState): PeMessageSettings {
    return { ...state.settings };
  }

  @Selector()
  static messageCurrentSettings(state: PeMessageState): PeMessageIntegrationThemeItem {
    return { ...state.currSettings };
  }

  @Selector()
  static recipientEmails(state: PeMessageState): string[] {
    return state.mailConfig.recipients;
  }

  @Selector()
  static mailConfig(state: PeMessageState): PeMailConfig {
    return state.mailConfig;
  }

  @Action(SetSubscriptionList)
  setSubscriptionList(ctx: StateContext<PeMessageState>, { subscriptionList }: SetSubscriptionList) {
    ctx.patchState({
      subscriptionList: subscriptionList,
    });
  }

  @Action(SetMessageOverlayStatus)
  setMessageOverlayStatus(ctx: StateContext<PeMessageState>, { overlayStatus }: SetMessageOverlayStatus) {
    ctx.patchState({
      overlayStatus: overlayStatus,
    });
  }

  @Action(InitMessageSettings)
  initMessageSettings(ctx: StateContext<PeMessageState>, { settings }: InitMessageSettings) {
    ctx.patchState({
      settings: settings,
    });
  }

  @Action(SetCurrentMessageSettings)
  setCurrentMessageSettings(ctx: StateContext<PeMessageState>, { currSettings }: SetCurrentMessageSettings) {
    ctx.patchState({
      currSettings: currSettings,
    });
  }

  @Action(SetRecipientEmails)
  setRecipientEmails(ctx: StateContext<PeMessageState>, { recipientEmails }: SetRecipientEmails) {
    ctx.patchState({
      mailConfig: {
        ...ctx.getState().mailConfig,
        recipients: recipientEmails,
      },
    });
  }

  @Action(SetMailConfig)
  setMailConfig(ctx: StateContext<PeMessageState>, { mailConfig }: SetMailConfig) {
    ctx.patchState({
      mailConfig: { ...mailConfig },
    });
  }
}
