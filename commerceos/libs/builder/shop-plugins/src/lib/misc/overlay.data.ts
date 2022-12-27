import { InjectionToken } from '@angular/core';
import { Subject } from 'rxjs';

import { PebEditorState } from '@pe/builder-core';
import { PebEditorStore } from '@pe/builder-services';

import { OverlayShopDataValue } from './types';

export interface OverlayShopData {
  emitter: Subject<OverlayShopDataValue>;
  data: any | PebEditorState | PebEditorStore;
}
export const OVERLAY_SHOP_DATA = new InjectionToken<OverlayShopData>('OVERLAY_SHOP_DATA');
