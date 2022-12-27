import { PebShapesShape } from '@pe/builder-core';

export class PebUndoAction {
  static type = '[Editor] Undo';
}

export class PebRedoAction {
  static type = '[Editor] Redo';
}

export class PebInsertAction {
  static type = '[Editor] Insert';

  constructor(public payload?: PebShapesShape) {
  }
}

export class PebCopyAction {
  static type = '[Editor] Copy';
}

export class PebPasteAction {
  static type = '[Editor] Paste';
}

export class PebDeleteAction {
  static type = '[Editor] Delete';
}

export class PebGroupAction {
  static type = '[Editor] Group';
}

export class PebUngroupAction {
  static type = '[Editor] Ungroup';
}
