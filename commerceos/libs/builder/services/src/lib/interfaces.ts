import {
  PebContextSchema,
  PebElementDef,
  PebElementId,
  PebElementKit,
  PebElementStyles,
  PebScreen,
  PebThemeDetailInterface,
} from '@pe/builder-core';

export interface PebDeleteElement {
  element: PebElementDef;
  styles: { [screenId: string]: PebElementStyles };
  contextSchema: PebContextSchema;
}

export interface PebPasteElement {
  parentId: PebElementId;
  elementDef: PebElementKit;
  childIds?: PebElementId[];
  styleMap?: { from: PebElementId, to: PebElementId }[];
  beforeId?: PebElementId;
}

export interface PebElementsClipboard {
  elements: PebElementKit[];
  fromScreen: PebScreen;
}

export interface PebActionResponse {
  snapshot: PebThemeDetailInterface;
  progress: number;
}
