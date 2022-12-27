export class PebSelectAction {
  static readonly type = '[Peb/Selection] Select Elements';
  constructor(public payload: string | string[]) { }
}

export class PebDeselectAllAction {
  static readonly type = '[Peb/Selection] Deselect All';
}

export class PebOpenGroupAction {
  static readonly type = '[Peb/Selection] Select Group';
  constructor(public payload: string) { }
}

export class PebCloseGroupAction {
  static readonly type = '[Peb/Selection] Deselect Group';
}
