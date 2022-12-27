export enum ContactsActions {
  SaveContacts = '[@pe/apps/contacts] SaveContacts',
  ClearContacts = '[@pe/apps/contacts] ClearContacts',
}

export class SaveContacts {
  static type = ContactsActions.SaveContacts;

  constructor(public payload: any) {}
}

export class ClearContacts {
  static type = ContactsActions.ClearContacts;

  constructor(public payload: any) {}
}
