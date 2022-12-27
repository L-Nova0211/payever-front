export class AddItems {
  static readonly type = '[Shipping/API] Add Items';
  constructor(public items: any[]) { }
}

export class AddZonesItems {
  static readonly type = '[Shipping/API] Add Zones Items';
  constructor(public items: any[]) { }
}

export class AddPackageItems {
  static readonly type = '[Shipping/API] Add Zones Items';
  constructor(public items: any[]) { }
}

export class ClearStore {
  static readonly type = '[Shipping/API] Clear Store';
}

export class OpenFolder {
  static readonly type = '[Shipping/API] Open Folder';
  constructor(public items: any[]) { }
}

export class OpenZonesFolder {
  static readonly type = '[Shipping/API] Open Zones Folder';
  constructor(public items: any[]) { }
}

export class OpenPackageFolder {
  static readonly type = '[Shipping/API] Open Package Folder';
  constructor(public items: any[]) { }
}


