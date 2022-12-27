import { PeDataGridItem } from '@pe/common';

export class InitLoadFolders {
  static readonly type = '[Products/API] Init Load Folders';
  constructor(public data: any, public group: boolean) {}
}

export class PopupMode {
  static readonly type = '[Products/API] Popup Mode';
  constructor(public trigger: boolean) {}
}

export class AddItems {
  static readonly type = '[Products/API] Add Items';
  constructor(public items: any[]) {}
}

export class OpenFolder {
  static readonly type = '[Products/API] open Folder';
  constructor(public items: PeDataGridItem[]) {}
}

export class DeleteItems {
  static readonly type = '[Products/API] Delete Items';
  constructor(public items: string[]) {}
}

export class AddItem {
  static readonly type = '[Products/API] Add Item';
  constructor(public item: any) {}
}

export class AddFolder {
  static readonly type = '[Products/API] Add Folder';
  constructor(public item: any) {}
}

export class EditItem {
  static readonly type = '[Products/API] Edit Item';
  constructor(public item: any) {}
}

export class ClearStore {
  static readonly type = '[Products/API] Clear Store';
}
export class GroupStore {
  static readonly type = '[Products/API] Grouping Store';
  constructor(public order: string = '', public group: boolean = false) {}
}

export class SortStore {
  static readonly type = '[Products/API] Sorting Store';
  constructor(public group: boolean = false) {}
}

export class AddProducts {
  static readonly type = '[Products/API] Add Products';
  constructor(public items: any[]) {}
}
