import { ConnectionPositionPair } from '@angular/cdk/overlay';
import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';

import { PebEditorState, PebElementType, PebLanguage, PebScreen } from '@pe/builder-core';
import { EditorSidebarTypes, PebEditorStore } from '@pe/builder-services';

export interface ObjectCategory {
  type: PebElementType;
  variant?: string;
  style?: any;
  icon?: string;
  data?: any;
  setAfter?: boolean;
}

export type OverlayDataValue =
  ObjectCategory
  | PebScreen
  | EditorSidebarTypes
  | number
  | PebLanguage;
export interface OverlayData<T = OverlayDataValue> {
  emitter: Subject<T>;
  data: any | PebEditorState | PebEditorStore;
}
export const OVERLAY_DATA = new InjectionToken<OverlayData>('OVERLAY_DATA');

export const OVERLAY_POSITIONS: ConnectionPositionPair[] = [
  {
    originX: 'start',
    originY: 'bottom',
    overlayX: 'start',
    overlayY: 'top',
  },
  {
    originX: 'start',
    originY: 'top',
    overlayX: 'start',
    overlayY: 'bottom',
  },
  {
    originX: 'end',
    originY: 'bottom',
    overlayX: 'end',
    overlayY: 'top',
  },
  {
    originX: 'end',
    originY: 'top',
    overlayX: 'end',
    overlayY: 'bottom',
  },
];
