import { PeDataGridItem } from '@pe/common';

export class InitLoadFolders {
  static readonly type = '[Invoices/API] Init Load Folders';
  constructor(public data: any, public group: boolean) { }
}

export class AddItems {
  static readonly type = '[Invoices/API] Add Items';
  constructor(public items: any[]) { }
}

export class OpenFolder {
  static readonly type = '[Invoices/API] open Folder';
  constructor(public items: PeDataGridItem[]) { }
}

export class DeleteItems {
  static readonly type = '[Invoices/API] Delete Items';
  constructor(public items: string[]) { }
}

export class AddItem {
  static readonly type = '[Invoices/API] Add Item';
  constructor(public item: any) { }
}

export class AddFolder {
  static readonly type = '[Invoices/API] Add Folder';
  constructor(public item: any) { }
}

export class EditItem {
  static readonly type = '[Invoices/API] Edit Item';
  constructor(public item: any) { }
}

export class ClearStore {
  static readonly type = '[Invoices/API] Clear Store';
}
export class GroupStore {
  static readonly type = '[Invoices/API] Grouping Store';
  constructor(public order: string = '', public group: boolean = false) { }
}

export class SortStore {
  static readonly type = '[Invoices/API] Sorting Store';
  constructor(public group: boolean = false) { }
}

export class InitLoadInvoiceFolders {
  static readonly type = '[Invoice/API] Init Invoice Load Folders';
  constructor(public data: any, public group: boolean) { }
}

export class InitLoadCurrencies {
  static readonly type = '[Invoice/API] Init Invoice Load currencies';
  constructor(public data: any) { }
}
export class InitLoadLanguages {
  static readonly type = '[Invoice/API] Init Invoice Load languages';
  constructor(public data: any) { }
}

export class FilterInvoiceStore {
  static readonly type = '[Invoice/API] Filtering Invoice Store';
  constructor(public field: string = '', public value: any = '') { }
}

export class FilterStore {
  static readonly type = '[Invoice/API] Filter value Store';
  constructor(public field: any[]) { }
}

export class OrderStore {
  static readonly type = '[Invoice/API] Order value Store';
  constructor(public order: string = 'asc') { }
}

export class UpsertItem {
  static readonly type = '[Invoice/API] Add Invoice';
  constructor(public item: any) { }
}

export class DeleteInvoices {
  static readonly type = '[Invoice/API] Delete Invoices';
  constructor(public items: string[]) { }
}
