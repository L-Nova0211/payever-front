import { Injectable } from '@angular/core';
import { Action, Selector, State, StateContext } from '@ngxs/store';

import * as ContactsActions from './contacts.action';

const contactsStateName = 'contactsStateName';

export interface ContactsStateModel {
  contacts: any;
}

@State<ContactsStateModel>({
  name: contactsStateName,
  defaults: {
    contacts: [],
  },
})
@Injectable()
export class ContactsState {
  @Selector()
  static contacts(state: ContactsStateModel): any {
    return state.contacts;
  }

  @Action(ContactsActions.SaveContacts)
  savecontacts(
    ctx: StateContext<ContactsStateModel>,
    action: ContactsActions.SaveContacts
  ) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      contacts: action.payload,
    });
  }

  @Action(ContactsActions.ClearContacts)
  clearcontacts(ctx: StateContext<ContactsStateModel>) {
    const state = ctx.getState();
    ctx.setState({
      ...state,
      contacts: [],
    });
  }
}
