import { PeDataGridItem } from '@pe/common';

export class InitLoadFolders {
  static readonly type = '[Contacts/API] Init Load Folders';
  constructor(public data: any, public group: boolean) { }
}

export class AddItems {
  static readonly type = '[Contacts/API] Add Items';
  constructor(public items: any[]) { }
}

export class AddContacts {
  static readonly type = '[Contacts/API] Add Contacts';
  constructor(public items: any[]) {}
}

export class ClearContacts {
  static readonly type = '[Contacts/API] Clear Contacts';
}

export class PopupMode {
  static readonly type = '[Contacts/API] Popup Mode';
  constructor(public trigger: boolean) {}
}

export class OpenFolder {
  static readonly type = '[Contacts/API] open Folder';
  constructor(public items: PeDataGridItem[]) { }
}

export class DeleteItems {
  static readonly type = '[Contacts/API] Delete Items';
  constructor(public items: string[]) { }
}

export class AddItem {
  static readonly type = '[Contacts/API] Add Item';
  constructor(public item: any) { }
}

export class AddFolder {
  static readonly type = '[Contacts/API] Add Folder';
  constructor(public item: any) { }
}

export class EditItem {
  static readonly type = '[Contacts/API] Edit Item';
  constructor(public item: any) { }
}

export class ClearStore {
  static readonly type = '[Contacts/API] Clear Store';
}
export class GroupStore {
  static readonly type = '[Contacts/API] Grouping Store';
  constructor(public order: string = '', public group: boolean = false) { }
}

export class SortStore {
  static readonly type = '[Contacts/API] Sorting Store';
  constructor(public group: boolean = false) { }
}
